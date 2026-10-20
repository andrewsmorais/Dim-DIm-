// "Cérebro" da Jaki no WhatsApp: decide o que fazer com UMA mensagem já liberada pelo gate (número conhecido,
// assinatura ativa, dentro do limite do dia). Não grava nada: devolve um plano (WaPlan) que o worker salva,
// executa pela função do banco `whatsapp_run_op` (idempotente) e transforma em resposta.
//
// Mesmo motor do Chat IA do app (chatPrompt + chatContext + validação), com o canal WhatsApp.
// Segurança: quem é "a pessoa" vem do número vinculado (`userId`), nunca do texto; todo dado lido é filtrado à casa dela.
import OpenAI from 'openai';
import type { SupabaseClient } from '@supabase/supabase-js';
import { buildChatSystemPrompt } from '@/lib/chatPrompt';
import { buildChatContext, type ChatScope } from '@/lib/chatContext';
import { parseWhatsAppOutput, sanePastDate, WRITE_REFUSED_REPLY, type WaParsed } from '@/lib/whatsappActions';
import { findCategory, runQueries, type CatRow } from '@/lib/whatsappQueries';
import { composeOutgoing, type WaItem, type WaOp, type WaPlan } from '@/lib/whatsappReply';
import { interactiveReplyId, parseButtonId, setCategoryId } from '@/lib/whatsappButtons';
import { brlText, norm, toWhatsAppText } from '@/lib/whatsappFormat';

export type InboundMessage = {
  type?: string;
  text?: { body?: string };
  interactive?: { type?: string; button_reply?: { id?: string }; list_reply?: { id?: string } };
};

export type ChatTurn = { role: 'user' | 'assistant'; content: string };
/** Chamada ao modelo. Em produção é a OpenAI; nos testes entra uma função de mentira (nenhum custo, resultado previsível). */
export type Complete = (system: string, history: ChatTurn[], user: string) => Promise<string | null | undefined>;

export type BrainInput = { admin: SupabaseClient; userId: string; message: InboundMessage; today: string; complete?: Complete };

const openaiComplete: Complete = async (system, history, user) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20_000, maxRetries: 1 });
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: 700,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: system }, ...history, { role: 'user', content: user }],
  });
  return completion.choices[0]?.message?.content;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Acima disto a Jaki pergunta antes de gravar (decisão D3 do plano). */
export const CONFIRM_ABOVE = 1000;
const PENDING_TEXT_WINDOW_MIN = 30; // "sim" digitado só vale para um pedido recente
const HISTORY_HOURS = 12;
const HISTORY_MESSAGES = 6;

const UNDO_TEXT = /^(desfaz(er)?|desfaca|apaga(r)? (o |a )?(ultim[oa])|cancela(r)? (o |a )?(ultim[oa])|remove(r)? (o |a )?(ultim[oa]))( (lancamento|gasto|conta|registro|despesa|receita))?[ .!]*$/;
const YES_TEXT = /^(sim|s|isso|confirmo|confirma|confirmar|pode|pode sim|ok|certo|beleza|blz|vai|manda ver)[ .!]*$/;
const NO_TEXT = /^(nao|n|cancela|cancelar|deixa|deixa pra la|esquece|nada)[ .!]*$/;

export const isUndoText = (t: string) => UNDO_TEXT.test(norm(t));
export const isYesText = (t: string) => YES_TEXT.test(norm(t));
export const isNoText = (t: string) => NO_TEXT.test(norm(t));

/** Recusa mensagem vazia ou enorme antes de gastar IA. */
const MAX_TEXT = 1000;

export function itemsNeedConfirmation(items: WaItem[], askConfirmation: boolean): boolean {
  return (
    askConfirmation ||
    items.some((i) => i.kind === 'bill' || i.kind === 'goal' || (i.kind === 'transaction' && i.amount > CONFIRM_ABOVE))
  );
}

/** A IA diz "anotei/registrei/criei" sem ter gravado nada: troca por um aviso honesto. */
const FALSE_CLAIM = /\b(anotei|anotado|registrei|registrado|lancei|lancado|salvei|salvo|criei|criado|apaguei|desfiz|corrigi)\b/;
export const NOT_RECORDED_REPLY = 'Não consegui anotar isso. Manda de novo com o valor, tipo: gastei 35 no almoço.';

function plan(p: Omit<WaPlan, 'v' | 'historyText'> & { historyText?: string }): WaPlan {
  const base: WaPlan = { ...p, v: 2, historyText: p.historyText ?? '' };
  if (!base.historyText) {
    // Texto que a Jaki "disse", para a memória curta: o mesmo que a pessoa vê, sem botões.
    const preview = composeOutgoing({
      ...base,
      result: base.op.t === 'pending' ? { status: 'ok', pending_id: 'x' } : { status: 'ok', group: 'x' },
    });
    base.historyText = preview.text;
  }
  return base;
}

// ---------------------------------------------------------------------------
// Leitura de dados da casa (sempre filtrada)
// ---------------------------------------------------------------------------

export async function householdIds(admin: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await admin.rpc('whatsapp_household_ids', { p_user: userId });
  if (error) throw new Error('Falha ao ler a casa da pessoa');
  const ids = ((data ?? []) as (string | { whatsapp_household_ids?: string })[])
    .map((x) => (typeof x === 'string' ? x : x?.whatsapp_household_ids ?? ''))
    .filter((x) => UUID.test(x));
  return Array.from(new Set([userId, ...ids]));
}

async function loadCategories(admin: SupabaseClient, scope: ChatScope): Promise<CatRow[]> {
  const { data, error } = await admin.from('categories').select('id,name,type,parent_id')
    .or(`is_default.eq.true,user_id.in.(${scope.householdIds.join(',')})`).limit(1000);
  if (error) throw new Error('Falha ao ler as categorias');
  return (data ?? []) as CatRow[];
}

type PendingRow = { id: string; actions: WaItem[]; created_at: string };

async function latestOpenPending(admin: SupabaseClient, userId: string, withinMinutes?: number): Promise<PendingRow | null> {
  let q = admin.from('whatsapp_pending').select('id,actions,created_at').eq('user_id', userId).eq('status', 'open')
    .gt('expires_at', new Date().toISOString());
  if (withinMinutes) q = q.gt('created_at', new Date(Date.now() - withinMinutes * 60_000).toISOString());
  const { data } = await q.order('created_at', { ascending: false }).limit(1);
  return ((data ?? [])[0] as PendingRow | undefined) ?? null;
}

async function pendingById(admin: SupabaseClient, userId: string, id: string): Promise<PendingRow | null> {
  const { data } = await admin.from('whatsapp_pending').select('id,actions,created_at').eq('id', id).eq('user_id', userId).maybeSingle();
  return (data as PendingRow | null) ?? null;
}

/** Último lançamento criado por aqui (últimas 24 h, não desfeito): o alvo de "corrige pra 45". */
async function lastRecorded(admin: SupabaseClient, userId: string) {
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { data: acts } = await admin.from('whatsapp_actions').select('ref_id').eq('user_id', userId).eq('kind', 'transaction')
    .is('undone_at', null).gt('created_at', since).order('created_at', { ascending: false }).limit(1);
  const ref = (acts ?? [])[0]?.ref_id as string | undefined;
  if (!ref) return null;
  const { data: tx } = await admin.from('transactions').select('description,amount,date,type,category_id').eq('id', ref).eq('user_id', userId).maybeSingle();
  if (!tx) return null;
  let category: string | null = null;
  if (tx.category_id) {
    const { data: c } = await admin.from('categories').select('name').eq('id', tx.category_id).maybeSingle();
    category = (c as { name?: string } | null)?.name ?? null;
  }
  return { descricao: tx.description as string, valor: Number(tx.amount), data: tx.date as string, tipo: tx.type as string, categoria: category };
}

async function recentHistory(admin: SupabaseClient, userId: string): Promise<ChatTurn[]> {
  const since = new Date(Date.now() - HISTORY_HOURS * 3600_000).toISOString();
  const { data } = await admin.from('chat_history').select('message_role,content').eq('user_id', userId).gt('created_at', since)
    .order('created_at', { ascending: false }).limit(HISTORY_MESSAGES);
  return ((data ?? []) as { message_role: string; content: string }[])
    .filter((m) => m.message_role === 'user' || m.message_role === 'assistant')
    .reverse()
    .map((m) => ({ role: m.message_role as 'user' | 'assistant', content: String(m.content).slice(0, 500) }));
}

// ---------------------------------------------------------------------------
// Botões e atalhos (sem IA)
// ---------------------------------------------------------------------------

const confirmDisplay = (p: PendingRow | null): WaItem[] => (p && Array.isArray(p.actions) ? p.actions : []);

async function categoryChoice(admin: SupabaseClient, scope: ChatScope, userId: string, group: string, today: string): Promise<WaPlan> {
  const { data: act } = await admin.from('whatsapp_actions').select('ref_id').eq('user_id', userId).eq('wamid', group).eq('kind', 'transaction')
    .is('undone_at', null).order('idx').limit(1);
  const ref = (act ?? [])[0]?.ref_id as string | undefined;
  const { data: tx } = ref ? await admin.from('transactions').select('description,amount,type').eq('id', ref).eq('user_id', userId).maybeSingle() : { data: null };
  if (!tx) return plan({ today, op: { t: 'chat' }, reply: 'Não achei esse lançamento. Talvez ele já tenha sido desfeito.', userText: '' });

  const cats = (await loadCategories(admin, scope)).filter((c) => !c.parent_id && c.type === tx.type);
  // As mais usadas nos últimos 90 dias primeiro (a lista do WhatsApp aceita só 10 linhas).
  const since = new Date(Date.now() - 90 * 86400_000).toISOString().slice(0, 10);
  const { data: used } = await admin.from('transactions').select('category_id').in('user_id', scope.householdIds).eq('type', tx.type).gte('date', since).not('category_id', 'is', null).limit(1000);
  const count = new Map<string, number>();
  for (const r of (used ?? []) as { category_id: string }[]) count.set(r.category_id, (count.get(r.category_id) ?? 0) + 1);
  const rows = cats
    .sort((a, b) => (count.get(b.id) ?? 0) - (count.get(a.id) ?? 0) || a.name.localeCompare(b.name, 'pt-BR'))
    .slice(0, 10)
    .map((c) => ({ id: setCategoryId(group, c.id), title: c.name }));
  if (rows.length === 0) return plan({ today, op: { t: 'chat' }, reply: 'Você ainda não tem categorias para escolher. Crie no app, em Configurações.', userText: '' });
  return plan({
    today,
    op: { t: 'chat' },
    list: { text: `Qual categoria para *${tx.description}* · ${brlText(Number(tx.amount))}?`, button: 'Escolher', rows },
    userText: '',
    historyText: 'Perguntei qual categoria usar.',
  });
}

async function handleButton(input: BrainInput, scope: ChatScope, replyId: string): Promise<WaPlan> {
  const { admin, userId, today } = input;
  const action = parseButtonId(replyId);
  if (!action) return plan({ today, op: { t: 'chat' }, reply: 'Não entendi esse botão. Pode escrever o que você quer?', userText: '' });

  if (action.t === 'confirm') {
    const p = await pendingById(admin, userId, action.pendingId);
    return plan({ today, op: { t: 'confirm', pending_id: action.pendingId }, display: confirmDisplay(p), userText: '', historyText: 'Confirmado.' });
  }
  if (action.t === 'cancel') return plan({ today, op: { t: 'cancel', pending_id: action.pendingId }, userText: '', historyText: 'Cancelado.' });
  if (action.t === 'undo') return plan({ today, op: { t: 'undo', group: action.group }, userText: '', historyText: 'Desfeito.' });
  if (action.t === 'ask_category') return categoryChoice(admin, scope, userId, action.group, today);
  return plan({
    today,
    op: { t: 'update_last', group: action.group, patch: { category_id: action.categoryId } },
    userText: '',
    historyText: 'Categoria trocada.',
  });
}

// ---------------------------------------------------------------------------
// IA
// ---------------------------------------------------------------------------

function toItems(parsed: WaParsed, cats: CatRow[], today: string): WaItem[] {
  const items: WaItem[] = [];
  for (const t of parsed.txs) {
    const cat = t.category ? findCategory(cats.filter((c) => c.type === t.type && !c.parent_id), t.category) : null;
    items.push({
      kind: 'transaction', flow: t.type, amount: t.amount, description: t.description,
      category_id: cat?.id ?? null, category_name: cat?.name ?? null, date: sanePastDate(t.date, today),
    });
  }
  for (const b of parsed.bills) {
    items.push({ kind: 'bill', description: b.description, amount: b.amount, due_date: b.due_date, bill_kind: b.kind, recurrence: b.recurrence });
  }
  for (const g of parsed.goals) {
    items.push({ kind: 'goal', name: g.name, target_amount: g.target_amount, deadline: g.deadline ?? null });
  }
  return items;
}

async function askAI(input: BrainInput, scope: ChatScope, text: string): Promise<WaPlan> {
  const { admin, userId, today } = input;
  const [context, cats, history, last, pending] = await Promise.all([
    buildChatContext(admin, today, scope),
    loadCategories(admin, scope),
    recentHistory(admin, userId),
    lastRecorded(admin, userId),
    latestOpenPending(admin, userId),
  ]);

  const system = `${buildChatSystemPrompt('whatsapp')}\n\n# DADOS (JSON)\n${JSON.stringify({ ...context, contexto_whatsapp: { ultimo_lancamento: last, pendente_aguardando: Boolean(pending) } })}`;
  const content = await (input.complete ?? openaiComplete)(system, history, text);
  const parsed = parseWhatsAppOutput(content);
  const userText = text.slice(0, 500);

  // Consultas: o sistema calcula (a IA só escolheu qual).
  const prefix = parsed.queries.length ? await runQueries(admin, scope, today, parsed.queries, cats) : undefined;

  // 1. Corrigir o último lançamento.
  if (parsed.updateLast) {
    const u = parsed.updateLast;
    const patch: Extract<WaOp, { t: 'update_last' }>['patch'] = {};
    let note: string | undefined;
    if (u.amount !== undefined) patch.amount = u.amount;
    if (u.description !== undefined) patch.description = u.description;
    if (u.date !== undefined) patch.date = sanePastDate(u.date, today);
    if (u.category !== undefined) {
      const cat = findCategory(cats.filter((c) => !c.parent_id), u.category);
      if (cat) patch.category_id = cat.id;
      else note = `Não achei a categoria *${u.category}*. Mantive a anterior.`;
    }
    if (Object.keys(patch).length === 0) {
      return plan({ today, op: { t: 'chat' }, prefix, reply: note ?? 'Não entendi o que corrigir. Diga, por exemplo: corrige pra 45.', userText, historyText: note ?? 'Não entendi o que corrigir.' });
    }
    return plan({ today, op: { t: 'update_last', patch }, prefix, note, userText, historyText: 'Corrigi o último lançamento.' });
  }

  // 2. Gravar (ou pedir confirmação antes).
  const items = toItems(parsed, cats, today);
  if (items.length > 0) {
    const op: WaOp = itemsNeedConfirmation(items, parsed.askConfirmation) ? { t: 'pending', items } : { t: 'apply', items };
    return plan({ today, op, prefix, userText });
  }

  // 3. A IA tentou gravar/corrigir algo e nada passou na validação.
  if (parsed.dropped > 0 && !prefix) return plan({ today, op: { t: 'chat' }, reply: WRITE_REFUSED_REPLY, userText, historyText: WRITE_REFUSED_REPLY });

  // 4. Só consulta.
  if (prefix) return plan({ today, op: { t: 'chat' }, prefix, userText, historyText: prefix });

  // 5. Conversa. Sem nada gravado, a Jaki não pode dizer que gravou.
  const reply = FALSE_CLAIM.test(norm(parsed.reply)) ? NOT_RECORDED_REPLY : toWhatsAppText(parsed.reply);
  return plan({ today, op: { t: 'chat' }, reply, userText, historyText: reply });
}

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

export async function decide(input: BrainInput): Promise<WaPlan> {
  const { admin, userId, message, today } = input;
  const householdScope = async (): Promise<ChatScope> => ({ userId, householdIds: await householdIds(admin, userId) });

  const replyId = interactiveReplyId(message);
  if (message.type === 'interactive') {
    if (!replyId) return plan({ today, op: { t: 'chat' }, reply: 'Não entendi essa resposta. Pode escrever o que você quer?', userText: '' });
    return handleButton(input, await householdScope(), replyId);
  }

  const text = String(message.text?.body ?? '').trim();
  if (!text) return plan({ today, op: { t: 'chat' }, reply: 'Me manda uma mensagem de texto, tipo: gastei 35 no almoço.', userText: '' });
  if (text.length > MAX_TEXT) {
    return plan({ today, op: { t: 'chat' }, reply: 'Essa mensagem ficou grande demais. Pode mandar menor, um assunto por vez?', userText: '' });
  }

  // Atalhos sem IA (mais baratos e mais previsíveis).
  if (isUndoText(text)) return plan({ today, op: { t: 'undo' }, userText: text.slice(0, 500), historyText: 'Desfeito.' });
  if (isYesText(text) || isNoText(text)) {
    const pending = await latestOpenPending(admin, userId, PENDING_TEXT_WINDOW_MIN);
    if (pending) {
      return isYesText(text)
        ? plan({ today, op: { t: 'confirm', pending_id: pending.id }, display: confirmDisplay(pending), userText: text, historyText: 'Confirmado.' })
        : plan({ today, op: { t: 'cancel', pending_id: pending.id }, userText: text, historyText: 'Cancelado.' });
    }
  }

  return askAI(input, await householdScope(), text);
}

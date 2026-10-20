// O que a Jaki responde pelo WhatsApp. O texto de qualquer gravação é montado AQUI, a partir do que foi
// realmente gravado, e não pela IA: assim o valor mostrado é o valor salvo e a Jaki nunca diz "anotei" sem ter anotado.
// Puro (sem rede e sem banco): a mesma entrada sempre gera a mesma mensagem, então refazer o envio é seguro.
import type { OutButton, OutRow, Outgoing } from '@/lib/whatsappApi';
import { askCategoryId, cancelId, confirmId, undoId } from '@/lib/whatsappButtons';
import { brlText, dayMonth, relDay } from '@/lib/whatsappFormat';

export type WaItem =
  | { kind: 'transaction'; flow: 'income' | 'expense'; amount: number; description: string; category_id: string | null; category_name: string | null; date: string }
  | { kind: 'bill'; description: string; amount: number; due_date: string; bill_kind: 'income' | 'expense'; recurrence: 'none' | 'monthly' }
  | { kind: 'goal'; name: string; target_amount: number; deadline: string | null };

export type WaOp =
  | { t: 'chat' }
  | { t: 'apply'; items: WaItem[] }
  | { t: 'pending'; items: WaItem[] }
  | { t: 'confirm'; pending_id: string }
  | { t: 'cancel'; pending_id: string }
  | { t: 'undo'; group?: string }
  | { t: 'update_last'; group?: string; patch: { amount?: number; description?: string; date?: string; category_id?: string | null } };

/** Resposta decidida pelo "cérebro" (checkpoint 1 do worker). Fica salva em whatsapp_inbox.ai_response. */
export type WaPlan = {
  v: 2;
  today: string;
  op: WaOp;
  /** Respostas de consulta já calculadas (ex.: "quanto gastei?"), mostradas antes do resto. */
  prefix?: string;
  /** Texto da resposta quando não há gravação. */
  reply?: string;
  /** Aviso extra (ex.: categoria não encontrada). */
  note?: string;
  /** Itens a mostrar numa confirmação (o pendente já existe no banco). */
  display?: WaItem[];
  /** Lista interativa (escolher categoria). */
  list?: { text: string; button: string; rows: OutRow[] };
  /** Texto da pessoa para o histórico ('' = não guardar, ex.: toque em botão). */
  userText: string;
  /** Texto que a Jaki gravou no histórico. */
  historyText: string;
};

type Created = { idx: number; kind: string; ref_id: string; repeat?: boolean };
type Snapshot = { description?: string; amount?: number | string; date?: string; category?: string | null };
export type WaResult = {
  status?: string;
  group?: string;
  pending_id?: string;
  created?: Created[];
  removed?: { kind: string; description: string; amount: number | string }[];
  before?: Snapshot;
  after?: Snapshot;
};

export type StoredResponse = Partial<WaPlan> & { result?: WaResult; reply?: string };

const num = (v: number | string | undefined) => Number(v ?? 0);

export function itemLine(it: WaItem, today: string): string {
  if (it.kind === 'transaction') {
    const kind = it.flow === 'income' ? 'Receita' : 'Gasto';
    return `${kind}: *${it.description}* · ${brlText(it.amount)} · ${it.category_name ?? 'Sem categoria'} · ${relDay(it.date, today)}`;
  }
  if (it.kind === 'bill') {
    const what = it.bill_kind === 'income' ? 'A receber' : 'Conta';
    return `${what}: *${it.description}* · ${brlText(it.amount)} · vence ${dayMonth(it.due_date, today.slice(0, 4))}${it.recurrence === 'monthly' ? ' · todo mês' : ''}`;
  }
  return `Objetivo: *${it.name}* · meta ${brlText(it.target_amount)}${it.deadline ? ` · até ${dayMonth(it.deadline, today.slice(0, 4))}` : ''}`;
}

const lines = (items: WaItem[], today: string) => items.map((i) => `• ${itemLine(i, today)}`).join('\n');
const join = (...parts: (string | undefined | false)[]) => parts.filter((p): p is string => Boolean(p)).join('\n\n');

function recordedButtons(items: WaItem[], group: string | undefined): OutButton[] {
  if (!group) return [];
  const buttons: OutButton[] = [{ id: undoId(group), title: 'Desfazer' }];
  // Trocar a categoria só faz sentido quando é um único lançamento.
  if (items.length === 1 && items[0].kind === 'transaction') buttons.push({ id: askCategoryId(group), title: 'Trocar categoria' });
  return buttons;
}

const snapshotChange = (b: Snapshot | undefined, a: Snapshot | undefined, today: string): string[] => {
  if (!b || !a) return [];
  const out: string[] = [];
  if (num(b.amount) !== num(a.amount)) out.push(`Valor: ${brlText(num(b.amount))} → ${brlText(num(a.amount))}`);
  if (b.date && a.date && b.date !== a.date) out.push(`Data: ${dayMonth(b.date, today.slice(0, 4))} → ${dayMonth(a.date, today.slice(0, 4))}`);
  if ((b.category ?? null) !== (a.category ?? null)) out.push(`Categoria: ${b.category ?? 'Sem categoria'} → ${a.category ?? 'Sem categoria'}`);
  if (b.description !== a.description) out.push(`Descrição: ${b.description} → ${a.description}`);
  return out;
};

export function composeOutgoing(r: StoredResponse): Outgoing {
  const today = r.today ?? new Date().toISOString().slice(0, 10);
  const op = r.op;
  const res = r.result ?? {};
  const status = res.status;

  // Respostas que não vieram do "cérebro" novo (aviso de número desconhecido, limite do dia, vínculo, mídia).
  if (!op) return { kind: 'text', text: r.reply?.trim() || 'Desculpe, não entendi.' };

  if (op.t === 'chat') {
    if (r.list) return { kind: 'list', text: join(r.prefix, r.list.text), button: r.list.button, rows: r.list.rows };
    return { kind: 'text', text: join(r.prefix, r.reply, r.note) || 'Desculpe, não entendi.' };
  }

  if (op.t === 'apply') {
    const header = op.items.length === 1 && op.items[0].kind === 'transaction' ? 'Anotei ✅' : 'Pronto ✅';
    const body = op.items.length === 1 ? itemLine(op.items[0], today) : lines(op.items, today);
    const text = join(r.prefix, `${header}\n${body}`, r.note);
    const buttons = recordedButtons(op.items, res.group);
    return buttons.length ? { kind: 'buttons', text, buttons } : { kind: 'text', text };
  }

  if (op.t === 'pending') {
    const text = join(r.prefix, `Confirma? 🤔\n${lines(op.items, today)}\n\nToque num botão ou responda *sim* ou *não*.`, r.note);
    if (!res.pending_id) return { kind: 'text', text };
    return { kind: 'buttons', text, buttons: [{ id: confirmId(res.pending_id), title: 'Confirmar' }, { id: cancelId(res.pending_id), title: 'Cancelar' }] };
  }

  if (op.t === 'confirm') {
    if (status === 'ok') {
      const items = r.display ?? [];
      const text = `Pronto ✅\n${items.length ? lines(items, today) : 'Tudo anotado.'}`;
      const buttons = recordedButtons(items, res.group);
      return buttons.length ? { kind: 'buttons', text, buttons } : { kind: 'text', text };
    }
    if (status === 'already') return { kind: 'text', text: 'Isso já foi confirmado ✅' };
    if (status === 'cancelled') return { kind: 'text', text: 'Esse pedido foi cancelado. Se quiser, é só mandar de novo.' };
    if (status === 'expired') return { kind: 'text', text: 'Essa confirmação expirou. Manda de novo que eu anoto.' };
    return { kind: 'text', text: 'Não encontrei essa confirmação. Pode ter expirado. Manda de novo?' };
  }

  if (op.t === 'cancel') {
    if (status === 'ok') return { kind: 'text', text: 'Tudo bem, não anotei nada. 👍' };
    if (status === 'already_confirmed') {
      const text = 'Isso já tinha sido confirmado. Para remover, toque em Desfazer ou escreva "desfazer".';
      return res.group ? { kind: 'buttons', text, buttons: [{ id: undoId(res.group), title: 'Desfazer' }] } : { kind: 'text', text };
    }
    return { kind: 'text', text: 'Não encontrei esse pedido.' };
  }

  if (op.t === 'undo') {
    if (status === 'ok') {
      const removed = res.removed ?? [];
      const list = removed.map((x) => `• ${x.description} · ${brlText(num(x.amount))}`).join('\n');
      return { kind: 'text', text: `Desfeito ↩️${list ? `\nRemovi:\n${list}` : ''}` };
    }
    if (status === 'edited') return { kind: 'text', text: 'Não consegui desfazer porque você já mexeu nisso no app. Edite ou exclua por lá. ✋' };
    return { kind: 'text', text: 'Não achei nada recente (das últimas 24 horas) para desfazer.' };
  }

  // update_last
  if (status === 'ok') {
    const changes = snapshotChange(res.before, res.after, today);
    const name = res.after?.description ?? res.before?.description ?? 'lançamento';
    const text = join(r.prefix, `Corrigido ✏️ *${name}*${changes.length ? `\n${changes.join('\n')}` : '\nNada mudou.'}`, r.note);
    const buttons: OutButton[] = res.group ? [{ id: undoId(res.group), title: 'Desfazer' }] : [];
    return buttons.length ? { kind: 'buttons', text, buttons } : { kind: 'text', text };
  }
  if (status === 'edited') return { kind: 'text', text: 'Esse lançamento já foi editado no app, então não mexo nele por aqui. ✋' };
  return { kind: 'text', text: 'Não achei um lançamento recente feito por aqui para corrigir.' };
}

// Respostas às perguntas de números pelo WhatsApp. A IA só escolhe QUAL pergunta é; os números saem daqui,
// calculados em código a partir dos dados da casa da pessoa, e todo texto diz o período (ex.: "de 1 a 20/10").
// Roda com a chave de serviço, então TODA consulta é filtrada por `scope.householdIds`.
import type { SupabaseClient } from '@supabase/supabase-js';
import { allowance, type BillIn, type CardIn } from '@/lib/planning';
import type { InvoiceRow } from '@/lib/cards';
import type { ChatScope } from '@/lib/chatContext';
import type { WaQuery } from '@/lib/whatsappActions';
import { addDaysISO, brlText, dayMonth, monthName, norm, periodLabel } from '@/lib/whatsappFormat';

export type CatRow = { id: string; name: string; type: 'income' | 'expense'; parent_id: string | null };

const r2 = (n: number) => Math.round(n * 100) / 100;
const PAGE = 1000;
const MAX_PAGES = 10;

/** O PostgREST devolve no máximo 1000 linhas por chamada: lê em páginas até acabar (teto de 10 mil linhas). */
async function fetchAll<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const rows: T[] = [];
  for (let i = 0; i < MAX_PAGES; i++) {
    const { data, error } = await page(i * PAGE, i * PAGE + PAGE - 1);
    if (error) throw new Error('Falha ao consultar os dados');
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

const monthStart = (today: string) => `${today.slice(0, 7)}-01`;
function prevMonth(today: string): { start: string; end: string } {
  const [y, m] = today.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 2, 1));
  const last = new Date(Date.UTC(y, m - 1, 0));
  const p = (n: number) => String(n).padStart(2, '0');
  return { start: `${first.getUTCFullYear()}-${p(first.getUTCMonth() + 1)}-01`, end: `${last.getUTCFullYear()}-${p(last.getUTCMonth() + 1)}-${p(last.getUTCDate())}` };
}

type TxRow = { amount: number | string; type: 'income' | 'expense'; category_id: string | null };
type TxN = TxRow & { n: number };

async function loadTx(db: SupabaseClient, scope: ChatScope, from: string, to: string): Promise<TxN[]> {
  const rows = await fetchAll<TxRow>((a, b) =>
    db.from('transactions').select('amount,type,category_id').in('user_id', scope.householdIds).gte('date', from).lte('date', to).range(a, b));
  return rows.map((x) => ({ ...x, n: Number(x.amount) }));
}

/** Acha a categoria pelo nome que a IA devolveu: igual (sem acento/maiúscula) ou, se for única, contida. */
export function findCategory(cats: CatRow[], name: string): CatRow | null {
  const q = norm(name);
  if (!q) return null;
  const exact = cats.filter((c) => norm(c.name) === q);
  if (exact.length) return exact.find((c) => !c.parent_id) ?? exact[0];
  const part = cats.filter((c) => norm(c.name).includes(q) || q.includes(norm(c.name)));
  return part.length === 1 ? part[0] : null;
}

function monthSummary(rows: TxN[], today: string): string {
  const spent = r2(rows.filter((x) => x.type === 'expense').reduce((s, x) => s + x.n, 0));
  const got = r2(rows.filter((x) => x.type === 'income').reduce((s, x) => s + x.n, 0));
  const label = periodLabel(monthStart(today), today, today.slice(0, 4));
  if (rows.length === 0) return `📊 *${cap(monthName(today))}* (${label})\nAinda não há lançamentos nesse período.`;
  return `📊 *${cap(monthName(today))}* (${label})\nGastos: *${brlText(spent)}*\nRecebimentos: *${brlText(got)}*\nSaldo do período: ${brlText(r2(got - spent))}`;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function categorySpent(db: SupabaseClient, scope: ChatScope, today: string, cats: CatRow[], q: Extract<WaQuery, { name: 'category_spent' }>): Promise<string> {
  const cat = findCategory(cats, q.category);
  if (!cat) {
    const roots = cats.filter((c) => c.type === 'expense' && !c.parent_id).map((c) => c.name).slice(0, 12);
    return `Não achei a categoria *${q.category}*.${roots.length ? ` As suas são: ${roots.join(', ')}.` : ''}`;
  }
  const last = q.period === 'last_month';
  const range = last ? prevMonth(today) : { start: monthStart(today), end: today };
  const rows = await loadTx(db, scope, range.start, range.end);
  // Categoria pai soma as subcategorias; subcategoria soma só ela mesma.
  const ids = new Set<string>([cat.id, ...cats.filter((c) => c.parent_id === cat.id).map((c) => c.id)]);
  const mine = rows.filter((x) => x.type === 'expense' && x.category_id && ids.has(x.category_id));
  const total = r2(mine.reduce((s, x) => s + x.n, 0));
  const ref = today.slice(0, 4);
  const label = periodLabel(range.start, range.end, ref);
  const month = cap(monthName(range.start));
  if (mine.length === 0) return `🧾 *${cat.name}* em ${month} (${label}): nenhum gasto lançado.`;
  return `🧾 *${cat.name}* em ${month} (${label}): *${brlText(total)}* em ${mine.length} ${mine.length === 1 ? 'lançamento' : 'lançamentos'}.`;
}

async function billsDue(db: SupabaseClient, scope: ChatScope, today: string, q: Extract<WaQuery, { name: 'bills_due' }>): Promise<string> {
  const to = addDaysISO(today, q.days);
  const { data, error } = await db.from('bills').select('description,amount,due_date,type').in('user_id', scope.householdIds)
    .eq('status', 'pending').lte('due_date', to).order('due_date').limit(40);
  if (error) throw new Error('Falha ao consultar as contas');
  const bills = ((data ?? []) as { description: string; amount: number | string; due_date: string; type: 'income' | 'expense' }[])
    .map((b) => ({ ...b, n: Number(b.amount) }));
  const label = periodLabel(today, to, today.slice(0, 4));
  const overdue = bills.filter((b) => b.due_date < today);
  const next = bills.filter((b) => b.due_date >= today);
  const line = (b: (typeof bills)[number]) => `• ${dayMonth(b.due_date, today.slice(0, 4))} ${b.description} · ${brlText(b.n)}${b.type === 'income' ? ' (a receber)' : ''}`;

  if (bills.length === 0) return `📅 Nenhuma conta a pagar ou receber ${label}. 🎉`;
  const parts = [`📅 *Contas ${label}*`];
  if (overdue.length) parts.push(`⚠️ Atrasadas:\n${overdue.slice(0, 8).map(line).join('\n')}`);
  if (next.length) parts.push(next.slice(0, 12).map(line).join('\n'));
  const pay = r2(bills.filter((b) => b.type === 'expense').reduce((s, b) => s + b.n, 0));
  const rec = r2(bills.filter((b) => b.type === 'income').reduce((s, b) => s + b.n, 0));
  parts.push(`A pagar: *${brlText(pay)}*${rec > 0 ? ` · A receber: *${brlText(rec)}*` : ''}`);
  if (bills.length > 20) parts.push('(mostrando as primeiras; veja o resto no app)');
  return parts.join('\n');
}

async function canSpendToday(db: SupabaseClient, scope: ChatScope, today: string): Promise<string> {
  const [bal, bills, cards, inv] = await Promise.all([
    db.rpc('whatsapp_account_balances', { p_user: scope.userId }),
    fetchAll<{ description: string; amount: number | string; due_date: string; type: 'income' | 'expense'; recurrence: 'none' | 'monthly' }>((a, b) =>
      db.from('bills').select('description,amount,due_date,type,recurrence').in('user_id', scope.householdIds).eq('status', 'pending').order('due_date').range(a, b)),
    db.from('credit_cards').select('id,name,closing_day,due_day').in('user_id', scope.householdIds).eq('archived', false).eq('kind', 'credito'),
    db.rpc('whatsapp_card_invoice_summary', { p_user: scope.userId }),
  ]);
  if (bal.error || cards.error || inv.error) throw new Error('Falha ao consultar saldo e faturas');

  const cash = ((bal.data ?? []) as { balance: number | string }[]).reduce((s, x) => s + Number(x.balance), 0);
  const a = allowance({
    today,
    cash,
    bills: bills.map((x): BillIn => ({ ...x, amount: Number(x.amount) })),
    cards: (cards.data ?? []) as CardIn[],
    invoices: ((inv.data ?? []) as { card_id: string; invoice_month: string; total: number | string; paid: number | string }[])
      .map((x): InvoiceRow => ({ card_id: x.card_id, invoice_month: x.invoice_month, total: Number(x.total), paid: Number(x.paid) })),
  });

  const label = periodLabel(today, endOfMonth(today), today.slice(0, 4));
  const head = `💰 *Quanto posso gastar hoje* (${label})`;
  const lines = [
    `Saldo nas contas: ${brlText(a.cash)}`,
    `Contas a pagar até o fim do mês: -${brlText(a.toPay)}`,
    `Faturas de cartão até o fim do mês: -${brlText(a.cardsDue)}`,
  ];
  if (a.free <= 0) {
    return `${head}\n${lines.join('\n')}\n⚠️ Pelo que está cadastrado, o saldo não cobre tudo até o fim do mês: faltam *${brlText(Math.abs(a.free))}*.\nConsidera só o que está lançado no app.`;
  }
  return `${head}\n${lines.join('\n')}\nSobra: ${brlText(a.free)} para ${a.daysLeft} ${a.daysLeft === 1 ? 'dia' : 'dias'} (hoje incluído).\n👉 Dá cerca de *${brlText(a.perDay)} por dia*.\nConsidera só o que está lançado no app.`;
}

function endOfMonth(today: string): string {
  const [y, m] = today.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0));
  return `${last.getUTCFullYear()}-${String(last.getUTCMonth() + 1).padStart(2, '0')}-${String(last.getUTCDate()).padStart(2, '0')}`;
}

/** Executa as consultas na ordem e junta as respostas. Erro de dados sobe para o worker tentar de novo. */
export async function runQueries(db: SupabaseClient, scope: ChatScope, today: string, queries: WaQuery[], cats: CatRow[]): Promise<string> {
  const out: string[] = [];
  for (const q of queries) {
    if (q.name === 'month_summary') out.push(monthSummary(await loadTx(db, scope, monthStart(today), today), today));
    else if (q.name === 'category_spent') out.push(await categorySpent(db, scope, today, cats, q));
    else if (q.name === 'bills_due') out.push(await billsDue(db, scope, today, q));
    else if (q.name === 'can_spend_today') out.push(await canSpendToday(db, scope, today));
  }
  return out.join('\n\n');
}

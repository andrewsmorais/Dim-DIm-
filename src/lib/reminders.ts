// Lembretes de vencimento (regras puras, sem acesso ao banco nem a canais de envio).
import { addDays } from "@/lib/cards";
import { brl, formatDateBR } from "@/lib/format";

// Valores de profiles.notify_when -> quantos dias antes do vencimento avisar.
const OFFSETS: Record<string, number> = { on_due: 0, "1_day": 1, "3_days": 3, "7_days": 7 };
export const offsetFor = (when: string | null | undefined): number => OFFSETS[String(when)] ?? 0;

export type DueItem = { kind: "pagar" | "receber" | "fatura"; label: string; amount: number; due: string };

export type BillLite = { user_id: string; description: string; amount: number | string; due_date: string; type: "income" | "expense" };
/** Linha de public.card_invoices_due_on(): fatura com valor em aberto que vence em `due_date`. */
export type CardDueRow = { card_id: string; user_id: string; card_name: string; due_date: string; remaining: number | string };

/** Data de hoje em São Paulo ("AAAA-MM-DD"), independente do fuso do servidor. */
export function todayInSaoPaulo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

/** Dia em que o vencimento cai para quem escolheu avisar `offset` dias antes. */
export const targetDateFor = (today: string, offset: number): string => addDays(today, offset);

/** Contas a pagar/receber pendentes que vencem em `target`. */
export function billItems(bills: BillLite[], target: string): DueItem[] {
  return bills
    .filter((b) => b.due_date === target)
    .map((b) => ({ kind: b.type === "income" ? ("receber" as const) : ("pagar" as const), label: b.description, amount: Number(b.amount), due: target }));
}

/** Faturas de cartão em aberto que vencem em `target` (o cálculo do valor em aberto fica no banco). */
export function cardItems(rows: CardDueRow[], target: string): DueItem[] {
  return rows
    .filter((r) => r.due_date === target && Number(r.remaining) > 0.004)
    .map((r) => ({ kind: "fatura" as const, label: `Fatura ${r.card_name}`, amount: Number(r.remaining), due: target }));
}

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();
const cut = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

function whenLabel(offset: number, target: string): string {
  if (offset === 0) return "hoje";
  if (offset === 1) return "amanhã";
  return `em ${offset} dias (${formatDateBR(target).slice(0, 5)})`;
}

export type Reminder = {
  title: string;
  /** Uma linha, sem quebras (cabe em notificação push e em variável de modelo do WhatsApp). */
  summary: string;
  /** Linhas para e-mail e mensagem de texto do WhatsApp. */
  lines: string[];
  /** Total a pagar (contas + faturas), sem os recebimentos. */
  totalToPay: number;
};

/** Monta o texto do lembrete. Retorna null se não há nada a avisar. */
export function buildReminder(items: DueItem[], offset: number, target: string): Reminder | null {
  if (items.length === 0) return null;
  const pay = items.filter((i) => i.kind !== "receber");
  const recv = items.filter((i) => i.kind === "receber");
  const when = whenLabel(offset, target);

  let title: string;
  if (recv.length === 0) title = pay.length === 1 ? `1 conta vence ${when}` : `${pay.length} contas vencem ${when}`;
  else if (pay.length === 0) title = recv.length === 1 ? `1 recebimento previsto ${when}` : `${recv.length} recebimentos previstos ${when}`;
  else title = `Contas e recebimentos ${when}`;

  // Pagamentos primeiro, do maior para o menor valor.
  const sorted = [...pay.sort((a, b) => b.amount - a.amount), ...recv.sort((a, b) => b.amount - a.amount)];
  const text = (i: DueItem) => `${cut(oneLine(i.label), 40)}${i.kind === "receber" ? " (a receber)" : ""} ${brl(i.amount)}`;
  const top = sorted.slice(0, 3).map(text).join("; ");
  const more = sorted.length - 3;
  const summary = oneLine(`${top}${more > 0 ? ` e mais ${more}` : ""}`);

  const lines = sorted.slice(0, 10).map((i) => `${i.kind === "receber" ? "A receber · " : ""}${cut(oneLine(i.label), 60)}: ${brl(i.amount)}`);
  if (sorted.length > 10) lines.push(`e mais ${sorted.length - 10}`);

  const totalToPay = Math.round(pay.reduce((s, i) => s + i.amount, 0) * 100) / 100;
  return { title, summary, lines, totalToPay };
}

// Leitura da resposta da IA no canal WhatsApp. Reaproveita os validadores do Chat IA (valor, data, conta, objetivo)
// e acrescenta o que só existe aqui: corrigir o último lançamento e consultas que o SISTEMA calcula.
// Nada que a IA devolver é gravado sem passar por estes esquemas.
import { z } from 'zod';
import { billSchema, date, goalSchema, money, txSchema } from '@/lib/chatActions';
import { addDaysISO } from '@/lib/whatsappFormat';

const FALLBACK_REPLY = 'Não consegui entender direito. Pode mandar de novo?';
export const WRITE_REFUSED_REPLY = 'Não consegui ter certeza do valor ou da data. Pode mandar de novo, com o valor? Ex.: gastei 35 no almoço.';

export const MAX_WRITES = 5;
export const MAX_QUERIES = 3;

const updateLastSchema = z
  .object({
    type: z.literal('update_last'),
    amount: money(10_000_000).optional(),
    description: z.string().trim().min(1).max(120).optional(),
    date: date.optional(),
    category: z.string().trim().min(1).max(60).optional(),
  })
  .refine((v) => v.amount !== undefined || v.description !== undefined || v.date !== undefined || v.category !== undefined, 'nada para mudar');

const queryBase = { type: z.literal('query') };
const querySchema = z.discriminatedUnion('name', [
  z.object({ ...queryBase, name: z.literal('month_summary') }),
  z.object({ ...queryBase, name: z.literal('category_spent'), category: z.string().trim().min(1).max(60), period: z.enum(['month', 'last_month']).default('month') }),
  z.object({ ...queryBase, name: z.literal('bills_due'), days: z.coerce.number().int().min(1).max(31).default(7) }),
  z.object({ ...queryBase, name: z.literal('can_spend_today') }),
]);

export type WaTx = z.infer<typeof txSchema>;
export type WaBill = z.infer<typeof billSchema>;
export type WaGoal = z.infer<typeof goalSchema>;
export type WaUpdateLast = z.infer<typeof updateLastSchema>;
export type WaQuery = z.infer<typeof querySchema>;

export type WaParsed = {
  reply: string;
  txs: WaTx[];
  bills: WaBill[];
  goals: WaGoal[];
  updateLast: WaUpdateLast | null;
  queries: WaQuery[];
  askConfirmation: boolean;
  /** Itens de gravação/correção/consulta que a IA mandou e foram descartados por não passar na validação. */
  dropped: number;
};

const outSchema = z.object({
  reply: z.string().trim().min(1).max(2000),
  transactions: z.array(z.unknown()).max(10).optional(),
  actions: z.array(z.unknown()).max(12).optional(),
  ask_confirmation: z.boolean().optional(),
});

const empty = (reply: string): WaParsed => ({ reply, txs: [], bills: [], goals: [], updateLast: null, queries: [], askConfirmation: false, dropped: 0 });

export function parseWhatsAppOutput(content: string | null | undefined): WaParsed {
  let json: unknown;
  try {
    json = JSON.parse(content || '{}');
  } catch {
    return empty(FALLBACK_REPLY);
  }
  const out = outSchema.safeParse(json);
  if (!out.success) return empty(FALLBACK_REPLY);

  const parsed = empty(out.data.reply);
  parsed.askConfirmation = out.data.ask_confirmation === true;

  for (const t of out.data.transactions ?? []) {
    const r = txSchema.safeParse(t);
    if (r.success) parsed.txs.push(r.data);
    else parsed.dropped++;
  }
  for (const a of out.data.actions ?? []) {
    const type = (a as { type?: unknown } | null)?.type;
    if (type === 'navigate') continue; // pelo WhatsApp não abre tela
    if (type === 'transaction') {
      const r = txSchema.safeParse(a);
      if (r.success) parsed.txs.push(r.data);
      else parsed.dropped++;
    } else if (type === 'bill') {
      const r = billSchema.safeParse(a);
      if (r.success) parsed.bills.push(r.data);
      else parsed.dropped++;
    } else if (type === 'goal') {
      const r = goalSchema.safeParse(a);
      if (r.success) parsed.goals.push(r.data);
      else parsed.dropped++;
    } else if (type === 'update_last') {
      const r = updateLastSchema.safeParse(a);
      if (r.success && !parsed.updateLast) parsed.updateLast = r.data;
      else parsed.dropped++;
    } else if (type === 'query') {
      const r = querySchema.safeParse(a);
      if (r.success && parsed.queries.length < MAX_QUERIES) parsed.queries.push(r.data);
      else parsed.dropped++;
    } else {
      parsed.dropped++;
    }
  }

  // Limite total de gravações por mensagem.
  let room = MAX_WRITES;
  const take = <T,>(list: T[]): T[] => {
    const kept = list.slice(0, Math.max(room, 0));
    parsed.dropped += list.length - kept.length;
    room -= kept.length;
    return kept;
  };
  parsed.txs = take(parsed.txs);
  parsed.bills = take(parsed.bills);
  parsed.goals = take(parsed.goals);
  return parsed;
}

/** Data fora de uma janela razoável (mais de ~13 meses atrás ou mais de 31 dias à frente) vira hoje: o resumo mostra a data e a pessoa corrige. */
export function sanePastDate(d: string, today: string): string {
  return d < addDaysISO(today, -400) || d > addDaysISO(today, 31) ? today : d;
}

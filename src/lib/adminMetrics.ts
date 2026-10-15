// Cálculos do painel admin. Funções puras: recebem o JSON de public.admin_metrics() e devolvem números prontos.
//
// Definições (as mesmas mostradas no painel):
//  - Receita            = pagamentos confirmados no mês (eventos do webhook do Asaas)
//  - Custos diretos     = taxas de pagamento + Vercel + Supabase + IA + WhatsApp
//  - Lucro bruto        = receita - reembolsos - custos diretos
//  - Custo operacional  = tudo que foi lançado, menos impostos (diretos + domínio + outros)
//  - Lucro líquido      = lucro bruto - domínio - outros - impostos

export type CostRow = {
  month: string; vercel: number; supabase: number; ai: number; whatsapp: number;
  domain: number; payment_fees: number; taxes: number; other: number; notes: string | null;
};

export type MonthRow = {
  month: string; revenue: number; revenue_cpf: number; revenue_mei: number; refunds: number;
  payments: number; new_customers: number; churned: number;
  /** Taxa real do Asaas (valor − líquido) nos pagamentos em que o líquido é conhecido, e quantos são. */
  fees: number; fees_known: number;
};

export type SyncState = {
  last_sync_at: string | null; last_full_sync_at: string | null;
  last_result: { scanned: number; inserted: number; feesFilled: number } | null;
} | null;

export type RawMetrics = {
  sync: SyncState;
  generated_at: string;
  total_users: number;
  payers_total: number;
  mrr: number;
  snapshot: { status: string; plan: string; count: number }[];
  months: MonthRow[];
  costs: CostRow[];
};

export type MonthFinance = MonthRow & {
  directCosts: number; operatingCost: number; grossProfit: number; netProfit: number; hasCosts: boolean;
};

export type Dashboard = {
  generatedAt: string;
  totalUsers: number;
  payersTotal: number;
  trial: number; active: number; pastDue: number; canceledTotal: number;
  paying: number;
  byPlan: { plan: string; label: string; subscribers: number; revenueMonth: number }[];
  mrr: number; arr: number; arpu: number;
  churnRate: number; ltv: number | null;
  current: MonthFinance | null;
  previous: MonthFinance | null;
  series: MonthFinance[];
  costs: CostRow[];
  sync: SyncState;
};

const n = (v: unknown): number => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
export const r2 = (x: number): number => Math.round(x * 100) / 100;

export const PLAN_LABEL: Record<string, string> = {
  cpf: 'Jakash CPF', mei: 'Jakash MEI', cnpj: 'CNPJ (legado)', zap: 'Zap (teste)', piloto: 'Piloto',
};

function finance(row: MonthRow, cost: CostRow | undefined): MonthFinance {
  const c = cost ?? ({} as Partial<CostRow>);
  // Taxa automática (vem do Asaas) tem prioridade sobre o valor lançado à mão, para não contar duas vezes.
  const fees = n(row.fees_known) > 0 ? n(row.fees) : n(c.payment_fees);
  const direct = fees + n(c.vercel) + n(c.supabase) + n(c.ai) + n(c.whatsapp);
  const other = n(c.domain) + n(c.other);
  const revenue = n(row.revenue);
  const refunds = n(row.refunds);
  const gross = revenue - refunds - direct;
  return {
    ...row,
    revenue: r2(revenue), revenue_cpf: r2(n(row.revenue_cpf)), revenue_mei: r2(n(row.revenue_mei)), refunds: r2(refunds),
    payments: n(row.payments), new_customers: n(row.new_customers), churned: n(row.churned),
    fees: r2(fees), fees_known: n(row.fees_known),
    directCosts: r2(direct),
    operatingCost: r2(direct + other),
    grossProfit: r2(gross),
    netProfit: r2(gross - other - n(c.taxes)),
    hasCosts: !!cost,
  };
}

export function buildDashboard(raw: RawMetrics): Dashboard {
  const costByMonth = new Map(raw.costs.map((c) => [c.month.slice(0, 7), c]));
  const series = raw.months.map((m) => finance(m, costByMonth.get(m.month.slice(0, 7))));
  const current = series.length ? series[series.length - 1] : null;
  const previous = series.length > 1 ? series[series.length - 2] : null;

  const count = (status: string[], plan?: string) =>
    raw.snapshot
      .filter((s) => status.includes(s.status) && (plan === undefined || s.plan === plan))
      .reduce((a, s) => a + n(s.count), 0);

  const paying = count(['active', 'past_due']);
  const plans = Array.from(new Set(raw.snapshot.map((s) => s.plan).filter(Boolean)));
  const byPlan = plans
    .map((plan) => ({
      plan,
      label: PLAN_LABEL[plan] ?? plan,
      subscribers: count(['active', 'past_due', 'trial'], plan),
      revenueMonth: plan === 'cpf' ? current?.revenue_cpf ?? 0 : plan === 'mei' ? current?.revenue_mei ?? 0 : 0,
    }))
    .sort((a, b) => b.subscribers - a.subscribers);

  const mrr = r2(n(raw.mrr));
  const arpu = paying > 0 ? r2(mrr / paying) : 0;
  // Aproximação: base do início do mês ~ pagantes de hoje + quem saiu no mês.
  const base = paying + (current?.churned ?? 0);
  const churnRate = base > 0 ? r2(((current?.churned ?? 0) / base) * 100) : 0;
  const ltv = churnRate > 0 ? r2(arpu / (churnRate / 100)) : null;

  return {
    generatedAt: raw.generated_at,
    totalUsers: n(raw.total_users),
    payersTotal: n(raw.payers_total),
    trial: count(['trial']), active: count(['active']), pastDue: count(['past_due']),
    canceledTotal: count(['canceled', 'unpaid']),
    paying, byPlan, mrr, arr: r2(mrr * 12), arpu, churnRate, ltv, current, previous, series, costs: raw.costs, sync: raw.sync ?? null,
  };
}

// Fonte unica de verdade dos planos. O valor cobrado SEMPRE vem daqui (servidor),
// nunca do navegador.
//
// Ids (gravados em profiles.subscription_plan e no Asaas):
//   cpf    = Jakash Essencial (1 pessoa)       — id mantido para nao quebrar quem ja assina
//   familia = Jakash Familia  (ate 3 pessoas)
//   mei    = Jakash MEI       (tudo do Familia + ferramentas MEI)
export const PLANS = {
  cpf: { name: 'Jakash Essencial', value: 19.9, members: 1, aiDaily: 30 },
  familia: { name: 'Jakash Família', value: 29.9, members: 3, aiDaily: 40 },
  mei: { name: 'Jakash MEI', value: 39.9, members: 3, aiDaily: 60 },
} as const;

export type PlanId = keyof typeof PLANS;

export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PLANS, value);
}

// Preço do plano sempre em reais (a moeda de exibição do usuário não muda o valor cobrado).
export function planPrice(plan: PlanId): string {
  return PLANS[plan].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Plano -> valor mensal, para identificar o plano pela cobranca do Asaas.
export function planFromValue(value: number): PlanId | null {
  return PLAN_IDS.find((id) => Math.abs(PLANS[id].value - value) < 0.005) ?? null;
}

// Quem ainda nao escolheu plano (periodo de teste) tem acesso a tudo; so o Essencial e limitado.
export function hasFamilyFeatures(plan?: string | null): boolean {
  return plan !== 'cpf';
}

// Telas que so existem do plano Familia em diante.
export const FAMILY_ONLY_PATHS = ['/planejamento', '/investimentos', '/simulador', '/dividas', '/chat'] as const;

export function isFamilyOnlyPath(pathname: string): boolean {
  return FAMILY_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Quantas pessoas (contando o dono) cabem na gestao compartilhada.
export function memberLimit(plan?: string | null): number {
  return isPlanId(plan) ? PLANS[plan].members : PLANS.familia.members;
}

// Mensagens do Chat IA por dia, por usuário (controle de custo). AI_CHAT_DAILY_LIMIT, se definida, vale para todos.
export function aiDailyLimit(plan?: string | null): number {
  const override = Number(process.env.AI_CHAT_DAILY_LIMIT);
  if (Number.isFinite(override) && override > 0) return Math.floor(override);
  if (plan === 'cnpj') return PLANS.mei.aiDaily;
  return isPlanId(plan) ? PLANS[plan].aiDaily : PLANS.cpf.aiDaily;
}

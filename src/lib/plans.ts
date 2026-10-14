// Fonte unica de verdade dos planos. O valor cobrado SEMPRE vem daqui (servidor),
// nunca do navegador.
export const PLANS = {
  cpf: { name: 'Jakash CPF', value: 19.9 },
  mei: { name: 'Jakash MEI', value: 39.9 },
} as const;

export type PlanId = keyof typeof PLANS;

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(PLANS, value);
}

// Mensagens do Chat IA por dia, por usuário (controle de custo). AI_CHAT_DAILY_LIMIT, se definida, vale para todos.
export function aiDailyLimit(plan?: string | null): number {
  const override = Number(process.env.AI_CHAT_DAILY_LIMIT);
  if (Number.isFinite(override) && override > 0) return Math.floor(override);
  return plan === 'mei' || plan === 'cnpj' ? 60 : 30;
}

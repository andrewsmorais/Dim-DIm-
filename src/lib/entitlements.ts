import type { SupabaseClient } from '@supabase/supabase-js';

// Quem tem acesso pago: teste, ativa ou com pagamento atrasado (mesma regra de antes).
export const LIVE_STATUS = ['trial', 'active', 'past_due'];

export type Entitlement = {
  plan: string | null;
  status: string | null;
  // true quando o acesso vem da assinatura de quem convidou (gestão compartilhada).
  viaOwner: boolean;
};

type ProfileRow = { subscription_status: string | null; subscription_plan: string | null };

const isLive = (p: ProfileRow | null | undefined) => Boolean(p && LIVE_STATUS.includes(String(p.subscription_status)));

// Plano e status que valem para o usuário: o próprio; se ele não tem assinatura ativa mas é membro
// de uma casa cujo dono tem, vale a do dono (o convidado não paga de novo). Só servidor (service role).
export async function getEntitlement(admin: SupabaseClient, userId: string): Promise<Entitlement | null> {
  const { data: own } = await admin.from('profiles').select('subscription_status, subscription_plan').eq('id', userId).maybeSingle();
  if (!own) return null;
  if (isLive(own)) return { plan: own.subscription_plan, status: own.subscription_status, viaOwner: false };

  const { data: link } = await admin.from('partnerships').select('owner_id').eq('partner_id', userId).eq('status', 'accepted').maybeSingle();
  if (link?.owner_id) {
    const { data: owner } = await admin.from('profiles').select('subscription_status, subscription_plan').eq('id', link.owner_id).maybeSingle();
    if (isLive(owner)) return { plan: owner!.subscription_plan, status: owner!.subscription_status, viaOwner: true };
  }
  return { plan: own.subscription_plan, status: own.subscription_status, viaOwner: false };
}

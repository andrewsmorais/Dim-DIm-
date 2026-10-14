import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { handleReferralPayment } from '@/lib/referrals';

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export async function POST(request: Request) {
  try {
    const expected = process.env.ASAAS_WEBHOOK_TOKEN;
    const received = request.headers.get('asaas-access-token') ?? '';

    if (!expected || !safeEqual(received, expected)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const event: string = body.event;
    const supabase = createAdminClient();

    // Eventos de cobrança trazem body.payment; eventos de assinatura trazem body.subscription
    const customerId: string | undefined = body.payment?.customer ?? body.subscription?.customer;
    if (!customerId) {
      return NextResponse.json({ received: true, ignored: 'sem customer' }, { status: 200 });
    }

    let update: Record<string, unknown> | null = null;

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      update = { subscription_status: 'active', subscription_expires_at: expiresAt.toISOString() };
    } else if (event === 'PAYMENT_OVERDUE') {
      update = { subscription_status: 'past_due' };
    } else if (event === 'PAYMENT_REFUNDED' || event === 'SUBSCRIPTION_DELETED' || event === 'SUBSCRIPTION_INACTIVATED') {
      update = { subscription_status: 'canceled' };
    }

    if (update) {
      const { error } = await supabase
        .from('profiles')
        .update(update)
        .eq('asaas_customer_id', customerId);

      // Erro => 500 para o Asaas tentar de novo
      if (error) {
        console.error('Asaas webhook: falha ao atualizar perfil', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
      }
    }

    // Indicação de amigos: nunca pode fazer o webhook falhar (o Asaas reenviaria o evento).
    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      await handleReferralPayment(supabase, customerId).catch((e: unknown) => console.error('[referral] webhook', (e as Error).message));
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const ASAAS_WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN;
    const authHeader = request.headers.get('asaas-access-token');

    // Validação de Segurança
    if (!ASAAS_WEBHOOK_TOKEN || authHeader !== ASAAS_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { event, payment } = body;

    // Inicializa Supabase Admin (Service Role)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
      // Busca o profile atrelado ao customer do Asaas
      const customerId = payment.customer;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('asaas_customer_id', customerId)
        .single();

      if (profile) {
        // Renova a assinatura por +30 dias
        const newExpiration = new Date();
        newExpiration.setDate(newExpiration.getDate() + 30);

        await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'active',
            subscription_expires_at: newExpiration.toISOString()
          })
          .eq('id', profile.id);
      }
    } 
    else if (event === 'PAYMENT_OVERDUE') {
      const customerId = payment.customer;
      await supabase
        .from('profiles')
        .update({ subscription_status: 'past_due' })
        .eq('asaas_customer_id', customerId);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

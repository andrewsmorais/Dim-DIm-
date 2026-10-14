import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ASAAS_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';

// Exclui a conta e os dados do usuário logado (LGPD). Exige confirmação digitada.
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Faça login' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (String(body.confirm ?? '').trim().toUpperCase() !== 'EXCLUIR') {
    return NextResponse.json({ error: 'Digite EXCLUIR para confirmar.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('asaas_subscription_id, whatsapp_number')
    .eq('id', user.id)
    .single();

  // 1. Para a cobrança (melhor esforço: se falhar, a exclusão continua e o erro fica no log)
  const apiKey = process.env.ASAAS_API_KEY;
  if (apiKey && profile?.asaas_subscription_id) {
    try {
      await fetch(`${ASAAS_URL}/subscriptions/${encodeURIComponent(profile.asaas_subscription_id)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', access_token: apiKey },
      });
    } catch (error) {
      console.error('Delete account: falha ao cancelar assinatura', error);
    }
  }

  // 2. Mensagens do WhatsApp guardadas na fila
  if (profile?.whatsapp_number) {
    const { error } = await admin.from('whatsapp_inbox').delete().eq('phone_number', profile.whatsapp_number);
    if (error) console.error('Delete account: falha ao limpar fila do WhatsApp', error);
  }

  // 3. Remove o usuário (as tabelas ligadas ao usuário apagam em cascata)
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('Delete account: falha ao excluir usuário', error);
    return NextResponse.json({ error: 'Não foi possível excluir agora. Tente novamente.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

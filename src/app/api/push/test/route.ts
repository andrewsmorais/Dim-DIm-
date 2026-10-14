import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { pushConfigured, sendPush } from '@/lib/push';

// Envia um aviso de teste para os aparelhos do próprio usuário (botão "Enviar teste" em Notificações).
const lastSent = new Map<string, number>(); // proteção simples contra cliques repetidos (por instância)
const COOLDOWN_MS = 20_000;

export async function POST() {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({ error: 'Faça login' }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: 'Os avisos no aparelho ainda não estão ativados neste ambiente.' }, { status: 503 });

  const now = Date.now();
  if (now - (lastSent.get(user.id) ?? 0) < COOLDOWN_MS) return NextResponse.json({ error: 'Aguarde alguns segundos para testar de novo.' }, { status: 429 });
  lastSent.set(user.id, now);

  const admin = createAdminClient();
  const { data: subs } = await admin.from('push_subscriptions').select('id,endpoint,p256dh,auth').eq('user_id', user.id);
  if (!subs || subs.length === 0) return NextResponse.json({ error: 'Nenhum aparelho ativado ainda.' }, { status: 404 });

  let sent = 0;
  for (const s of subs) {
    const r = await sendPush(s, { title: 'Jakash · teste', body: 'Tudo certo! Você vai receber os lembretes de vencimento aqui.', url: '/configuracoes/notificacoes', tag: 'jakash-test' });
    if (r === 'ok') sent++;
    if (r === 'gone') await admin.from('push_subscriptions').delete().eq('id', s.id);
  }
  if (sent === 0) return NextResponse.json({ error: 'Não consegui entregar o teste. Desative e ative de novo neste aparelho.' }, { status: 502 });
  return NextResponse.json({ ok: true, sent });
}

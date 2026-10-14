import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Sem caracteres ambíguos (0/O, 1/I/L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode(): string {
  const bytes = crypto.randomBytes(6);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Faça login para conectar o WhatsApp' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Invalida códigos antigos ainda não usados deste usuário
    await admin.from('whatsapp_link_codes').delete().eq('user_id', user.id).is('used_at', null);

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    let code = generateCode();
    let { error } = await admin.from('whatsapp_link_codes').insert({ code, user_id: user.id, expires_at: expiresAt });
    if (error?.code === '23505') {
      code = generateCode(); // colisão rara: tenta uma vez mais
      ({ error } = await admin.from('whatsapp_link_codes').insert({ code, user_id: user.id, expires_at: expiresAt }));
    }
    if (error) {
      console.error('link-code insert error', error);
      return NextResponse.json({ error: 'Não foi possível gerar o código' }, { status: 500 });
    }

    const botNumber = (process.env.WHATSAPP_BOT_NUMBER || '').replace(/\D/g, '');
    const waLink = botNumber
      ? `https://wa.me/${botNumber}?text=${encodeURIComponent(`conectar ${code}`)}`
      : null;

    return NextResponse.json({ code, expiresInMinutes: 15, waLink, botNumber: botNumber || null });
  } catch (error) {
    console.error('link-code error', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

// Número oficial do assistente (o que o usuário salva nos contatos e para quem manda mensagem).
// É informação pública por natureza, então não exige login.
export async function GET() {
  const digits = (process.env.WHATSAPP_BOT_NUMBER || '').replace(/\D/g, '');
  return NextResponse.json(
    { number: digits || null, waLink: digits ? `https://wa.me/${digits}` : null },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}

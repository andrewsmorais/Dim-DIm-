import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { aiDailyLimit } from '@/lib/plans';
import { CHAT_SYSTEM_PROMPT } from '@/lib/chatPrompt';
import { buildChatContext } from '@/lib/chatContext';

export const maxDuration = 30;

// Quem pode usar o chat (cada mensagem tem custo): assinatura em teste, ativa ou com pagamento atrasado.
const ALLOWED_STATUS = ['trial', 'active', 'past_due'];

function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

const bodySchema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(800) })).max(8).default([]),
});

// Nada que a IA devolver vira lançamento sem passar por aqui (e sem a confirmação da pessoa no app).
const txSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000).transform((n) => Math.round(n * 100) / 100),
  description: z.string().trim().min(1).max(120),
  category: z.string().trim().max(60).nullish(),
  type: z.enum(['income', 'expense']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((d) => !Number.isNaN(Date.parse(d)), 'data inválida'),
});
const replySchema = z.object({ reply: z.string().trim().min(1).max(2000), transactions: z.array(z.unknown()).max(10).optional() });

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Faça login' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('subscription_plan').maybeSingle();
  const limit = aiDailyLimit(profile?.subscription_plan);
  const { data } = await createAdminClient().from('ai_usage').select('count').eq('user_id', user.id).eq('day', todayInSaoPaulo()).maybeSingle();
  return NextResponse.json({ limit, remaining: Math.max(limit - (data?.count ?? 0), 0), enabled: Boolean(process.env.OPENAI_API_KEY) });
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Faça login para usar o chat.' }, { status: 401 });

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'O Chat IA ainda não está ativado neste ambiente.' }, { status: 503 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Mensagem inválida (até 500 caracteres).' }, { status: 400 });
    const { message, history } = parsed.data;

    const { data: profile } = await supabase.from('profiles').select('subscription_status, subscription_plan').maybeSingle();
    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
    if (!ALLOWED_STATUS.includes(String(profile.subscription_status))) {
      return NextResponse.json({ error: 'Sua assinatura não está ativa. Renove em Configurações › Planos para usar o chat.' }, { status: 402 });
    }

    // Reserva uma mensagem do limite diário antes de gastar com a IA.
    const today = todayInSaoPaulo();
    const limit = aiDailyLimit(profile.subscription_plan);
    const admin = createAdminClient();
    const { data: used, error: usageError } = await admin.rpc('ai_usage_hit', { p_user: user.id, p_day: today, p_limit: limit });
    if (usageError) {
      console.error('[chat] ai_usage_hit', usageError);
      return NextResponse.json({ error: 'Não foi possível verificar seu limite agora.' }, { status: 500 });
    }
    if (used === -1) {
      return NextResponse.json({ error: `Você usou as ${limit} mensagens de hoje. Amanhã tem mais!`, remaining: 0 }, { status: 429 });
    }

    let content: string | null | undefined;
    try {
      const context = await buildChatContext(supabase, today);
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: `${CHAT_SYSTEM_PROMPT}\n\n# DADOS (JSON)\n${JSON.stringify(context)}` },
          ...history,
          { role: 'user', content: message },
        ],
      });
      content = completion.choices[0]?.message?.content;
    } catch (err) {
      console.error('[chat] falha ao chamar a IA', err);
      await admin.rpc('ai_usage_refund', { p_user: user.id, p_day: today });
      return NextResponse.json({ error: 'Não consegui responder agora. Tente de novo em instantes.' }, { status: 502 });
    }

    let reply = 'Não consegui entender direito. Pode reformular?';
    let transactions: z.infer<typeof txSchema>[] = [];
    try {
      const out = replySchema.safeParse(JSON.parse(content || '{}'));
      if (out.success) {
        reply = out.data.reply;
        transactions = (out.data.transactions ?? [])
          .map((t) => txSchema.safeParse(t))
          .flatMap((r) => (r.success ? [r.data] : []))
          .slice(0, 5);
      }
    } catch {
      /* resposta fora do formato: usa a mensagem padrão */
    }

    // Histórico compartilhado com o WhatsApp (melhor esforço).
    await supabase.from('chat_history').insert([
      { user_id: user.id, message_role: 'user', content: message },
      { user_id: user.id, message_role: 'assistant', content: reply },
    ]);

    return NextResponse.json({ reply, transactions, remaining: Math.max(limit - used, 0) });
  } catch (error) {
    console.error('[chat] erro', error);
    return NextResponse.json({ error: 'Erro interno ao processar o chat.' }, { status: 500 });
  }
}

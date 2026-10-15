import type { SupabaseClient } from '@supabase/supabase-js';
import { getEntitlement, isEntitled } from '@/lib/entitlements';
import { whatsappDailyLimit } from '@/lib/plans';

// Resultado que o worker grava como resposta quando a mensagem NÃO deve ir para a IA.
// skipDb: não grava chat/transação. silent: não responde (evita enxurrada de respostas).
export type GateResult = { success: false; skipDb: true; silent?: boolean; reply: string };

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jakash.app';

function startOfTodaySaoPaulo(): string {
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  return `${ymd}T00:00:00-03:00`;
}

// Roda ANTES de gastar uma chamada de IA: número desconhecido, assinatura inativa e limite diário.
// Devolve null quando a mensagem pode seguir para a IA.
export async function whatsappGate(admin: SupabaseClient, phone: string): Promise<GateResult | null> {
  const { data: profile } = await admin.from('profiles').select('id').eq('whatsapp_number', phone).maybeSingle();
  if (!profile) {
    return {
      success: false, skipDb: true,
      reply: `Ainda não conheço este número. 📱 Crie sua conta (7 dias grátis) em ${siteUrl()} e conecte seu WhatsApp em Configurações › WhatsApp.`,
    };
  }

  const ent = await getEntitlement(admin, profile.id);
  if (!isEntitled(ent)) {
    return {
      success: false, skipDb: true,
      reply: `Sua assinatura do Jakash não está ativa. Renove em ${siteUrl()} (Configurações › Planos) para voltar a lançar por aqui.`,
    };
  }

  // Limite diário por número: conta as mensagens recebidas hoje (a atual já está na fila).
  const limit = whatsappDailyLimit(ent?.plan);
  const { count, error } = await admin.from('whatsapp_inbox').select('id', { count: 'exact', head: true })
    .eq('phone_number', phone).gte('created_at', startOfTodaySaoPaulo());
  if (error || count === null) return null; // sem como contar: deixa passar em vez de travar quem paga
  if (count === limit + 1) {
    return { success: false, skipDb: true, reply: 'Você chegou ao limite de mensagens de hoje. Amanhã eu volto a lançar seus gastos por aqui! 🙂' };
  }
  if (count > limit + 1) return { success: false, skipDb: true, silent: true, reply: '' };
  return null;
}

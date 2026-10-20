// Envio ativo de WhatsApp (lembretes). Respostas às mensagens do usuário continuam no worker.
//
// A Meta só permite que a empresa INICIE a conversa com um modelo (template) aprovado; texto livre só funciona
// dentro de 24h depois da última mensagem do usuário. Por isso:
//  - com WHATSAPP_REMINDER_TEMPLATE definido, usa o modelo (corpo com 2 variáveis: {{1}} nome, {{2}} resumo);
//  - sem ele, tenta texto livre (só chega para quem falou com o Jakash nas últimas 24h).
// Mensagens de modelo iniciadas pela empresa são cobradas pela Meta.

import { sendMessage } from '@/lib/whatsappApi';

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

const oneLine = (s: string) => s.replace(/[\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();

export type WhatsAppResult = { ok: boolean; reason?: 'not_configured' | 'bad_number' | 'rejected' | 'network'; status?: number; template: boolean };

/** Igual ao sendWhatsAppReminder, mas devolve o motivo da falha (usado pelo botão "Enviar teste"). */
export async function sendWhatsAppResult(toPhone: string, input: { name: string; summary: string; text: string }): Promise<WhatsAppResult> {
  const template = Boolean(process.env.WHATSAPP_REMINDER_TEMPLATE);
  if (!whatsappConfigured()) return { ok: false, reason: 'not_configured', template };
  const to = toPhone.replace(/\D/g, '');
  if (to.length < 10) return { ok: false, reason: 'bad_number', template };

  const payload = template
    ? {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: process.env.WHATSAPP_REMINDER_TEMPLATE,
          language: { code: process.env.WHATSAPP_REMINDER_LANG || 'pt_BR' },
          components: [{ type: 'body', parameters: [{ type: 'text', text: oneLine(input.name) || 'tudo bem' }, { type: 'text', text: oneLine(input.summary).slice(0, 900) }] }],
        },
      }
    : { messaging_product: 'whatsapp', to, type: 'text', text: { body: input.text } };

  // Versão da Graph API, token e tratamento de erro ficam em whatsappApi.ts.
  const res = await sendMessage(payload);
  if (res.ok) return { ok: true, status: res.status, template };
  if (res.status === 0) return { ok: false, reason: 'network', template };
  console.error('[whatsapp] lembrete recusado', res.status, template ? '(modelo)' : '(texto livre)');
  return { ok: false, reason: 'rejected', status: res.status, template };
}

export async function sendWhatsAppReminder(toPhone: string, input: { name: string; summary: string; text: string }): Promise<boolean> {
  return (await sendWhatsAppResult(toPhone, input)).ok;
}

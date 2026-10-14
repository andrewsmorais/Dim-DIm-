// Envio ativo de WhatsApp (lembretes). Respostas às mensagens do usuário continuam no worker.
//
// A Meta só permite que a empresa INICIE a conversa com um modelo (template) aprovado; texto livre só funciona
// dentro de 24h depois da última mensagem do usuário. Por isso:
//  - com WHATSAPP_REMINDER_TEMPLATE definido, usa o modelo (corpo com 2 variáveis: {{1}} nome, {{2}} resumo);
//  - sem ele, tenta texto livre (só chega para quem falou com o Jakash nas últimas 24h).
// Mensagens de modelo iniciadas pela empresa são cobradas pela Meta.

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

const oneLine = (s: string) => s.replace(/[\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim();

export async function sendWhatsAppReminder(toPhone: string, input: { name: string; summary: string; text: string }): Promise<boolean> {
  if (!whatsappConfigured()) return false;
  const to = toPhone.replace(/\D/g, '');
  if (to.length < 10) return false;

  const template = process.env.WHATSAPP_REMINDER_TEMPLATE;
  const payload = template
    ? {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_REMINDER_LANG || 'pt_BR' },
          components: [{ type: 'body', parameters: [{ type: 'text', text: oneLine(input.name) || 'tudo bem' }, { type: 'text', text: oneLine(input.summary).slice(0, 900) }] }],
        },
      }
    : { messaging_product: 'whatsapp', to, type: 'text', text: { body: input.text } };

  try {
    const version = process.env.WHATSAPP_GRAPH_VERSION || 'v21.0';
    const res = await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('[whatsapp] lembrete recusado', res.status, template ? '(modelo)' : '(texto livre)');
    return res.ok;
  } catch (err) {
    console.error('[whatsapp] falha no envio', (err as Error).message);
    return false;
  }
}

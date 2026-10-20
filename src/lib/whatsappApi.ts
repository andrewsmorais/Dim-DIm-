// Cliente único da Graph API do WhatsApp (Meta). Todo envio passa por aqui para a versão da API
// e o tratamento de erro ficarem em um lugar só.
//
// Só servidor: usa WHATSAPP_ACCESS_TOKEN. Nunca importe em componente de navegador.

const DEFAULT_GRAPH_VERSION = 'v26.0';

export function graphVersion(): string {
  return process.env.WHATSAPP_GRAPH_VERSION || DEFAULT_GRAPH_VERSION;
}

export function graphUrl(path: string): string {
  return `https://graph.facebook.com/${graphVersion()}/${path.replace(/^\/+/, '')}`;
}

export type SendResult = {
  ok: boolean;
  status: number;
  /** wamid da mensagem enviada (a Meta devolve em messages[0].id). */
  wamid?: string;
  /** Só para diagnóstico: código e tipo do erro da Meta. Nunca contém token nem o texto enviado. */
  errorCode?: number;
  errorType?: string;
};

type MetaError = { error?: { code?: number; type?: string; error_subcode?: number; fbtrace_id?: string } };
type MetaSend = { messages?: { id?: string }[] };

/** Envia a carga já montada ({ messaging_product, to, type, ... }) para /{phone_number_id}/messages. */
export async function sendMessage(payload: Record<string, unknown>): Promise<SendResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return { ok: false, status: 0 };

  try {
    const res = await fetch(graphUrl(`${phoneId}/messages`), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const body = (await res.json().catch(() => null)) as MetaSend | null;
      return { ok: true, status: res.status, wamid: body?.messages?.[0]?.id };
    }

    const body = (await res.json().catch(() => null)) as MetaError | null;
    const code = body?.error?.code;
    const type = body?.error?.type;
    // Sem token, sem número do cliente e sem texto da mensagem no log.
    console.error(`[whatsapp] envio recusado: status=${res.status} code=${code ?? '?'} type=${type ?? '?'} sub=${body?.error?.error_subcode ?? '-'} trace=${body?.error?.fbtrace_id ?? '-'}`);
    return { ok: false, status: res.status, errorCode: code, errorType: type };
  } catch (err) {
    console.error('[whatsapp] falha de rede no envio:', (err as Error).message);
    return { ok: false, status: 0 };
  }
}

/** Texto livre (vale dentro da janela de 24 h depois da última mensagem da pessoa). */
export function sendText(to: string, body: string): Promise<SendResult> {
  return sendMessage({
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body },
  });
}

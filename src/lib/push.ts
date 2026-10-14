import webpush from 'web-push';

// Push web (gratuito): o navegador do usuário recebe o aviso mesmo com o app fechado.
// Chaves VAPID: `npx web-push generate-vapid-keys` -> NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY (+ VAPID_SUBJECT opcional).

export type PushSub = { endpoint: string; p256dh: string; auth: string };
export type PushPayload = { title: string; body: string; url?: string; tag?: string };
export type PushResult = 'ok' | 'gone' | 'error';

export function pushConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let ready = false;
function init() {
  if (ready) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'https://www.jakash.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );
  ready = true;
}

/** 'gone' = a inscrição expirou ou foi revogada (404/410): quem chama deve apagá-la. */
export async function sendPush(sub: PushSub, payload: PushPayload): Promise<PushResult> {
  if (!pushConfigured()) return 'error';
  try {
    init();
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
      { TTL: 12 * 3600, urgency: 'normal' },
    );
    return 'ok';
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) return 'gone';
    console.error('[push] falha no envio', status ?? (err as Error).message);
    return 'error';
  }
}

/** Só aceita endpoints https de serviços de push (evita usar a rota para chamar endereços internos). */
export function isValidPushEndpoint(endpoint: string): boolean {
  try {
    const u = new URL(endpoint);
    return u.protocol === 'https:' && u.hostname.includes('.') && !/^(localhost|\d+\.\d+\.\d+\.\d+)$/.test(u.hostname);
  } catch {
    return false;
  }
}

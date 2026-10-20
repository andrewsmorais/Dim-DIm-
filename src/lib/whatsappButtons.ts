// Identificadores dos botões e das linhas de lista enviados pela Jaki. Formato "verbo:dados".
// O que volta da Meta é tratado como entrada de usuário: tudo é validado aqui antes de virar operação.

export type ButtonAction =
  | { t: 'confirm'; pendingId: string }
  | { t: 'cancel'; pendingId: string }
  | { t: 'undo'; group: string }
  | { t: 'ask_category'; group: string }
  | { t: 'set_category'; group: string; categoryId: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// wamid da Meta: letras, números, ponto, hífen, sublinhado e "=" (base64 url). Nunca ":".
const WAMID = /^[A-Za-z0-9._=\-]{8,200}$/;

export const confirmId = (pendingId: string) => `cf:${pendingId}`;
export const cancelId = (pendingId: string) => `cx:${pendingId}`;
export const undoId = (group: string) => `un:${group}`;
export const askCategoryId = (group: string) => `rc:${group}`;
export const setCategoryId = (group: string, categoryId: string) => `cat:${group}:${categoryId}`;

export function parseButtonId(id: string | undefined | null): ButtonAction | null {
  if (!id) return null;
  const i = id.indexOf(':');
  if (i < 0) return null;
  const verb = id.slice(0, i);
  const rest = id.slice(i + 1);
  if ((verb === 'cf' || verb === 'cx') && UUID.test(rest)) return { t: verb === 'cf' ? 'confirm' : 'cancel', pendingId: rest.toLowerCase() };
  if ((verb === 'un' || verb === 'rc') && WAMID.test(rest)) return verb === 'un' ? { t: 'undo', group: rest } : { t: 'ask_category', group: rest };
  if (verb === 'cat') {
    const j = rest.lastIndexOf(':');
    if (j < 0) return null;
    const group = rest.slice(0, j);
    const categoryId = rest.slice(j + 1);
    if (WAMID.test(group) && UUID.test(categoryId)) return { t: 'set_category', group, categoryId: categoryId.toLowerCase() };
  }
  return null;
}

/** Lê a resposta interativa de uma mensagem da Meta (botão ou linha de lista). */
export function interactiveReplyId(message: { type?: string; interactive?: { type?: string; button_reply?: { id?: string }; list_reply?: { id?: string } } }): string | null {
  if (message?.type !== 'interactive') return null;
  const i = message.interactive;
  return i?.button_reply?.id ?? i?.list_reply?.id ?? null;
}

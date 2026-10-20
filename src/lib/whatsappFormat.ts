// Formatação de texto para o WhatsApp. Puro (sem rede e sem banco), por isso é fácil de testar.
// Não usa Intl/toLocaleString de propósito: o resultado não pode variar com o ambiente do servidor.

const pad = (n: number) => String(n).padStart(2, '0');

/** 1234.5 -> "R$ 1.234,50" */
export function brlText(n: number): string {
  const neg = n < 0;
  const cents = Math.round(Math.abs(n) * 100);
  const int = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '-' : ''}R$ ${int},${pad(cents % 100)}`;
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const monthName = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1];

/** "2026-10-20" -> "20/10" (ou "20/10/2025" se não for do ano de referência). */
export function dayMonth(iso: string, refYear?: string): string {
  const [y, m, d] = iso.split('-');
  return refYear && y !== refYear ? `${d}/${m}/${y}` : `${d}/${m}`;
}

export function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** "hoje", "ontem", "amanhã" ou "19/10". */
export function relDay(iso: string, today: string): string {
  if (iso === today) return 'hoje';
  if (iso === addDaysISO(today, -1)) return 'ontem';
  if (iso === addDaysISO(today, 1)) return 'amanhã';
  return dayMonth(iso, today.slice(0, 4));
}

/** Período para dizer de onde vêm os números: "de 1 a 20/10", "de 28/10 a 03/11". Datas inclusivas. */
export function periodLabel(from: string, to: string, refYear?: string): string {
  const [fy, fm, fd] = from.split('-');
  const [ty, tm, td] = to.split('-');
  if (from === to) return `em ${dayMonth(to, refYear)}`;
  if (fy === ty && fm === tm) return `de ${Number(fd)} a ${td}/${tm}${refYear && ty !== refYear ? `/${ty}` : ''}`;
  return `de ${dayMonth(from, refYear)} a ${dayMonth(to, refYear)}`;
}

/** O WhatsApp usa *negrito* com um asterisco; a IA costuma devolver **negrito**. Também tira títulos markdown. */
export function toWhatsAppText(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, '*$1*')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** minúsculas e sem acento, para comparar texto digitado */
export function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

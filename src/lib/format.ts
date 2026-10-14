export const brl = (n: number): string =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// "1.234,56" | "1234,56" | "1234.56" | "R$ 50" -> number (NaN se inválido)
export function parseMoney(input: string): number {
  const s = input.replace(/[^\d.,-]/g, "").trim();
  if (!s) return NaN;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// "2026-10" -> { start: "2026-10-01", end: "2026-11-01" }
export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const next = new Date(y, m, 1);
  return { start: `${y}-${pad(m)}-01`, end: `${next.getFullYear()}-${pad(next.getMonth() + 1)}-01` };
}

// Primeiro dia do mês, N meses atrás (ex.: 3 -> início de 3 meses atrás)
export function monthStartAgo(n: number): string {
  const d = new Date();
  const t = new Date(d.getFullYear(), d.getMonth() - n, 1);
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-01`;
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function daysUntil(iso: string): number {
  const today = new Date(todayISO() + "T00:00:00").getTime();
  const target = new Date(iso + "T00:00:00").getTime();
  return Math.round((target - today) / 86_400_000);
}

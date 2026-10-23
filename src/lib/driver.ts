// Motorista de app: contas do dia (horas, combustível, custo do carro, ganho por hora e por km) e resumo por período/plataforma.
// Tudo calculado no aparelho, sem serviço externo.

export const FUELS = {
  gasolina: { label: "Gasolina", unit: "km/l", price: "R$ por litro" },
  etanol: { label: "Etanol", unit: "km/l", price: "R$ por litro" },
  flex: { label: "Flex (gasolina ou etanol)", unit: "km/l", price: "R$ por litro" },
  diesel: { label: "Diesel", unit: "km/l", price: "R$ por litro" },
  gnv: { label: "GNV", unit: "km/m³", price: "R$ por m³" },
  eletrico: { label: "Elétrico", unit: "km/kWh", price: "R$ por kWh" },
} as const;
export type FuelKind = keyof typeof FUELS;
export const isFuel = (v: unknown): v is FuelKind => typeof v === "string" && Object.prototype.hasOwnProperty.call(FUELS, v);

export type Vehicle = {
  id: string; name: string; fuel: FuelKind; efficiency: number; fuel_price: number;
  cost_per_km: number; daily_rent: number; archived: boolean;
};

export type Earning = { platform: string; amount: number; hours?: number | null; trips?: number | null };

export type Shift = {
  id: string; date: string; vehicle_id: string | null;
  start_time: string | null; end_time: string | null; break_minutes: number;
  km: number; fuel: FuelKind | null; efficiency: number | null; fuel_price: number | null;
  cost_per_km: number; rent: number;
  earnings: Earning[]; tips: number;
  tolls: number; parking: number; wash: number; food: number; other_cost: number;
  notes: string | null; income_tx_id: string | null; expense_tx_id: string | null;
};

const r2 = (n: number) => Math.round(n * 100) / 100;
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

/** "08:30" -> minutos do dia (null se inválido). */
export function minutesOf(t: string | null | undefined): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(t ?? "");
  if (!m) return null;
  const h = +m[1], mi = +m[2];
  return h <= 23 && mi <= 59 ? h * 60 + mi : null;
}

/** Horas trabalhadas: fim - início - pausa. Fim antes do início = virou a noite. */
export function workedHours(start: string | null, end: string | null, breakMinutes = 0): number {
  const a = minutesOf(start), b = minutesOf(end);
  if (a === null || b === null) return 0;
  let span = b - a;
  if (span <= 0) span += 24 * 60;
  return Math.max(0, (span - Math.max(0, breakMinutes)) / 60);
}

/** Combustível estimado: km ÷ média × preço. */
export function fuelCost(km: number, efficiency: number | null, price: number | null): number {
  if (!(km > 0) || !(num(efficiency) > 0) || !(num(price) > 0)) return 0;
  return r2((km / num(efficiency)) * num(price));
}

export type Metrics = {
  hours: number; km: number; trips: number;
  gross: number; tips: number;
  fuel: number; vehicle: number; extras: number; expenses: number; net: number;
  grossPerHour: number | null; netPerHour: number | null;
  grossPerKm: number | null; netPerKm: number | null; costPerKm: number | null;
};

const div = (a: number, b: number) => (b > 0 ? r2(a / b) : null);

function finish(m: Omit<Metrics, "grossPerHour" | "netPerHour" | "grossPerKm" | "netPerKm" | "costPerKm" | "expenses" | "net">): Metrics {
  const expenses = r2(m.fuel + m.vehicle + m.extras);
  const net = r2(m.gross - expenses);
  return {
    ...m, hours: Math.round(m.hours * 100) / 100, km: Math.round(m.km * 10) / 10, gross: r2(m.gross), tips: r2(m.tips),
    fuel: r2(m.fuel), vehicle: r2(m.vehicle), extras: r2(m.extras), expenses, net,
    grossPerHour: div(m.gross, m.hours), netPerHour: div(net, m.hours),
    grossPerKm: div(m.gross, m.km), netPerKm: div(net, m.km), costPerKm: div(expenses, m.km),
  };
}

export const earningsTotal = (s: Pick<Shift, "earnings">) => r2(s.earnings.reduce((t, e) => t + num(e.amount), 0));
export const extrasOf = (s: Shift) => r2(num(s.tolls) + num(s.parking) + num(s.wash) + num(s.food) + num(s.other_cost));

/** Contas de um dia inteiro (todas as plataformas + gorjetas). */
export function shiftMetrics(s: Shift): Metrics {
  const km = num(s.km);
  return finish({
    hours: workedHours(s.start_time, s.end_time, s.break_minutes),
    km, trips: s.earnings.reduce((t, e) => t + num(e.trips), 0),
    gross: earningsTotal(s) + num(s.tips), tips: num(s.tips),
    fuel: fuelCost(km, s.efficiency, s.fuel_price),
    vehicle: km * num(s.cost_per_km) + num(s.rent),
    extras: extrasOf(s),
  });
}

/**
 * Parte de uma plataforma num dia. Horas: as informadas para ela; se o dia teve só ela, o dia todo;
 * senão, proporcional ao que ela rendeu (estimado). Km e despesas também proporcionais quando há mais de uma.
 */
export function platformShare(s: Shift, platform: string): { metrics: Metrics; estimatedHours: boolean } | null {
  const mine = s.earnings.filter((e) => e.platform === platform);
  if (!mine.length) return null;
  const all = shiftMetrics(s);
  const total = earningsTotal(s);
  const amount = mine.reduce((t, e) => t + num(e.amount), 0);
  const only = s.earnings.every((e) => e.platform === platform);
  const share = only ? 1 : total > 0 ? amount / total : 0;
  const givenHours = mine.reduce((t, e) => t + num(e.hours), 0);
  const hours = givenHours > 0 ? givenHours : all.hours * share;
  return {
    estimatedHours: !(givenHours > 0) && !only,
    metrics: finish({
      hours, km: all.km * share, trips: mine.reduce((t, e) => t + num(e.trips), 0),
      gross: amount + (only ? num(s.tips) : 0), tips: only ? num(s.tips) : 0,
      fuel: all.fuel * share, vehicle: all.vehicle * share, extras: all.extras * share,
    }),
  };
}

const ZERO = { hours: 0, km: 0, trips: 0, gross: 0, tips: 0, fuel: 0, vehicle: 0, extras: 0 };
type Acc = typeof ZERO;
const add = (a: Acc, m: Metrics): Acc => ({
  hours: a.hours + m.hours, km: a.km + m.km, trips: a.trips + m.trips, gross: a.gross + m.gross, tips: a.tips + m.tips,
  fuel: a.fuel + m.fuel, vehicle: a.vehicle + m.vehicle, extras: a.extras + m.extras,
});

export type PlatformRow = { platform: string; days: number; metrics: Metrics; estimatedHours: boolean };
export type Summary = { days: number; total: Metrics; byPlatform: PlatformRow[] };

/** Resumo do período. Com plataforma escolhida, conta só a parte dela em cada dia. */
export function summarize(shifts: Shift[], platform?: string | null): Summary {
  let acc: Acc = { ...ZERO };
  let days = 0;
  const per = new Map<string, { acc: Acc; days: number; est: boolean }>();
  for (const s of shifts) {
    if (platform) {
      const part = platformShare(s, platform);
      if (!part) continue;
      acc = add(acc, part.metrics);
      days++;
    } else {
      acc = add(acc, shiftMetrics(s));
      days++;
    }
    const keys = Array.from(new Set(s.earnings.map((e) => e.platform)));
    for (const k of keys) {
      if (platform && k !== platform) continue;
      const part = platformShare(s, k);
      if (!part) continue;
      const cur = per.get(k) ?? { acc: { ...ZERO }, days: 0, est: false };
      per.set(k, { acc: add(cur.acc, part.metrics), days: cur.days + 1, est: cur.est || part.estimatedHours });
    }
  }
  const byPlatform = Array.from(per.entries())
    .map(([k, v]) => ({ platform: k, days: v.days, metrics: finish(v.acc), estimatedHours: v.est }))
    .sort((a, b) => b.metrics.gross - a.metrics.gross);
  return { days, total: finish(acc), byPlatform };
}

/** Linha do banco -> Shift com números (o Postgres devolve numeric como texto). */
export function normalizeShift(r: Record<string, unknown>): Shift {
  const earnings = Array.isArray(r.earnings) ? (r.earnings as Record<string, unknown>[]) : [];
  return {
    id: String(r.id), date: String(r.date), vehicle_id: (r.vehicle_id as string | null) ?? null,
    start_time: (r.start_time as string | null) ?? null, end_time: (r.end_time as string | null) ?? null,
    break_minutes: num(r.break_minutes), km: num(r.km),
    fuel: isFuel(r.fuel) ? r.fuel : null, efficiency: r.efficiency == null ? null : num(r.efficiency), fuel_price: r.fuel_price == null ? null : num(r.fuel_price),
    cost_per_km: num(r.cost_per_km), rent: num(r.rent),
    earnings: earnings.filter((e) => typeof e?.platform === "string").map((e) => ({
      platform: String(e.platform), amount: num(e.amount),
      hours: e.hours == null ? null : num(e.hours), trips: e.trips == null ? null : num(e.trips),
    })),
    tips: num(r.tips), tolls: num(r.tolls), parking: num(r.parking), wash: num(r.wash), food: num(r.food), other_cost: num(r.other_cost),
    notes: (r.notes as string | null) ?? null, income_tx_id: (r.income_tx_id as string | null) ?? null, expense_tx_id: (r.expense_tx_id as string | null) ?? null,
  };
}

export const SHIFT_COLUMNS = "id,date,vehicle_id,start_time,end_time,break_minutes,km,fuel,efficiency,fuel_price,cost_per_km,rent,earnings,tips,tolls,parking,wash,food,other_cost,notes,income_tx_id,expense_tx_id";
export const VEHICLE_COLUMNS = "id,name,fuel,efficiency,fuel_price,cost_per_km,daily_rent,archived";

export function normalizeVehicle(r: Record<string, unknown>): Vehicle {
  return {
    id: String(r.id), name: String(r.name ?? "Carro"), fuel: isFuel(r.fuel) ? r.fuel : "gasolina",
    efficiency: num(r.efficiency), fuel_price: num(r.fuel_price), cost_per_km: num(r.cost_per_km), daily_rent: num(r.daily_rent), archived: Boolean(r.archived),
  };
}

/** Horas decimais -> "5h 30min". */
export function hoursLabel(h: number): string {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60), mm = total % 60;
  return hh && mm ? `${hh}h ${mm}min` : hh ? `${hh}h` : `${mm}min`;
}

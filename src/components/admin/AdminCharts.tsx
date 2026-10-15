"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { brl } from "@/lib/format";
import type { PeriodFinance } from "@/lib/adminMetrics";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const labelMonth = (d: string) => `${MONTHS[Number(d.slice(5, 7)) - 1]}/${d.slice(2, 4)}`;
const labelDay = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

const C_MEI = "#5B5BF0";
const C_CPF = "#A78BFA";
const C_OK = "#10B981";
const C_BAD = "#EF4444";

export function RevenueChart({ series, grain }: { series: PeriodFinance[]; grain: 'day' | 'month' }) {
  const labelFn = grain === 'day' ? labelDay : labelMonth;
  const data = series.map((m, i) => ({
    name: labelFn((m as any).from || (m as any).bucket || `2026-01-${String(i + 1).padStart(2, '0')}`),
    CPF: m.revenue_cpf,
    MEI: m.revenue_mei,
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip formatter={(v) => brl(Number(v))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="MEI" stackId="r" fill={C_MEI} />
        <Bar dataKey="CPF" stackId="r" fill={C_CPF} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CustomersChart({ series, grain }: { series: PeriodFinance[]; grain: 'day' | 'month' }) {
  const labelFn = grain === 'day' ? labelDay : labelMonth;
  const data = series.map((m, i) => ({
    name: labelFn((m as any).from || (m as any).bucket || `2026-01-${String(i + 1).padStart(2, '0')}`),
    Novos: m.new_customers,
    Cancelamentos: m.churned,
  }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Novos" fill={C_OK} radius={[6, 6, 0, 0]} />
        <Bar dataKey="Cancelamentos" fill={C_BAD} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

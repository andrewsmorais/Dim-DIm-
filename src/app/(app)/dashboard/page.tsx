"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useSupabase } from "@/lib/useSupabase";
import { brl, currentMonth, monthRange, formatDateBR, daysUntil } from "@/lib/format";
import { Card, Progress, Empty } from "@/components/ui/page";

type Tx = { id: string; description: string; amount: number; type: "income" | "expense"; date: string; category_id: string | null };
type Bill = { id: string; description: string; amount: number; due_date: string; type: "income" | "expense" };
type Goal = { id: string; name: string; icon: string | null; target_amount: number; current_amount: number };
type Budget = { id: string; category_id: string | null; amount_limit: number };

const COLORS = ["#5B5BF0", "#8B5CF6", "#38BDF8", "#F59E0B", "#10B981", "#EC4899", "#94A3B8"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default function DashboardPage() {
  const { supabase, userId, ready } = useSupabase();
  const [name, setName] = useState("");
  const [txs, setTxs] = useState<Tx[]>([]);
  const [cats, setCats] = useState<Record<string, string>>({});
  const [bills, setBills] = useState<Bill[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const { start, end } = monthRange(currentMonth());
    const [p, t, c, b, g, bd] = await Promise.all([
      supabase.from("profiles").select("full_name").maybeSingle(),
      supabase.from("transactions").select("id,description,amount,type,date,category_id").gte("date", start).lt("date", end).order("date", { ascending: false }).limit(1000),
      supabase.from("categories").select("id,name"),
      supabase.from("bills").select("id,description,amount,due_date,type").eq("status", "pending").order("due_date").limit(5),
      supabase.from("goals").select("id,name,icon,target_amount,current_amount").eq("status", "in_progress").order("created_at").limit(3),
      supabase.from("budgets").select("id,category_id,amount_limit"),
    ]);
    setError(Boolean(t.error || c.error));
    setName((p.data?.full_name ?? "").split(" ")[0]);
    setTxs(((t.data ?? []) as Tx[]).map((x) => ({ ...x, amount: Number(x.amount) })));
    setCats(Object.fromEntries((c.data ?? []).map((x) => [x.id, x.name])));
    setBills(((b.data ?? []) as Bill[]).map((x) => ({ ...x, amount: Number(x.amount) })));
    setGoals(((g.data ?? []) as Goal[]).map((x) => ({ ...x, target_amount: Number(x.target_amount), current_amount: Number(x.current_amount ?? 0) })));
    setBudgets(((bd.data ?? []) as Budget[]).map((x) => ({ ...x, amount_limit: Number(x.amount_limit) })));
  }, [supabase]);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, load]);

  const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const byCat = Object.entries(
    txs.filter((t) => t.type === "expense").reduce<Record<string, number>>((m, t) => {
      const k = t.category_id ? cats[t.category_id] ?? "Outros" : "Sem categoria";
      m[k] = (m[k] ?? 0) + t.amount;
      return m;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const pie = byCat.slice(0, 6).map(([n, v]) => ({ name: n, value: v }));
  if (byCat.length > 6) pie.push({ name: "Demais", value: byCat.slice(6).reduce((s, [, v]) => s + v, 0) });

  const general = budgets.find((b) => b.category_id === null);
  const generalPct = general ? (expense / general.amount_limit) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">{greeting()},</p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{name || "bem-vindo"} 👋</h1>
      </div>
      {error && <p className="text-sm text-red-500 font-medium mb-4">Não foi possível carregar alguns dados.</p>}

      {/* Saldo do mês */}
      <div className="rounded-[28px] p-6 md:p-8 mb-6 text-white shadow-xl shadow-brand-dark/30 bg-gradient-to-br from-[#6C6CF5] via-[#7C6CF7] to-[#A78BFA] dark:from-[#8B5CFF] dark:via-[#8B5CFF] dark:to-[#8B5CFF] dark:shadow-none">
        <p className="text-sm font-medium opacity-90">Saldo do mês</p>
        <p className="text-4xl md:text-5xl font-extrabold tracking-tight my-2">{brl(income - expense)}</p>
        <div className="flex flex-wrap gap-6 text-sm font-bold mt-4">
          <span>↑ Receitas {brl(income)}</span>
          <span>↓ Despesas {brl(expense)}</span>
        </div>
        {general && (
          <div className="mt-5">
            <div className="flex justify-between text-xs font-bold mb-1.5 opacity-90"><span>Limite geral do mês</span><span>{Math.round(generalPct)}% de {brl(general.amount_limit)}</span></div>
            <div className="h-2.5 rounded-full bg-white/25 overflow-hidden"><div className="h-full rounded-full bg-white" style={{ width: `${Math.min(generalPct, 100)}%` }} /></div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por categoria */}
        <Card>
          <p className="font-extrabold mb-4">Para onde foi o dinheiro</p>
          {pie.length === 0 ? <Empty>Registre uma despesa (aqui ou pelo WhatsApp) para ver o gráfico.</Empty> : (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-44 h-44 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pie} dataKey="value" innerRadius={58} outerRadius={80} paddingAngle={3} stroke="none">
                      {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-sm font-extrabold">{brl(expense)}</span>
                  <span className="text-[10px] text-gray-500">Total gasto</span>
                </div>
              </div>
              <ul className="w-full space-y-2 text-sm">
                {pie.map((p, i) => (
                  <li key={p.name} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 min-w-0"><span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} /><span className="truncate">{p.name}</span></span>
                    <span className="font-bold">{Math.round((p.value / expense) * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Últimas transações */}
        <Card>
          <div className="flex items-center justify-between mb-4"><p className="font-extrabold">Últimas transações</p><Link href="/transacoes" className="text-xs font-bold text-brand-dark dark:text-[#A78BFA]">Ver todas</Link></div>
          {txs.length === 0 ? <Empty>Nenhuma transação neste mês.</Empty> : (
            <ul className="divide-y divide-gray-100 dark:divide-[#262626]">
              {txs.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0"><p className="font-bold truncate text-sm">{t.description}</p><p className="text-xs text-gray-500">{formatDateBR(t.date)}</p></div>
                  <span className={`font-bold text-sm ${t.type === "income" ? "text-emerald-500" : "text-red-500"}`}>{t.type === "income" ? "+" : "-"}{brl(t.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Contas a vencer */}
        <Card>
          <div className="flex items-center justify-between mb-4"><p className="font-extrabold">Próximas contas</p><Link href="/contas" className="text-xs font-bold text-brand-dark dark:text-[#A78BFA]">Ver todas</Link></div>
          {bills.length === 0 ? <Empty>Nenhuma conta pendente.</Empty> : (
            <ul className="divide-y divide-gray-100 dark:divide-[#262626]">
              {bills.map((b) => {
                const d = daysUntil(b.due_date);
                return (
                  <li key={b.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="min-w-0"><p className="font-bold truncate text-sm">{b.description}</p>
                      <p className={`text-xs ${d < 0 ? "text-red-500 font-bold" : d <= 3 ? "text-amber-600 font-bold" : "text-gray-500"}`}>{formatDateBR(b.due_date)}{d < 0 ? " · vencida" : d === 0 ? " · hoje" : ""}</p></div>
                    <span className="font-bold text-sm">{brl(b.amount)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Objetivos */}
        <Card>
          <div className="flex items-center justify-between mb-4"><p className="font-extrabold">Objetivos</p><Link href="/metas" className="text-xs font-bold text-brand-dark dark:text-[#A78BFA]">Ver todos</Link></div>
          {goals.length === 0 ? <Empty>Crie um objetivo: viagem, reserva, bebê...</Empty> : (
            <div className="space-y-4">
              {goals.map((g) => {
                const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1.5"><span className="font-bold">{g.icon ?? "🎯"} {g.name}</span><span className="text-gray-500">{Math.round(pct)}%</span></div>
                    <Progress value={pct} />
                    <p className="text-xs text-gray-500 mt-1">{brl(g.current_amount)} de {brl(g.target_amount)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

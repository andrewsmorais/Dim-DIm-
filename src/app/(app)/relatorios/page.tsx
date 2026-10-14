"use client";

import { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { brl, currentMonth, monthRange } from "@/lib/format";
import { PageHeader, Card, Progress, Empty, ErrorNote, inputCls, btnCls } from "@/components/ui/page";

type Row = { description: string; amount: number; type: "income" | "expense"; date: string; category: string };

export default function RelatoriosPage() {
  const { supabase, userId, ready } = useSupabase();
  const [month, setMonth] = useState(currentMonth());
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { start, end } = monthRange(month);
    const [c, t] = await Promise.all([
      supabase.from("categories").select("id,name"),
      supabase.from("transactions").select("description,amount,type,date,category_id").gte("date", start).lt("date", end).order("date"),
    ]);
    if (c.error || t.error) { setError("Não foi possível carregar o relatório."); return; }
    setError(null);
    const names = new Map((c.data ?? []).map((x) => [x.id, x.name]));
    setRows((t.data ?? []).map((x) => ({ description: x.description, amount: Number(x.amount), type: x.type, date: x.date, category: names.get(x.category_id) ?? "Sem categoria" })));
  }, [supabase, month]);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, load]);

  const income = rows.filter((r) => r.type === "income").reduce((s, r) => s + r.amount, 0);
  const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0);
  const byCat = Object.entries(
    rows.filter((r) => r.type === "expense").reduce<Record<string, number>>((m, r) => ({ ...m, [r.category]: (m[r.category] ?? 0) + r.amount }), {})
  ).sort((a, b) => b[1] - a[1]);

  function exportCsv() {
    const esc = (v: string) => `"${v.replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
    const lines = ["Data;Descrição;Categoria;Tipo;Valor", ...rows.map((r) => [r.date, esc(r.description), esc(r.category), r.type === "income" ? "Receita" : "Despesa", r.amount.toFixed(2).replace(".", ",")].join(";"))];
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `jakash-${month}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader title="Relatórios" subtitle="Resumo do mês por categoria" action={
        <div className="flex gap-3">
          <input type="month" className={inputCls + " !w-auto"} value={month} onChange={(e) => setMonth(e.target.value)} />
          <button onClick={exportCsv} className={btnCls} disabled={rows.length === 0}><Download size={16} /> CSV</button>
        </div>
      } />
      <ErrorNote message={error} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card><p className="text-xs font-bold text-gray-500">Receitas</p><p className="text-2xl font-bold text-emerald-500">{brl(income)}</p></Card>
        <Card><p className="text-xs font-bold text-gray-500">Despesas</p><p className="text-2xl font-bold text-red-500">{brl(expense)}</p></Card>
        <Card><p className="text-xs font-bold text-gray-500">Resultado</p><p className="text-2xl font-bold">{brl(income - expense)}</p></Card>
      </div>
      <Card>
        <p className="font-extrabold mb-4">Despesas por categoria</p>
        {byCat.length === 0 ? <Empty>Sem despesas neste mês.</Empty> : (
          <div className="space-y-4">
            {byCat.map(([name, v]) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1"><span className="font-bold">{name}</span><span>{brl(v)} · {Math.round((v / expense) * 100)}%</span></div>
                <Progress value={(v / expense) * 100} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

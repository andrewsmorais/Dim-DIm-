"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { brl, parseMoney, currentMonth, monthRange } from "@/lib/format";
import { PageHeader, Card, Label, Progress, Empty, ErrorNote, inputCls, btnCls } from "@/components/ui/page";

type Cat = { id: string; name: string };
type Budget = { id: string; category_id: string | null; amount_limit: number };

export default function LimitesPage() {
  const { supabase, userId, ready } = useSupabase();
  const [cats, setCats] = useState<Cat[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [spent, setSpent] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [catId, setCatId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { start, end } = monthRange(currentMonth());
    const [c, b, t] = await Promise.all([
      supabase.from("categories").select("id,name").eq("type", "expense").order("name"),
      supabase.from("budgets").select("id,category_id,amount_limit"),
      supabase.from("transactions").select("amount,category_id").eq("type", "expense").gte("date", start).lt("date", end),
    ]);
    if (c.error || b.error || t.error) { setError("Não foi possível carregar os dados."); return; }
    setError(null);
    setCats((c.data ?? []) as Cat[]);
    setBudgets(((b.data ?? []) as Budget[]).map((x) => ({ ...x, amount_limit: Number(x.amount_limit) })));
    const map: Record<string, number> = {};
    let sum = 0;
    for (const r of t.data ?? []) {
      const v = Number(r.amount);
      sum += v;
      map[r.category_id ?? "none"] = (map[r.category_id ?? "none"] ?? 0) + v;
    }
    setSpent(map);
    setTotal(sum);
  }, [supabase]);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const v = parseMoney(amount);
    if (!(v > 0)) { setError("Informe um valor maior que zero."); return; }
    const category_id = catId || null;
    const existing = budgets.find((b) => b.category_id === category_id);
    const { error: err } = existing
      ? await supabase.from("budgets").update({ amount_limit: v }).eq("id", existing.id)
      : await supabase.from("budgets").insert({ user_id: userId, category_id, amount_limit: v });
    if (err) { setError("Não foi possível salvar o limite."); return; }
    setAmount("");
    load();
  }

  async function remove(id: string) {
    const { error: err } = await supabase.from("budgets").delete().eq("id", id);
    if (err) setError("Não foi possível excluir."); else load();
  }

  const rows = budgets.map((b) => {
    const used = b.category_id ? spent[b.category_id] ?? 0 : total;
    const pct = (used / b.amount_limit) * 100;
    return { ...b, used, pct, name: b.category_id ? cats.find((c) => c.id === b.category_id)?.name ?? "Categoria" : "Limite geral do mês" };
  }).sort((a, b) => b.pct - a.pct);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <PageHeader title="Limites de gasto" subtitle="Defina quanto quer gastar por mês e acompanhe em tempo real" />

      <Card className="mb-6">
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div><Label>Categoria</Label>
            <select className={inputCls} value={catId} onChange={(e) => setCatId(e.target.value)}>
              <option value="">Limite geral do mês</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div><Label>Limite mensal</Label><input className={inputCls} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" /></div>
          <button className={btnCls} type="submit">Salvar limite</button>
        </form>
        <ErrorNote message={error} />
      </Card>

      <div className="space-y-4">
        {rows.length === 0 && <Card><Empty>Nenhum limite definido ainda.</Empty></Card>}
        {rows.map((r) => {
          const tone = r.pct >= 100 ? "bad" : r.pct >= 80 ? "warn" : "ok";
          return (
            <Card key={r.id}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold">{r.name}</p>
                  <p className="text-sm text-gray-500">{brl(r.used)} de {brl(r.amount_limit)} ({Math.round(r.pct)}%)</p>
                </div>
                <button onClick={() => remove(r.id)} aria-label="Excluir" className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
              <Progress value={r.pct} tone={tone} />
              {r.pct >= 100 && <p className="text-xs text-red-500 font-bold mt-2">Limite estourado em {brl(r.used - r.amount_limit)}.</p>}
              {r.pct >= 80 && r.pct < 100 && <p className="text-xs text-amber-600 font-bold mt-2">Atenção: restam {brl(r.amount_limit - r.used)}.</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

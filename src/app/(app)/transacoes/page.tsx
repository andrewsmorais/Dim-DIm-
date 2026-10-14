"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { brl, parseMoney, todayISO, formatDateBR, currentMonth, monthRange } from "@/lib/format";
import { PageHeader, Card, Label, Empty, ErrorNote, inputCls, btnCls, btnGhostCls } from "@/components/ui/page";

type Cat = { id: string; name: string; type: "income" | "expense" };
type Tx = { id: string; description: string; amount: number; type: "income" | "expense"; date: string; category_id: string | null };

export default function TransacoesPage() {
  const { supabase, userId, ready } = useSupabase();
  const [cats, setCats] = useState<Cat[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ description: "", amount: "", type: "expense" as "income" | "expense", date: todayISO(), category_id: "" });

  const load = useCallback(async () => {
    const { start, end } = monthRange(month);
    const [c, t] = await Promise.all([
      supabase.from("categories").select("id,name,type").order("name"),
      supabase.from("transactions").select("id,description,amount,type,date,category_id")
        .gte("date", start).lt("date", end).order("date", { ascending: false }).limit(500),
    ]);
    if (c.error || t.error) setError("Não foi possível carregar os dados.");
    else setError(null);
    setCats((c.data as Cat[]) ?? []);
    setTxs(((t.data ?? []) as Tx[]).map((x) => ({ ...x, amount: Number(x.amount) })));
    setLoading(false);
  }, [supabase, month]);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseMoney(form.amount);
    if (!form.description.trim() || !(amount > 0)) { setError("Informe descrição e um valor maior que zero."); return; }
    const { error: err } = await supabase.from("transactions").insert({
      user_id: userId, description: form.description.trim(), amount, type: form.type,
      date: form.date, category_id: form.category_id || null, origin: "manual",
    });
    if (err) { setError("Não foi possível salvar."); return; }
    setForm({ ...form, description: "", amount: "" });
    load();
  }

  async function remove(id: string) {
    const { error: err } = await supabase.from("transactions").delete().eq("id", id);
    if (err) setError("Não foi possível excluir."); else load();
  }

  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? "Sem categoria";
  const shown = txs.filter((t) => filter === "all" || t.type === filter);
  const income = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <PageHeader title="Transações" subtitle="Tudo que você registrou, aqui ou pelo WhatsApp" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card><p className="text-xs font-bold text-gray-500">Receitas</p><p className="text-2xl font-bold text-emerald-500">{brl(income)}</p></Card>
        <Card><p className="text-xs font-bold text-gray-500">Despesas</p><p className="text-2xl font-bold text-red-500">{brl(expense)}</p></Card>
        <Card><p className="text-xs font-bold text-gray-500">Saldo do mês</p><p className="text-2xl font-bold">{brl(income - expense)}</p></Card>
      </div>

      <Card className="mb-6">
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div className="md:col-span-2"><Label>Descrição</Label><input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex.: mercado" /></div>
          <div><Label>Valor</Label><input className={inputCls} inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" /></div>
          <div><Label>Tipo</Label>
            <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense", category_id: "" })}>
              <option value="expense">Despesa</option><option value="income">Receita</option>
            </select></div>
          <div><Label>Categoria</Label>
            <select className={inputCls} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Sem categoria</option>
              {cats.filter((c) => c.type === form.type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div><Label>Data</Label><input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="md:col-span-6"><button className={btnCls} type="submit"><Plus size={16} /> Adicionar</button></div>
        </form>
        <ErrorNote message={error} />
      </Card>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input type="month" className={inputCls + " !w-auto"} value={month} onChange={(e) => setMonth(e.target.value)} />
        {(["all", "expense", "income"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? btnCls : btnGhostCls}>
            {f === "all" ? "Todas" : f === "expense" ? "Despesas" : "Receitas"}
          </button>
        ))}
      </div>

      <Card>
        {loading ? <Empty>Carregando...</Empty> : shown.length === 0 ? <Empty>Nenhuma transação neste período.</Empty> : (
          <ul className="divide-y divide-gray-100 dark:divide-[#262626]">
            {shown.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-bold truncate">{t.description}</p>
                  <p className="text-xs text-gray-500">{formatDateBR(t.date)} · {catName(t.category_id)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${t.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "-"}{brl(t.amount)}
                  </span>
                  <button onClick={() => remove(t.id)} aria-label="Excluir" className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

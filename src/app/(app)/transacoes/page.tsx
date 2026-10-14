"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, FileUp, Plus, Trash2 } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { brl, parseMoney, todayISO, formatDateBR, currentMonth, monthRange } from "@/lib/format";
import { categoryOptions, type CatRow } from "@/lib/categories";
import { usePartnership } from "@/lib/usePartnership";
import { useUsageType } from "@/lib/useUsageType";
import { WhoBadge } from "@/components/WhoBadge";
import { PageHeader, Card, Label, Empty, ErrorNote, inputCls, btnCls, btnGhostCls } from "@/components/ui/page";

type Tx = {
  id: string; user_id: string; description: string; amount: number; type: "income" | "expense"; date: string; category_id: string | null;
  card_id: string | null; installment_group: string | null; is_business: boolean; debit_card_id: string | null;
};

export default function TransacoesPage() {
  const { supabase, userId, ready } = useSupabase();
  const { shared, partner, nameOf } = usePartnership();
  const { isMei } = useUsageType();
  const [who, setWho] = useState<"all" | "me" | "partner">("all");
  const [scope, setScope] = useState<"all" | "pf" | "pj">("all");
  const [cats, setCats] = useState<CatRow[]>([]);
  const [cardNames, setCardNames] = useState<Record<string, string>>({});
  const [delTx, setDelTx] = useState<Tx | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [month, setMonth] = useState(currentMonth());
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ description: "", amount: "", type: "expense" as "income" | "expense", date: todayISO(), category_id: "" });

  const load = useCallback(async () => {
    const { start, end } = monthRange(month);
    const [c, t, k] = await Promise.all([
      supabase.from("categories").select("id,name,type,parent_id").order("name"),
      supabase.from("transactions").select("id,user_id,description,amount,type,date,category_id,card_id,installment_group,is_business,debit_card_id")
        .gte("date", start).lt("date", end).order("date", { ascending: false }).limit(500),
      supabase.from("credit_cards").select("id,name"),
    ]);
    if (c.error || t.error) setError("Não foi possível carregar os dados.");
    else setError(null);
    setCats((c.data as CatRow[]) ?? []);
    setCardNames(Object.fromEntries((k.data ?? []).map((x) => [x.id, x.name])));
    setTxs(((t.data ?? []) as Tx[]).map((x) => ({ ...x, amount: Number(x.amount) })));
    setLoading(false);
  }, [supabase, month]);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, load]);
  useEffect(() => {
    const h = () => load();
    window.addEventListener("jakash:changed", h);
    return () => window.removeEventListener("jakash:changed", h);
  }, [load]);

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

  async function remove(t: Tx, all = false) {
    setDelTx(null);
    const q = supabase.from("transactions").delete();
    const { error: err } = all && t.installment_group ? await q.eq("installment_group", t.installment_group) : await q.eq("id", t.id);
    if (err) setError("Não foi possível excluir."); else load();
  }

  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? "Sem categoria";
  // Na gestão compartilhada dá para ver só os seus lançamentos ou só os do parceiro; os totais seguem o filtro.
  const scoped = txs
    .filter((t) => !shared || who === "all" || (who === "me" ? t.user_id === userId : t.user_id === partner?.id))
    .filter((t) => scope === "all" || (scope === "pj") === t.is_business);
  const showScope = isMei || txs.some((t) => t.is_business);
  const shown = scoped.filter((t) => filter === "all" || t.type === filter);
  const income = scoped.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = scoped.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <PageHeader title="Transações" subtitle="Tudo que você registrou, aqui ou pelo WhatsApp"
        action={<Link href="/importar" className={btnGhostCls + " !py-2.5 !px-4 w-fit"}><FileUp size={14} /> Importar extrato</Link>} />

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
              {categoryOptions(cats, form.type).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
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
        {showScope && (
          <div className="flex items-center gap-1 rounded-full bg-brand-dark/10 dark:bg-[#161616] p-1">
            {([["all", "PF e PJ"], ["pf", "Pessoal"], ["pj", "Empresa"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setScope(k)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${scope === k ? "bg-white dark:bg-[#262626] shadow-sm" : "text-gray-500"}`}>{l}</button>
            ))}
          </div>
        )}
        {shared && partner && (
          <div className="flex items-center gap-1 rounded-full bg-brand-dark/10 dark:bg-[#161616] p-1">
            {([["all", "Os dois"], ["me", "Você"], ["partner", partner.name.split(" ")[0]]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setWho(k)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${who === k ? "bg-white dark:bg-[#262626] shadow-sm" : "text-gray-500"}`}>{l}</button>
            ))}
          </div>
        )}
      </div>

      <Card>
        {loading ? <Empty>Carregando...</Empty> : shown.length === 0 ? <Empty>Nenhuma transação neste período.</Empty> : (
          <ul className="divide-y divide-gray-100 dark:divide-[#262626]">
            {shown.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold truncate">{t.description}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">{formatDateBR(t.date)} · {catName(t.category_id)}{(t.card_id || t.debit_card_id) && <span className="inline-flex items-center gap-1 rounded-full bg-brand-dark/10 dark:bg-[#262626] px-2 py-0.5 text-[10px] font-bold text-brand-dark dark:text-brand-soft"><CreditCard size={10} />{cardNames[(t.card_id ?? t.debit_card_id) as string] ?? "Cartão"}{t.debit_card_id ? " (débito)" : ""}</span>}{t.is_business && <span className="inline-flex rounded-full bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">Empresa</span>}<WhoBadge name={nameOf(t.user_id)} /></p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-bold whitespace-nowrap ${t.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                    {t.type === "income" ? "+" : "-"}{brl(t.amount)}
                  </span>
                  <button onClick={() => (t.installment_group ? setDelTx(t) : remove(t))} aria-label="Excluir" className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {delTx && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDelTx(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full md:max-w-sm bg-white dark:bg-[#161616] rounded-t-[32px] md:rounded-[32px] p-6 space-y-3">
            <h2 className="text-lg font-extrabold">Excluir compra parcelada</h2>
            <p className="text-sm text-gray-500">{delTx.description}</p>
            <button onClick={() => remove(delTx)} className={btnGhostCls + " w-full !py-3"}>Só esta parcela</button>
            <button onClick={() => remove(delTx, true)} className={btnCls + " w-full !bg-none !bg-red-500 !shadow-none"}>Todas as parcelas</button>
            <button onClick={() => setDelTx(null)} className="w-full text-sm font-bold text-gray-500 py-2">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

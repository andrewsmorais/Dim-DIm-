"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { parseMoney, todayISO } from "@/lib/format";
import { categoryOptions, type CatRow } from "@/lib/categories";
import { Label, ErrorNote, inputCls, btnCls } from "@/components/ui/page";

type Acc = { id: string; name: string };

// Janela de novo lançamento (botão + do app). Avisa a tela atual por evento "jakash:changed".
export function QuickAdd({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { supabase, userId } = useSupabase();
  const [cats, setCats] = useState<CatRow[]>([]);
  const [accs, setAccs] = useState<Acc[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ type: "expense" as "income" | "expense", amount: "", description: "", category_id: "", account_id: "", date: todayISO(), paid: true });

  useEffect(() => {
    if (!open || !userId) return;
    setError(null);
    setF((p) => ({ ...p, date: todayISO() }));
    Promise.all([
      supabase.from("categories").select("id,name,type,parent_id").order("name"),
      supabase.from("accounts").select("id,name").eq("archived", false).order("created_at"),
    ]).then(([c, a]) => {
      setCats((c.data ?? []) as CatRow[]);
      setAccs((a.data ?? []) as Acc[]);
    });
  }, [open, userId, supabase]);

  if (!open) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseMoney(f.amount);
    if (!f.description.trim() || !(amount > 0)) { setError("Informe descrição e um valor maior que zero."); return; }
    setSaving(true);
    const res = f.paid
      ? await supabase.from("transactions").insert({
          user_id: userId, description: f.description.trim(), amount, type: f.type, date: f.date,
          category_id: f.category_id || null, account_id: f.account_id || null, origin: "manual",
        })
      : await supabase.from("bills").insert({
          user_id: userId, description: f.description.trim(), amount, type: f.type, due_date: f.date,
        });
    setSaving(false);
    if (res.error) { setError("Não foi possível salvar."); return; }
    setF({ ...f, amount: "", description: "" });
    window.dispatchEvent(new Event("jakash:changed"));
    onClose();
  }

  const isIncome = f.type === "income";
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md bg-white dark:bg-[#161616] rounded-t-[32px] md:rounded-[32px] p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Novo lançamento</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-gray-400"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-brand-dark/10 dark:bg-[#262626]">
          {(["expense", "income"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setF({ ...f, type: t, category_id: "" })}
              className={`py-2.5 rounded-xl text-sm font-bold ${f.type === t ? (t === "income" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "text-gray-500"}`}>
              {t === "expense" ? "Despesa" : "Receita"}
            </button>
          ))}
        </div>

        <div><Label>Valor</Label><input autoFocus className={inputCls + " !text-2xl !font-extrabold"} inputMode="decimal" placeholder="0,00" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
        <div><Label>Descrição</Label><input className={inputCls} placeholder={isIncome ? "Ex.: salário" : "Ex.: mercado"} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Categoria</Label>
            <select className={inputCls} value={f.category_id} onChange={(e) => setF({ ...f, category_id: e.target.value })}>
              <option value="">Sem categoria</option>
              {categoryOptions(cats, f.type).map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select></div>
          <div><Label>{f.paid ? "Data" : "Vencimento"}</Label><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
        </div>
        {accs.length > 0 && f.paid && (
          <div><Label>Conta</Label>
            <select className={inputCls} value={f.account_id} onChange={(e) => setF({ ...f, account_id: e.target.value })}>
              <option value="">Conta principal</option>
              {accs.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select></div>
        )}
        <label className="flex items-center justify-between rounded-2xl border border-white/70 dark:border-white/5 bg-white/60 dark:bg-[#1E1E1E] px-4 py-3 text-sm font-bold">
          {isIncome ? "Já recebi" : "Já paguei"}
          <input type="checkbox" checked={f.paid} onChange={(e) => setF({ ...f, paid: e.target.checked })} className="h-5 w-5 accent-brand-dark" />
        </label>
        {!f.paid && <p className="text-xs text-gray-500 -mt-2">Fica em Contas a pagar/receber até você dar baixa.</p>}
        <ErrorNote message={error} />
        <button className={btnCls + " w-full"} disabled={saving} type="submit">{saving ? "Salvando..." : "Salvar"}</button>
      </form>
    </div>
  );
}

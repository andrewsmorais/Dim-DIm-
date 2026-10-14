"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { brl, parseMoney } from "@/lib/format";
import { projectPayoff, type DebtInput, type PayoffMethod } from "@/lib/planner";
import { PageHeader, Card, Label, Empty, ErrorNote, Disclaimer, inputCls, btnCls, btnGhostCls } from "@/components/ui/page";

const KINDS: Record<string, string> = { cartao: "Cartão", cheque_especial: "Cheque especial", emprestimo: "Empréstimo", financiamento: "Financiamento", outro: "Outra" };

export default function DividasPage() {
  const { supabase, userId, ready } = useSupabase();
  const [debts, setDebts] = useState<DebtInput[]>([]);
  const [budget, setBudget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", kind: "cartao", balance: "", monthly_rate: "", min_payment: "" });
  const [payAmount, setPayAmount] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from("debts").select("id,name,kind,balance,monthly_rate,min_payment").eq("archived", false).order("created_at");
    if (err) { setError("Não foi possível carregar as dívidas."); return; }
    setError(null);
    setDebts((data ?? []).map((d) => ({ ...d, balance: Number(d.balance), monthly_rate: Number(d.monthly_rate), min_payment: Number(d.min_payment) })) as DebtInput[]);
  }, [supabase]);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, load]);
  useEffect(() => {
    const h = () => load();
    window.addEventListener("jakash:changed", h);
    return () => window.removeEventListener("jakash:changed", h);
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const balance = parseMoney(form.balance);
    const rate = form.monthly_rate ? parseMoney(form.monthly_rate) : 0;
    const min = form.min_payment ? parseMoney(form.min_payment) : 0;
    if (!form.name.trim() || !(balance > 0) || Number.isNaN(rate) || Number.isNaN(min)) { setError("Informe nome e saldo devedor válidos."); return; }
    const { error: err } = await supabase.from("debts").insert({ user_id: userId, name: form.name.trim(), kind: form.kind, balance, monthly_rate: rate, min_payment: min });
    if (err) { setError("Não foi possível salvar."); return; }
    setForm({ name: "", kind: "cartao", balance: "", monthly_rate: "", min_payment: "" });
    load();
  }

  async function pay(id: string) {
    const v = parseMoney(payAmount[id] ?? "");
    if (!(v > 0)) { setError("Informe um valor de pagamento válido."); return; }
    const { error: err } = await supabase.rpc("register_debt_payment", { p_debt_id: id, p_amount: v });
    if (err) { setError("Não foi possível registrar o pagamento."); return; }
    setPayAmount({ ...payAmount, [id]: "" });
    load();
  }

  async function remove(id: string) {
    const { error: err } = await supabase.from("debts").delete().eq("id", id);
    if (err) setError("Não foi possível excluir."); else load();
  }

  const minTotal = debts.reduce((s, d) => s + d.min_payment, 0);
  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);
  const b = parseMoney(budget);
  const budgetValue = Number.isNaN(b) ? 0 : b;

  const plans = useMemo(() => {
    if (!debts.length || !(budgetValue > 0)) return null;
    return { avalanche: projectPayoff(debts, "avalanche", budgetValue), snowball: projectPayoff(debts, "snowball", budgetValue) };
  }, [debts, budgetValue]);

  const Result = ({ method, title, desc }: { method: PayoffMethod; title: string; desc: string }) => {
    const r = plans![method];
    return (
      <Card>
        <p className="font-extrabold">{title}</p>
        <p className="text-xs text-gray-500 mb-3">{desc}</p>
        {!r.ok ? <p className="text-sm text-red-500 font-bold">{r.reason}</p> : (
          <>
            <p className="text-sm">Quitação em <b>{r.months} {r.months === 1 ? "mês" : "meses"}</b></p>
            <p className="text-sm">Juros totais estimados: <b>{brl(r.totalInterest)}</b></p>
            <p className="text-xs text-gray-500 mt-2">Ordem: {r.order.join(" → ")}</p>
          </>
        )}
      </Card>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <PageHeader title="Dívidas" subtitle="Veja quanto falta e compare estratégias para quitar" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card><p className="text-xs font-bold text-gray-500">Total devido</p><p className="text-2xl font-bold text-red-500">{brl(totalBalance)}</p></Card>
        <Card><p className="text-xs font-bold text-gray-500">Soma das parcelas mínimas</p><p className="text-2xl font-bold">{brl(minTotal)}</p></Card>
      </div>

      <Card className="mb-6">
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div><Label>Nome</Label><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: cartão Nubank" /></div>
          <div><Label>Tipo</Label>
            <select className={inputCls} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select></div>
          <div><Label>Saldo devedor</Label><input className={inputCls} inputMode="decimal" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0,00" /></div>
          <div><Label>Juros ao mês (%)</Label><input className={inputCls} inputMode="decimal" value={form.monthly_rate} onChange={(e) => setForm({ ...form, monthly_rate: e.target.value })} placeholder="0" /></div>
          <div><Label>Parcela mínima</Label><input className={inputCls} inputMode="decimal" value={form.min_payment} onChange={(e) => setForm({ ...form, min_payment: e.target.value })} placeholder="0,00" /></div>
          <div className="md:col-span-5"><button className={btnCls} type="submit">Adicionar dívida</button></div>
        </form>
        <ErrorNote message={error} />
      </Card>

      <Card className="mb-6">
        {debts.length === 0 ? <Empty>Nenhuma dívida cadastrada. 🎉</Empty> : (
          <ul className="divide-y divide-gray-100 dark:divide-[#262626]">
            {debts.map((d) => (
              <li key={d.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{d.name} <span className="text-xs text-gray-400">{KINDS[d.kind]}</span></p>
                  <p className="text-xs text-gray-500">{d.monthly_rate}% ao mês · mínimo {brl(d.min_payment)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-500">{brl(d.balance)}</span>
                  <input className={inputCls + " !w-24"} inputMode="decimal" placeholder="Pagou?" value={payAmount[d.id] ?? ""} onChange={(e) => setPayAmount({ ...payAmount, [d.id]: e.target.value })} />
                  <button onClick={() => pay(d.id)} className={btnGhostCls}>Abater</button>
                  <button onClick={() => remove(d.id)} aria-label="Excluir" className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {debts.length > 0 && (
        <>
          <Card className="mb-4">
            <Label>Quanto você consegue pagar por mês, no total?</Label>
            <input className={inputCls + " md:!w-64"} inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={`Mínimo ${brl(minTotal)}`} />
          </Card>
          {plans && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Result method="avalanche" title="Avalanche" desc="Prioriza a dívida com maior juros: costuma pagar menos juros no total." />
              <Result method="snowball" title="Bola de neve" desc="Prioriza o menor saldo: quita dívidas mais rápido e dá motivação." />
            </div>
          )}
        </>
      )}
      <Disclaimer />
    </div>
  );
}

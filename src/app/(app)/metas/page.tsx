"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { brl, parseMoney, formatDateBR } from "@/lib/format";
import { GOAL_TYPES, monthsBetween, requiredMonthly, type GoalType } from "@/lib/planner";
import { PageHeader, Card, Label, Progress, Empty, ErrorNote, Disclaimer, inputCls, btnCls, btnGhostCls } from "@/components/ui/page";

type Goal = { id: string; name: string; icon: string | null; type: GoalType; target_amount: number; current_amount: number; deadline: string | null; status: string };

const ICONS = ["🎯", "✈️", "🏠", "🚗", "🏍️", "💍", "🎓", "📱", "💻", "🎮", "🎉", "🎁", "🏖️", "🐶", "💪", "🛠️", "👶", "💰"];

export default function MetasPage() {
  const { supabase, userId, ready } = useSupabase();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "custom" as GoalType, name: "", icon: "", target: "", current: "", deadline: "" });
  const [contrib, setContrib] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from("goals").select("id,name,icon,type,target_amount,current_amount,deadline,status").neq("status", "cancelled").order("created_at");
    if (err) { setError("Não foi possível carregar os objetivos."); return; }
    setError(null);
    setGoals((data ?? []).map((g) => ({ ...g, target_amount: Number(g.target_amount), current_amount: Number(g.current_amount ?? 0) })) as Goal[]);
  }, [supabase]);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, load]);
  useEffect(() => {
    const h = () => load();
    window.addEventListener("jakash:changed", h);
    return () => window.removeEventListener("jakash:changed", h);
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const target = parseMoney(form.target);
    const current = form.current ? parseMoney(form.current) : 0;
    if (!(target > 0) || Number.isNaN(current)) { setError("Informe um valor-alvo válido."); return; }
    if (!userId) { setError("Você está sem login. Entre na sua conta para salvar o objetivo."); return; }
    if (form.type === "custom" && !form.name.trim()) { setError("Dê um nome ao seu objetivo."); return; }
    const meta = GOAL_TYPES[form.type];
    const { error: err } = await supabase.from("goals").insert({
      user_id: userId, name: form.name.trim() || meta.label, icon: form.icon || meta.icon, type: form.type,
      target_amount: target, current_amount: current, deadline: form.deadline || null,
    });
    if (err) { setError("Não foi possível criar o objetivo."); return; }
    setError(null);
    setForm({ ...form, name: "", icon: "", target: "", current: "", deadline: "" });
    load();
  }

  async function addContribution(g: Goal) {
    const v = parseMoney(contrib[g.id] ?? "");
    if (!(v > 0)) { setError("Informe um valor de aporte válido."); return; }
    const newTotal = g.current_amount + v;
    const [c, u] = await Promise.all([
      supabase.from("goal_contributions").insert({ goal_id: g.id, amount: v }),
      supabase.from("goals").update({ current_amount: newTotal, status: newTotal >= g.target_amount ? "completed" : "in_progress" }).eq("id", g.id),
    ]);
    if (c.error || u.error) { setError("Não foi possível registrar o aporte."); return; }
    setContrib({ ...contrib, [g.id]: "" });
    load();
  }

  async function remove(id: string) {
    const { error: err } = await supabase.from("goals").delete().eq("id", id);
    if (err) setError("Não foi possível excluir."); else load();
  }

  const tips = GOAL_TYPES[form.type].tips;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <PageHeader title="Objetivos" subtitle="Viagem, bebê, reserva, carro... defina o valor, a data e veja quanto guardar por mês" />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(GOAL_TYPES) as GoalType[]).map((k) => (
            <button key={k} type="button" onClick={() => setForm({ ...form, type: k, icon: "" })} className={form.type === k ? btnCls : btnGhostCls}>
              {GOAL_TYPES[k].icon} {GOAL_TYPES[k].label}
            </button>
          ))}
        </div>
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div><Label>{form.type === "custom" ? "Nome do objetivo" : "Nome"}</Label><input className={inputCls} maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={form.type === "custom" ? "Ex.: Moto nova, Festa de 15 anos..." : GOAL_TYPES[form.type].label} /></div>
          <div><Label>Valor-alvo</Label><input className={inputCls} inputMode="decimal" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} placeholder="0,00" /></div>
          <div><Label>Já guardado</Label><input className={inputCls} inputMode="decimal" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} placeholder="0,00" /></div>
          <div><Label>Data-alvo</Label><input type="date" className={inputCls} value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          <div className="md:col-span-4">
            <Label>Ícone (opcional)</Label>
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((ic) => (
                <button key={ic} type="button" onClick={() => setForm({ ...form, icon: form.icon === ic ? "" : ic })} aria-pressed={form.icon === ic} aria-label={`Ícone ${ic}`}
                  className={`w-10 h-10 rounded-xl text-xl border transition-colors ${form.icon === ic ? "bg-brand-dark/15 border-brand-dark" : "border-gray-200 dark:border-[#262626] hover:bg-brand-dark/5"}`}>{ic}</button>
              ))}
            </div>
          </div>
          <div className="md:col-span-4"><button className={btnCls} type="submit">Criar objetivo</button></div>
        </form>
        <ul className="mt-4 text-xs text-gray-500 list-disc pl-5 space-y-1">{tips.map((t) => <li key={t}>{t}</li>)}</ul>
        <ErrorNote message={error} />
      </Card>

      {goals.length === 0 ? <Card><Empty>Nenhum objetivo ainda. Crie o seu acima: escolha um tipo ou use “Outro objetivo” para dar o nome que quiser.</Empty></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
            const monthly = g.deadline ? requiredMonthly(g.target_amount, g.current_amount, monthsBetween(new Date(), g.deadline)) : null;
            return (
              <Card key={g.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <span className="text-3xl">{g.icon ?? "🎯"}</span>
                    <div>
                      <p className="font-extrabold leading-tight">{g.name}</p>
                      <p className="text-xs text-gray-500">{g.deadline ? `até ${formatDateBR(g.deadline)}` : "sem data-alvo"}{g.status === "completed" && " · ✅ concluído"}</p>
                    </div>
                  </div>
                  <button onClick={() => remove(g.id)} aria-label="Excluir" className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
                <Progress value={pct} />
                <p className="text-sm text-gray-500 mt-2">{brl(g.current_amount)} de {brl(g.target_amount)} ({Math.round(pct)}%)</p>
                {monthly !== null && g.status !== "completed" && <p className="text-sm font-bold mt-1">Guarde {brl(monthly)} por mês</p>}
                <div className="flex gap-2 mt-4">
                  <input className={inputCls} inputMode="decimal" placeholder="Novo aporte" value={contrib[g.id] ?? ""} onChange={(e) => setContrib({ ...contrib, [g.id]: e.target.value })} />
                  <button onClick={() => addContribution(g)} className={btnGhostCls}>Aportar</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

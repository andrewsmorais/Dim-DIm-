"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, ArchiveRestore, ChevronRight, CreditCard, Pencil, Plus } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { useCards, type Card as CardRow } from "@/lib/useCards";
import { useHideValues } from "@/lib/useHideValues";
import { brl, parseMoney, todayISO, formatDateBR } from "@/lib/format";
import { BRANDS, cardUsed, dueDateFor, invoiceMonthFor, invoiceStatus, shiftInvoiceMonth } from "@/lib/cards";
import { InvoiceChip } from "@/components/CardBits";
import { WhoBadge } from "@/components/WhoBadge";
import { usePartnership } from "@/lib/usePartnership";
import { BackTitle, Card, Label, Empty, ErrorNote, Progress, inputCls, btnCls, btnGhostCls } from "@/components/ui/page";

type Acc = { id: string; name: string };
const EMPTY_FORM = { name: "", brand: "outro", limit: "", closing: "", due: "", pay_account_id: "" };

export default function CartoesPage() {
  const { supabase, userId, ready } = useSupabase();
  const { cards, invoices, loading, error: loadError, reload } = useCards();
  const { money } = useHideValues();
  const { nameOf } = usePartnership();
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [accs, setAccs] = useState<Acc[]>([]);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;
    supabase.from("accounts").select("id,name").eq("archived", false).order("created_at").then(({ data }) => setAccs((data ?? []) as Acc[]));
  }, [ready, userId, supabase]);

  const today = todayISO();
  const active = cards.filter((c) => !c.archived);
  const shown = cards.filter((c) => (tab === "active" ? !c.archived : c.archived));
  const openTotal = invoices
    .filter((i) => active.some((c) => c.id === i.card_id))
    .reduce((s, i) => s + Math.max(i.total - i.paid, 0), 0);
  const limitTotal = active.reduce((s, c) => s + c.credit_limit, 0);
  const usedTotal = active.reduce((s, c) => s + cardUsed(invoices, c.id), 0);

  function openNew() { setForm(EMPTY_FORM); setEditing("new"); setError(null); setConfirmDelete(false); }
  function openEdit(c: CardRow) {
    setForm({ name: c.name, brand: c.brand, limit: String(c.credit_limit).replace(".", ","), closing: String(c.closing_day), due: String(c.due_day), pay_account_id: c.pay_account_id ?? "" });
    setEditing(c.id); setError(null); setConfirmDelete(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const limit = form.limit.trim() === "" ? 0 : parseMoney(form.limit);
    const closing = Number(form.closing);
    const due = Number(form.due);
    if (!form.name.trim() || Number.isNaN(limit) || limit < 0) { setError("Informe o nome e um limite válido."); return; }
    if (!Number.isInteger(closing) || closing < 1 || closing > 31 || !Number.isInteger(due) || due < 1 || due > 31) {
      setError("Fechamento e vencimento devem ser dias entre 1 e 31."); return;
    }
    const payload = { name: form.name.trim(), brand: form.brand, credit_limit: limit, closing_day: closing, due_day: due, pay_account_id: form.pay_account_id || null };
    const res = editing === "new"
      ? await supabase.from("credit_cards").insert({ ...payload, user_id: userId })
      : await supabase.from("credit_cards").update(payload).eq("id", editing);
    if (res.error) { setError("Não foi possível salvar o cartão."); return; }
    setEditing(null);
    reload();
  }

  async function setArchived(id: string, archived: boolean) {
    const { error: err } = await supabase.from("credit_cards").update({ archived }).eq("id", id);
    if (err) setError("Não foi possível atualizar."); else reload();
  }

  async function remove() {
    if (!editing || editing === "new") return;
    const { error: err } = await supabase.from("credit_cards").delete().eq("id", editing);
    if (err) { setError("Não foi possível excluir o cartão."); return; }
    setEditing(null);
    window.dispatchEvent(new Event("jakash:changed"));
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <BackTitle title="Cartões de crédito" subtitle="Faturas, limites e vencimentos em um só lugar." />

      <button onClick={openNew} className={btnCls + " w-full mb-5"}><Plus size={18} /> Adicionar cartão</button>

      <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-brand-dark/10 dark:bg-[#161616] mb-5">
        {([["active", "Ativos"], ["archived", "Arquivados"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`py-2.5 rounded-xl text-sm font-bold ${tab === k ? "bg-white dark:bg-[#262626] shadow-sm" : "text-gray-500"}`}>{l}</button>
        ))}
      </div>

      {tab === "active" && active.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="!p-4"><p className="text-xs font-bold text-gray-500">Faturas em aberto</p><p className="text-xl font-extrabold">{money(brl(openTotal))}</p></Card>
          <Card className="!p-4"><p className="text-xs font-bold text-gray-500">Limite disponível</p><p className="text-xl font-extrabold">{limitTotal > 0 ? money(brl(Math.max(limitTotal - usedTotal, 0))) : "—"}</p></Card>
        </div>
      )}

      {(error || loadError) && <ErrorNote message={error ?? "Não foi possível carregar os cartões."} />}

      <div className="space-y-3 mt-3">
        {loading ? <Card><Empty>Carregando...</Empty></Card> : shown.length === 0 ? (
          <Card><Empty>{tab === "active" ? "Nenhum cartão ainda. Adicione o primeiro." : "Nenhum cartão arquivado."}</Empty></Card>
        ) : shown.map((c) => {
          const curMonth = invoiceMonthFor(c, today);
          const get = (m: string) => invoices.find((i) => i.card_id === c.id && i.invoice_month === m);
          const cur = get(curMonth) ?? { total: 0, paid: 0 };
          const prevMonth = shiftInvoiceMonth(curMonth, -1);
          const prev = get(prevMonth);
          const prevRemaining = prev ? prev.total - prev.paid : 0;
          const used = cardUsed(invoices, c.id);
          const pct = c.credit_limit > 0 ? (used / c.credit_limit) * 100 : 0;
          const curStatus = invoiceStatus(c, curMonth, cur.total, cur.paid, today);
          return (
            <Card key={c.id} className="!p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-dark/10 dark:bg-[#262626] text-brand-dark dark:text-brand-soft flex items-center justify-center shrink-0"><CreditCard size={22} /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">{BRANDS[c.brand] ?? "Outro"} · fecha dia {c.closing_day} · vence dia {c.due_day}<WhoBadge name={nameOf(c.user_id)} /></p>
                </div>
              </div>

              {!c.archived && (
                <>
                  <Link href={`/cartoes/${c.id}`} className="mt-4 flex items-center justify-between rounded-2xl bg-white/60 dark:bg-[#1E1E1E] border border-white/70 dark:border-white/5 px-4 py-3">
                    <div>
                      <p className="text-[11px] font-bold text-gray-500">Fatura atual · vence {formatDateBR(dueDateFor(c, curMonth))}</p>
                      <p className="text-lg font-extrabold">{money(brl(cur.total))}</p>
                    </div>
                    <div className="flex items-center gap-2"><InvoiceChip status={curStatus} /><ChevronRight size={18} className="text-gray-300" /></div>
                  </Link>

                  {prevRemaining > 0.004 && (
                    <Link href={`/cartoes/${c.id}?m=${prevMonth.slice(0, 7)}`} className="mt-2 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
                      <div>
                        <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Fatura anterior em aberto · vence {formatDateBR(dueDateFor(c, prevMonth))}</p>
                        <p className="font-extrabold">{money(brl(prevRemaining))}</p>
                      </div>
                      <InvoiceChip status={invoiceStatus(c, prevMonth, prev?.total ?? 0, prev?.paid ?? 0, today)} />
                    </Link>
                  )}

                  {c.credit_limit > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{money(brl(used))} usados</span>
                        <span>Disponível {money(brl(Math.max(c.credit_limit - used, 0)))}</span>
                      </div>
                      <Progress value={pct} tone={pct >= 100 ? "bad" : pct >= 80 ? "warn" : "ok"} />
                      <p className="text-[11px] text-gray-400 mt-1.5">Limite de {money(brl(c.credit_limit))}</p>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2 mt-3 justify-end">
                {!c.archived && <button onClick={() => openEdit(c)} className={btnGhostCls}><Pencil size={14} /> Editar</button>}
                <button onClick={() => setArchived(c.id, !c.archived)} className={btnGhostCls}>
                  {c.archived ? <><ArchiveRestore size={14} /> Restaurar</> : <><Archive size={14} /> Arquivar</>}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-6">As compras no cartão entram nas despesas e nos limites pela data da compra. O dinheiro só sai da conta quando você paga a fatura. Mudar o dia de fechamento vale para as próximas compras.</p>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full md:max-w-md bg-white dark:bg-[#161616] rounded-t-[32px] md:rounded-[32px] p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold">{editing === "new" ? "Novo cartão" : "Editar cartão"}</h2>
            <div><Label>Nome do cartão</Label><input autoFocus className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Nubank" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bandeira</Label>
                <select className={inputCls} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
                  {Object.entries(BRANDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
              <div><Label>Limite</Label><input className={inputCls} inputMode="decimal" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} placeholder="0,00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Dia de fechamento</Label><input className={inputCls} inputMode="numeric" value={form.closing} onChange={(e) => setForm({ ...form, closing: e.target.value.replace(/\D/g, "").slice(0, 2) })} placeholder="Ex.: 25" /></div>
              <div><Label>Dia de vencimento</Label><input className={inputCls} inputMode="numeric" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value.replace(/\D/g, "").slice(0, 2) })} placeholder="Ex.: 5" /></div>
            </div>
            {accs.length > 0 && (
              <div><Label>Conta que paga a fatura (opcional)</Label>
                <select className={inputCls} value={form.pay_account_id} onChange={(e) => setForm({ ...form, pay_account_id: e.target.value })}>
                  <option value="">Escolher na hora de pagar</option>
                  {accs.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select></div>
            )}
            <ErrorNote message={error} />
            <div className="flex gap-2"><button type="button" onClick={() => setEditing(null)} className={btnGhostCls + " flex-1 !py-3"}>Cancelar</button><button className={btnCls + " flex-1"} type="submit">Salvar</button></div>
            {editing !== "new" && (
              confirmDelete ? (
                <button type="button" onClick={remove} className="w-full text-sm font-bold text-red-500 py-2">Confirmar: apagar o cartão e todas as compras e pagamentos dele</button>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="w-full text-sm font-bold text-red-500/80 py-2">Excluir cartão</button>
              )
            )}
          </form>
        </div>
      )}
    </div>
  );
}

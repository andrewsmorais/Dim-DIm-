"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CreditCard, PartyPopper } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { useCards } from "@/lib/useCards";
import { useHideValues } from "@/lib/useHideValues";
import { usePartnership } from "@/lib/usePartnership";
import { brl, monthLabel, todayISO, formatDateBR } from "@/lib/format";
import { activePlans, buildPlans, buildTimeline, monthlyCommitted, nextRelief, totalRemaining, type InstallmentRow } from "@/lib/installments";
import { WhoBadge } from "@/components/WhoBadge";
import { BackTitle, Card, Empty, ErrorNote, Progress, btnCls } from "@/components/ui/page";

const SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const shortMonth = (m: string) => `${SHORT[Number(m.slice(5, 7)) - 1]}/${m.slice(2, 4)}`;

export default function ParcelamentosPage() {
  const { supabase, userId, ready } = useSupabase();
  const { cards, loading: loadingCards } = useCards();
  const { money } = useHideValues();
  const { nameOf } = usePartnership();
  const [rows, setRows] = useState<InstallmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("transactions")
      .select("id,user_id,card_id,description,amount,date,invoice_month,installment_group,installment_number,installment_total")
      .not("installment_group", "is", null)
      .order("invoice_month")
      .limit(5000);
    setError(Boolean(err));
    setRows((data ?? []) as InstallmentRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, load]);
  useEffect(() => {
    const h = () => load();
    window.addEventListener("jakash:changed", h);
    return () => window.removeEventListener("jakash:changed", h);
  }, [load]);

  const today = todayISO();
  const model = useMemo(() => {
    const plans = buildPlans(rows, today, cards);
    const timeline = buildTimeline(rows, plans, today, 12);
    return { plans, active: activePlans(plans), timeline, relief: nextRelief(timeline) };
  }, [rows, cards, today]);

  const cardName = (id: string | null) => cards.find((c) => c.id === id)?.name ?? "Cartão";
  const maxMonth = Math.max(...model.timeline.map((t) => t.total), 1);
  const done = model.plans.filter((p) => p.remainingCount === 0);

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <BackTitle title="Parcelamentos" subtitle="O que você ainda está pagando, até quando, e quanto sobra quando acaba." href="/cartoes" />

      {error && <ErrorNote message="Não foi possível carregar os parcelamentos." />}

      {loading || loadingCards ? (
        <Card><Empty>Carregando...</Empty></Card>
      ) : model.active.length === 0 ? (
        <Card>
          <Empty>Nenhum parcelamento em andamento. Compras parceladas no cartão aparecem aqui sozinhas.</Empty>
          <div className="flex justify-center"><Link href="/cartoes" className={btnCls}><CreditCard size={16} /> Ir para os cartões</Link></div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="!p-4"><p className="text-xs font-bold text-gray-500">Parcelas neste mês</p><p className="text-xl font-extrabold">{money(brl(monthlyCommitted(model.timeline)))}</p></Card>
            <Card className="!p-4"><p className="text-xs font-bold text-gray-500">Ainda falta pagar</p><p className="text-xl font-extrabold">{money(brl(totalRemaining(model.plans)))}</p></Card>
          </div>

          {model.relief && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <PartyPopper size={20} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                A partir de <strong>{monthLabel(model.relief.month.slice(0, 7))}</strong> suas parcelas caem <strong>{money(brl(model.relief.amount))}</strong> por mês
                {model.relief.products.length > 0 && <> (acaba: {model.relief.products.join(", ")})</>}. Dá para guardar esse valor.
              </p>
            </div>
          )}

          <Card className="!p-4 mb-4">
            <p className="font-extrabold mb-3">Próximos 12 meses</p>
            <div className="flex items-end gap-1.5 h-36" role="img" aria-label="Valor das parcelas em cada um dos próximos 12 meses">
              {model.timeline.map((t) => (
                <div key={t.month} className="flex-1 min-w-0 h-full flex flex-col justify-end items-center gap-1">
                  {t.ending.length > 0 && <CalendarCheck size={12} className="text-emerald-500 shrink-0" aria-label="Termina um parcelamento" />}
                  <div
                    className={`w-full rounded-t-lg ${t.ending.length > 0 ? "bg-emerald-500/70" : "bg-gradient-to-t from-brand-dark to-brand-accent dark:from-brand-vivid dark:to-brand-vivid"}`}
                    style={{ height: `${Math.max((t.total / maxMonth) * 100, t.total > 0 ? 4 : 0)}%` }}
                    title={`${monthLabel(t.month.slice(0, 7))}: ${brl(t.total)}`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {model.timeline.map((t) => <span key={t.month} className="flex-1 min-w-0 text-center text-[9px] font-bold text-gray-400">{shortMonth(t.month)}</span>)}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Barras verdes: mês em que acaba um parcelamento. No mês seguinte, o valor dele sai das suas parcelas.</p>
          </Card>

          <div className="space-y-3">
            {model.active.map((p) => {
              const pct = ((p.total - p.remainingCount) / p.total) * 100;
              return (
                <Card key={p.group} className="!p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-extrabold truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">{cardName(p.cardId)}<WhoBadge name={nameOf(p.userId)} /></p>
                    </div>
                    <p className="font-extrabold shrink-0">{money(brl(p.perInstallment))}<span className="text-xs font-bold text-gray-400">/mês</span></p>
                  </div>
                  <div className="mt-3"><Progress value={pct} tone="ok" /></div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1.5 gap-2">
                    <span>{p.total - p.remainingCount} de {p.total} pagas · faltam {p.remainingCount}</span>
                    <span>{money(brl(p.remainingAmount))} restantes</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Última parcela {p.lastDueDate ? <>vence em <strong>{formatDateBR(p.lastDueDate)}</strong></> : <>na fatura de <strong>{monthLabel(p.lastInvoiceMonth.slice(0, 7))}</strong></>}. Depois dela você libera <strong>{money(brl(p.perInstallment))}</strong> por mês.
                  </p>
                  {p.missingRows > 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5">Faltam {p.missingRows} parcelas lançadas desta compra; os valores acima consideram só as já lançadas.</p>
                  )}
                </Card>
              );
            })}
          </div>

          {done.length > 0 && (
            <div className="mt-6">
              <button onClick={() => setShowDone((v) => !v)} className="text-sm font-bold text-brand-dark dark:text-brand-soft">
                {showDone ? "Esconder" : "Ver"} parcelamentos quitados ({done.length})
              </button>
              {showDone && (
                <div className="mt-3 space-y-2">
                  {done.map((p) => (
                    <Card key={p.group} className="!p-3">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="font-bold truncate">{p.name}</span>
                        <span className="text-gray-500 shrink-0">{p.total}x de {money(brl(p.perInstallment))}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <p className="text-xs text-gray-400 mt-6">Cada parcela entra na fatura do mês em que vence. Uma parcela conta como paga depois do vencimento da fatura.</p>
    </div>
  );
}

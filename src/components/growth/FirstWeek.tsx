"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, X } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { Card, Progress } from "@/components/ui/page";

type Step = { key: string; label: string; href: string; done: boolean };

const DISMISS = "jakash:firstweek:dismissed";
const WINDOW_DAYS = 14;

// Checklist dos primeiros dias: só aparece para conta nova, some ao concluir tudo ou ao ser dispensado.
export function FirstWeek() {
  const { supabase, userId, ready } = useSupabase();
  const [steps, setSteps] = useState<Step[] | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;
    try { if (localStorage.getItem(DISMISS)) return; } catch { /* segue sem lembrar */ }
    let off = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || (Date.now() - new Date(user.created_at).getTime()) / 86400000 > WINDOW_DAYS) return;
      const has = async (table: string) => {
        const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("user_id", userId);
        return (count ?? 0) > 0;
      };
      const [acc, tx, budget, bill, card, prof] = await Promise.all([
        has("accounts"), has("transactions"), has("budgets"), has("bills"), has("credit_cards"),
        supabase.from("profiles").select("whatsapp_number,notify_enabled").eq("id", userId).maybeSingle(),
      ]);
      if (off) return;
      const p = prof.data as { whatsapp_number: string | null; notify_enabled: boolean | null } | null;
      const list: Step[] = [
        { key: "acc", label: "Cadastrar uma conta bancária", href: "/contas-bancarias", done: acc },
        { key: "tx", label: "Fazer o primeiro lançamento", href: "/transacoes", done: tx },
        { key: "wa", label: "Conectar o WhatsApp para lançar por mensagem", href: "/configuracoes/whatsapp", done: Boolean(p?.whatsapp_number) },
        { key: "budget", label: "Definir um limite de gastos", href: "/limites", done: budget },
        { key: "bill", label: "Cadastrar uma conta a pagar ou um cartão", href: "/contas", done: bill || card },
        { key: "notif", label: "Ativar os lembretes de vencimento", href: "/configuracoes/notificacoes", done: Boolean(p?.notify_enabled) },
      ];
      if (list.some((s) => !s.done)) setSteps(list);
    })();
    return () => { off = true; };
  }, [ready, userId, supabase]);

  if (!steps) return null;
  const done = steps.filter((s) => s.done).length;
  const dismiss = () => { try { localStorage.setItem(DISMISS, "1"); } catch { /* ignora */ } setSteps(null); };

  return (
    <Card className="mb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-extrabold">Primeiros passos</p>
          <p className="text-xs text-gray-500">{done} de {steps.length} concluídos</p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Ocultar os primeiros passos" className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
      </div>
      <div className="my-3"><Progress value={(done / steps.length) * 100} /></div>
      <ul className="divide-y divide-gray-100 dark:divide-[#262626]">
        {steps.map((s) => (
          <li key={s.key}>
            {s.done ? (
              <p className="flex items-center gap-3 py-2.5 text-sm text-gray-400 line-through"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" />{s.label}</p>
            ) : (
              <Link href={s.href} className="flex items-center gap-3 py-2.5 text-sm font-bold hover:text-brand-dark dark:hover:text-brand-soft"><Circle size={18} className="text-gray-300 shrink-0" />{s.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

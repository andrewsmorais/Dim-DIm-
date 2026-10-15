"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { isFamilyOnlyPath, PLANS, planPrice } from "@/lib/plans";
import { useSupabase } from "@/lib/useSupabase";

// Cache curto por usuário: navegar entre telas não refaz a consulta.
let cache: { userId: string; at: number; allowed: boolean } | null = null;

// Telas do plano Família em diante (planejamento, investimentos, simulador, dívidas, Chat IA).
// Quem está no Essencial vê um convite para o upgrade. Só interface: o Chat IA também é barrado no servidor.
export function PlanGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const { userId, ready } = useSupabase();
  const gated = isFamilyOnlyPath(pathname);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!gated || !ready || !userId) return;
    if (cache && cache.userId === userId && Date.now() - cache.at < 60_000) { setAllowed(cache.allowed); return; }
    let off = false;
    fetch("/api/plan", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        // Se não deu para saber, não bloqueia: melhor deixar passar do que travar quem paga.
        const ok = j ? Boolean(j.familyFeatures) : true;
        cache = { userId, at: Date.now(), allowed: ok };
        if (!off) setAllowed(ok);
      })
      .catch(() => { if (!off) setAllowed(true); });
    return () => { off = true; };
  }, [gated, ready, userId]);

  if (!gated) return <>{children}</>;
  if (allowed === null) return <div className="max-w-xl mx-auto py-16 text-center text-sm text-gray-400">Carregando…</div>;
  if (allowed) return <>{children}</>;

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="rounded-3xl border border-brand-dark/20 bg-white dark:bg-[#161616] p-6 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-dark/10 dark:bg-[#262626] text-brand-dark dark:text-brand-soft flex items-center justify-center mb-4"><Lock size={24} /></div>
        <p className="text-xl font-extrabold mb-2">Disponível no plano Família</p>
        <p className="text-sm text-gray-500 mb-5">Planejamento mensal, investimentos, dívidas, simulador e Chat IA fazem parte do {PLANS.familia.name}, que ainda divide as finanças com até {PLANS.familia.members} pessoas, por {planPrice("familia")}/mês.</p>
        <Link href="/configuracoes/planos" className="inline-flex items-center justify-center rounded-full bg-brand-dark text-white font-bold px-6 py-3 text-sm">Ver planos</Link>
      </div>
    </div>
  );
}

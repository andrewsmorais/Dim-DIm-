"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Settings, Landmark, FileText, Tag, Target, Gauge, CalendarClock, ShieldCheck, Calculator, FileUp, CalendarRange, Briefcase, TrendingDown, Home, Sparkles,
  CreditCard, TrendingUp, MessageSquare, Users, type LucideIcon,
} from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { useUsageType } from "@/lib/useUsageType";

const TILES: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Home, label: "Resumo do mês", href: "/dashboard" },
  { icon: MessageSquare, label: "Chat IA", href: "/chat" },
  { icon: Landmark, label: "Contas bancárias", href: "/contas-bancarias" },
  { icon: CreditCard, label: "Cartões", href: "/cartoes" },
  { icon: CalendarClock, label: "Contas a pagar", href: "/contas" },
  { icon: Gauge, label: "Limites de gastos", href: "/limites" },
  { icon: Target, label: "Objetivos", href: "/metas" },
  { icon: TrendingDown, label: "Despesas", href: "/dividas" },
  { icon: ShieldCheck, label: "Reserva", href: "/reserva" },
  { icon: TrendingUp, label: "Investimentos", href: "/investimentos" },
  { icon: Tag, label: "Categorias", href: "/categorias" },
  { icon: FileText, label: "Relatórios", href: "/relatorios" },
  { icon: Calculator, label: "Simulador", href: "/simulador" },
  { icon: CalendarRange, label: "Planejamento", href: "/planejamento" },
  { icon: FileUp, label: "Importar arquivo", href: "/importar" },
  { icon: Users, label: "Gestão compartilhada", href: "/configuracoes/compartilhada" },
  { icon: Sparkles, label: "Planos", href: "/configuracoes/planos" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

export default function MenuPage() {
  const { supabase, userId, ready } = useSupabase();
  const [name, setName] = useState("");
  const { isMei } = useUsageType();
  const tiles = isMei ? TILES.slice(0, 4).concat([{ icon: Briefcase, label: "Pacote MEI", href: "/mei" }], TILES.slice(4)) : TILES;

  useEffect(() => {
    if (!ready || !userId) return;
    supabase.from("profiles").select("full_name").maybeSingle().then(({ data }) => setName(data?.full_name ?? ""));
  }, [ready, userId, supabase]);

  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "J";

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-brand-dark/10 dark:bg-[#262626] text-brand-dark dark:text-brand-soft font-extrabold flex items-center justify-center">{initials}</div>
        <div>
          <p className="text-sm text-gray-500">{greeting()}</p>
          <p className="font-extrabold text-lg leading-tight">{name || "Bem-vindo"}</p>
        </div>
      </div>
      <h1 className="text-2xl font-extrabold mb-4">Tudo</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {tiles.map((t, i) => (
          <Link key={t.href} href={t.href}
            className={`rounded-[24px] p-4 h-32 flex flex-col justify-between border transition-transform active:scale-95 ${
              i === 0
                ? "bg-gradient-to-br from-brand-dark to-brand-accent dark:from-brand-vivid dark:to-brand-vivid text-white border-transparent shadow-lg shadow-brand-dark/30 dark:shadow-none"
                : "bg-white/75 dark:bg-[#161616] border-white/80 dark:border-white/5 text-gray-800 dark:text-gray-100"
            }`}>
            <t.icon size={26} className={i === 0 ? "" : "text-brand-dark dark:text-brand-soft"} />
            <span className="font-bold text-sm leading-tight">{t.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

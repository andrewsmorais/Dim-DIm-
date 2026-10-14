"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstallButton } from "@/components/PWA";
import { QuickAdd, type QuickAddPreset } from "@/components/QuickAdd";
import { AccentSync } from "@/components/AccentSync";
import { ReferralSync } from "@/components/Referral";
import { useUsageType } from "@/lib/useUsageType";
import {
  Home, Send, FileText, Gauge, CalendarClock, Landmark, Target, ShieldCheck,
  Calculator, FileUp, Briefcase, CalendarRange, Settings, Landmark as Bank, Plus, Menu as MenuIcon, CreditCard, TrendingUp, Sparkles, type LucideIcon,
} from "lucide-react";

type Item = { icon: LucideIcon; label: string; href: string };
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "MENU",
    items: [
      { icon: Home, label: "Resumo", href: "/dashboard" },
      { icon: Send, label: "Transações", href: "/transacoes" },
      { icon: Bank, label: "Contas bancárias", href: "/contas-bancarias" },
      { icon: CreditCard, label: "Cartões", href: "/cartoes" },
      { icon: FileText, label: "Relatórios", href: "/relatorios" },
    ],
  },
  {
    title: "PLANEJAMENTO",
    items: [
      { icon: CalendarRange, label: "Planejamento", href: "/planejamento" },
      { icon: Gauge, label: "Limites", href: "/limites" },
      { icon: CalendarClock, label: "Contas a pagar", href: "/contas" },
      { icon: Landmark, label: "Despesas", href: "/dividas" },
      { icon: Target, label: "Objetivos", href: "/metas" },
      { icon: ShieldCheck, label: "Reserva", href: "/reserva" },
      { icon: TrendingUp, label: "Investimentos", href: "/investimentos" },
    ],
  },
  {
    title: "FERRAMENTAS",
    items: [
      { icon: Sparkles, label: "Chat IA", href: "/chat" },
      { icon: Calculator, label: "Simulador", href: "/simulador" },
      { icon: FileUp, label: "Importar extrato", href: "/importar" },
      { icon: Settings, label: "Configurações", href: "/configuracoes" },
    ],
  },
];


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMei } = useUsageType();
  const sections = isMei ? SECTIONS.map((sec, i) => (i === 0 ? { ...sec, items: sec.items.concat([{ icon: Briefcase, label: "Pacote MEI", href: "/mei" }]) } : sec)) : SECTIONS;
  const [mounted, setMounted] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [preset, setPreset] = useState<QuickAddPreset | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Outras telas abrem o lançamento rápido (ex.: "Nova compra" na fatura do cartão).
  useEffect(() => {
    const h = (e: Event) => {
      setPreset((e as CustomEvent<QuickAddPreset>).detail ?? undefined);
      setQuickOpen(true);
    };
    window.addEventListener("jakash:quickadd", h);
    return () => window.removeEventListener("jakash:quickadd", h);
  }, []);

  const openQuick = () => { setPreset(undefined); setQuickOpen(true); };

  if (!mounted) return <div className="min-h-screen bg-[var(--bg-1)] dark:bg-black" />;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-1)] via-[var(--bg-2)] to-[var(--bg-3)] dark:from-black dark:via-black dark:to-black flex flex-col md:flex-row font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300 print:block print:min-h-0 print:bg-none print:bg-white">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white/70 dark:bg-[#0B0B0B] backdrop-blur-xl hidden md:flex print:!hidden flex-col h-screen sticky top-0 rounded-r-[32px] shadow-[0_8px_30px_rgba(91,91,240,0.10)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.45)] z-20 border-r border-white/80 dark:border-white/5">
        <div className="p-8 flex items-center gap-3">
          <img src="/logo.png" alt="Jakash" className="w-10 h-10 rounded-xl object-cover" />
          <span className="font-bold text-lg text-black dark:text-white tracking-tight">Jakash</span>
        </div>

        <div className="px-6 pb-4">
          <button onClick={openQuick} className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-dark to-brand-accent dark:from-brand-vivid dark:to-brand-vivid py-3 text-sm font-bold text-white shadow-lg shadow-brand-dark/30 dark:shadow-none"><Plus size={18} /> Novo lançamento</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6 scrollbar-hide">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest">{section.title}</p>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                        active
                          ? "bg-gradient-to-r from-brand-dark to-brand-accent text-white font-bold shadow-lg shadow-brand-dark/30 dark:from-brand-vivid dark:to-brand-vivid dark:shadow-none"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#262626] hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="p-6"><InstallButton className="w-full" /></div>
      </aside>

      {/* Topo - Mobile */}
      <header className="md:hidden print:hidden sticky top-0 z-20 bg-white/80 dark:bg-[#0B0B0B] backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Jakash" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-extrabold text-black dark:text-white">Jakash</span>
          </Link>
          <Link href="/configuracoes" aria-label="Configurações" className="w-9 h-9 rounded-full bg-brand-dark/10 dark:bg-[#262626] flex items-center justify-center text-brand-dark dark:text-brand-soft"><Settings size={18} /></Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative">
        <main className="flex-1 p-4 md:p-10 overflow-x-hidden pt-6 md:pt-8 pb-28 md:pb-10 print:p-0 print:overflow-visible">{children}</main>
      </div>
      {/* Barra inferior - Mobile */}
      <nav className="md:hidden print:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-[#0B0B0B] backdrop-blur-xl border-t border-white/80 dark:border-white/5 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 items-center px-2 h-16">
          {[
            { icon: Home, href: "/dashboard", label: "Início" },
            { icon: Send, href: "/transacoes", label: "Lançamentos" },
          ].map((it) => (
            <Link key={it.href} href={it.href} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${isActive(it.href) ? "text-brand-dark dark:text-brand-soft" : "text-gray-400"}`}>
              <it.icon size={22} />{it.label}
            </Link>
          ))}
          <button onClick={openQuick} aria-label="Novo lançamento" className="mx-auto -mt-6 w-14 h-14 rounded-full bg-gradient-to-br from-brand-dark to-brand-accent dark:from-brand-vivid dark:to-brand-vivid text-white flex items-center justify-center shadow-xl shadow-brand-dark/40 dark:shadow-none"><Plus size={28} /></button>
          {[
            { icon: Gauge, href: "/limites", label: "Limites" },
            { icon: MenuIcon, href: "/menu", label: "Menu" },
          ].map((it) => (
            <Link key={it.href} href={it.href} className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${isActive(it.href) ? "text-brand-dark dark:text-brand-soft" : "text-gray-400"}`}>
              <it.icon size={22} />{it.label}
            </Link>
          ))}
        </div>
      </nav>

      <QuickAdd open={quickOpen} onClose={() => setQuickOpen(false)} preset={preset} />
      <AccentSync />
      <ReferralSync />
    </div>
  );
}

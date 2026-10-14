"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Send, FileText, Gauge, CalendarClock, Landmark, Target, ShieldCheck,
  Calculator, Settings, type LucideIcon,
} from "lucide-react";

type Item = { icon: LucideIcon; label: string; href: string };
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    title: "MENU",
    items: [
      { icon: Home, label: "Resumo", href: "/dashboard" },
      { icon: Send, label: "Transações", href: "/transacoes" },
      { icon: FileText, label: "Relatórios", href: "/relatorios" },
    ],
  },
  {
    title: "PLANEJAMENTO",
    items: [
      { icon: Gauge, label: "Limites", href: "/limites" },
      { icon: CalendarClock, label: "Contas a pagar", href: "/contas" },
      { icon: Landmark, label: "Dívidas", href: "/dividas" },
      { icon: Target, label: "Objetivos", href: "/metas" },
      { icon: ShieldCheck, label: "Reserva", href: "/reserva" },
    ],
  },
  {
    title: "FERRAMENTAS",
    items: [
      { icon: Calculator, label: "Simulador", href: "/simulador" },
      { icon: Settings, label: "Configurações", href: "/configuracoes" },
    ],
  },
];

const ALL_ITEMS = SECTIONS.flatMap((s) => s.items);

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#EEF0FB] dark:bg-gray-900" />;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF0FB] via-[#E4E8FA] to-[#EADFFB] dark:from-gray-900 dark:to-gray-900 flex flex-col md:flex-row font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white/70 dark:bg-gray-800 backdrop-blur-xl hidden md:flex flex-col h-screen sticky top-0 rounded-r-[32px] shadow-[0_8px_30px_rgba(91,91,240,0.10)] z-20 border-r border-white/80 dark:border-gray-700">
        <div className="p-8 flex items-center gap-3">
          <img src="/logo.png" alt="Jakash" className="w-10 h-10 rounded-xl object-cover" />
          <span className="font-bold text-lg text-black dark:text-white tracking-tight">Jakash</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6 scrollbar-hide">
          {SECTIONS.map((section) => (
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
                          ? "bg-gradient-to-r from-brand-dark to-brand-accent text-white font-bold shadow-lg shadow-brand-dark/30"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
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
      </aside>

      {/* Navegação - Mobile */}
      <div className="md:hidden sticky top-0 z-20 bg-white/80 dark:bg-gray-800 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-2 px-4 pt-3">
          <img src="/logo.png" alt="Jakash" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-bold text-black dark:text-white">Jakash</span>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {ALL_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                  active ? "bg-gradient-to-r from-brand-dark to-brand-accent text-white" : "bg-white/70 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative">
        <main className="flex-1 p-4 md:p-10 overflow-x-hidden pt-6 md:pt-8">{children}</main>
      </div>
    </div>
  );
}

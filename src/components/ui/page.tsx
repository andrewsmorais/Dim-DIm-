"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel, shiftMonth } from "@/lib/format";

export const inputCls =
  "w-full rounded-2xl border border-white/70 dark:border-white/5 bg-white/70 dark:bg-[#1E1E1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20";

export const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-dark to-brand-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-dark/30 dark:from-brand-vivid dark:to-brand-vivid dark:shadow-none hover:opacity-90 disabled:opacity-50 transition-opacity";

export const btnGhostCls =
  "inline-flex items-center justify-center gap-1 rounded-full border border-white/70 bg-white/60 dark:bg-transparent dark:border-white/5 px-3.5 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/75 dark:bg-[#161616] backdrop-blur-xl rounded-[28px] p-5 md:p-6 shadow-[0_8px_30px_rgba(91,91,240,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] border border-white/80 dark:border-white/5 ${className}`}>
      {children}
    </div>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{children}</label>;
}

export function Progress({ value, tone = "brand" }: { value: number; tone?: "brand" | "ok" | "warn" | "bad" }) {
  const color = { brand: "bg-gradient-to-r from-brand-accent to-brand-dark dark:from-brand-vivid dark:to-brand-vivid", ok: "bg-gradient-to-r from-brand-accent to-brand-dark dark:from-brand-vivid dark:to-brand-vivid", warn: "bg-gradient-to-r from-amber-300 to-amber-500", bad: "bg-gradient-to-r from-red-400 to-red-500" }[tone];
  return (
    <div className="h-2.5 w-full rounded-full bg-brand-dark/10 dark:bg-[#262626] overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-sm text-gray-400 py-8">{children}</p>;
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-sm text-red-500 font-medium mt-3">{message}</p>;
}

export function Disclaimer() {
  return (
    <p className="text-xs text-gray-400 mt-6">
      Conteúdo educativo e simulações com base nos valores que você informa. Não é recomendação de investimento, crédito ou produto financeiro.
    </p>
  );
}

export function MonthNav({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-full bg-white/75 dark:bg-[#161616] border border-white/80 dark:border-white/5 px-2 py-1.5">
      <button onClick={() => onChange(shiftMonth(month, -1))} aria-label="Mês anterior" className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-brand-dark/10 dark:hover:bg-[#262626]"><ChevronLeft size={18} /></button>
      <span className="font-extrabold text-sm md:text-base">{monthLabel(month)}</span>
      <button onClick={() => onChange(shiftMonth(month, 1))} aria-label="Próximo mês" className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-brand-dark/10 dark:hover:bg-[#262626]"><ChevronRight size={18} /></button>
    </div>
  );
}

export function BackTitle({ title, subtitle, href = "/menu" }: { title: string; subtitle?: string; href?: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <a href={href} aria-label="Voltar" className="md:hidden mt-1 w-10 h-10 shrink-0 rounded-2xl bg-white/80 dark:bg-[#161616] border border-white/80 dark:border-white/5 flex items-center justify-center"><ChevronLeft size={20} /></a>
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm md:text-base">{subtitle}</p>}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-4 rounded-2xl border border-white/70 dark:border-white/5 bg-white/60 dark:bg-[#1E1E1E] px-4 py-3.5 text-left">
      <span><span className="block font-bold text-sm">{label}</span>{hint && <span className="block text-xs text-gray-500 mt-0.5">{hint}</span>}</span>
      <span className={`relative w-12 h-7 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-dark dark:bg-brand-vivid" : "bg-gray-300 dark:bg-[#333]"}`}>
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

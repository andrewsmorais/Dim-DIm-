import React from "react";

export const inputCls =
  "w-full rounded-2xl border border-white/70 dark:border-white/5 bg-white/70 dark:bg-[#1E1E1E] px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-brand-dark focus:ring-2 focus:ring-brand-dark/20";

export const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-dark to-brand-accent px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-dark/30 dark:from-[#8B5CFF] dark:to-[#8B5CFF] dark:shadow-none hover:opacity-90 disabled:opacity-50 transition-opacity";

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
  const color = { brand: "bg-gradient-to-r from-brand-accent to-brand-dark dark:from-[#8B5CFF] dark:to-[#8B5CFF]", ok: "bg-gradient-to-r from-brand-accent to-brand-dark dark:from-[#8B5CFF] dark:to-[#8B5CFF]", warn: "bg-gradient-to-r from-amber-300 to-amber-500", bad: "bg-gradient-to-r from-red-400 to-red-500" }[tone];
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

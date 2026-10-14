"use client";

import { useEffect, useState } from "react";
import { useInstall, type Platform } from "@/components/PWA";

// Passo a passo ilustrado (desenhos feitos em SVG, não são capturas de tela) para quando a instalação direta não está disponível.

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 200" className="w-full max-w-[150px] mx-auto" role="img" aria-hidden="true">
      <rect x="4" y="4" width="112" height="192" rx="16" fill="#111827" />
      <rect x="9" y="12" width="102" height="176" rx="9" fill="#F9FAFB" />
      <rect x="44" y="6" width="32" height="4" rx="2" fill="#374151" />
      {children}
    </svg>
  );
}
const Hl = (p: { x: number; y: number; w: number; h: number; r?: number }) => <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r ?? 6} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeDasharray="4 2" />;
const Line = ({ y, w = 60, x = 18 }: { y: number; w?: number; x?: number }) => <rect x={x} y={y} width={w} height="5" rx="2.5" fill="#D1D5DB" />;
const Dots = ({ x, y }: { x: number; y: number }) => <g fill="#374151"><circle cx={x} cy={y} r="1.8" /><circle cx={x} cy={y + 6} r="1.8" /><circle cx={x} cy={y + 12} r="1.8" /></g>;

type Step = { title: string; text: string; art: React.ReactNode };

const ANDROID: Step[] = [
  { title: "Abra no Chrome", text: "Entre em jakash.app no Google Chrome e toque nos 3 pontinhos no canto de cima, à direita.",
    art: <Phone><rect x="9" y="12" width="102" height="22" fill="#E5E7EB" /><rect x="16" y="17" width="68" height="12" rx="6" fill="#fff" /><Dots x={100} y={16} /><Hl x={92} y={12} w={16} h={22} r={8} /><Line y={50} w={70} /><Line y={62} w={50} /><Line y={74} w={80} /></Phone> },
  { title: "Toque em Instalar app", text: "No menu, escolha “Instalar app” (em alguns celulares aparece “Adicionar à tela inicial”).",
    art: <Phone><rect x="52" y="30" width="56" height="86" rx="6" fill="#fff" stroke="#D1D5DB" /><Line x={58} y={40} w={36} /><Line x={58} y={54} w={30} /><rect x="55" y="66" width="50" height="14" rx="4" fill="#EDE9FE" /><Line x={58} y={70} w={40} /><Hl x={53} y={64} w={54} h={18} /><Line x={58} y={94} w={34} /><Line x={58} y={106} w={28} /></Phone> },
  { title: "Confirme", text: "Toque em “Instalar”. O ícone do Jakash aparece na tela inicial, e você abre como qualquer app.",
    art: <Phone><rect x="20" y="64" width="80" height="62" rx="8" fill="#fff" stroke="#D1D5DB" /><Line x={28} y={74} w={44} /><rect x="60" y="104" width="34" height="14" rx="7" fill="#7C3AED" /><Hl x={58} y={102} w={38} h={18} r={9} /><Line x={28} y={90} w={60} /></Phone> },
];

const IOS: Step[] = [
  { title: "Abra no Safari", text: "Entre em jakash.app no Safari (não funciona por outros navegadores no iPhone) e toque no botão Compartilhar, o quadrado com a seta pra cima, na barra de baixo.",
    art: <Phone><rect x="9" y="160" width="102" height="28" fill="#E5E7EB" /><g fill="none" stroke="#2563EB" strokeWidth="2"><rect x="54" y="166" width="12" height="14" rx="2" /><path d="M60 173V160M56 164l4-4 4 4" /></g><Hl x={48} y={158} w={24} h={26} /><Line y={50} w={70} /><Line y={62} w={50} /><Line y={74} w={80} /></Phone> },
  { title: "Adicionar à Tela de Início", text: "Role a lista para cima e toque em “Adicionar à Tela de Início”.",
    art: <Phone><rect x="9" y="60" width="102" height="128" rx="10" fill="#fff" stroke="#D1D5DB" /><Line x={18} y={72} w={54} /><Line x={18} y={86} w={44} /><rect x="14" y="98" width="92" height="16" rx="4" fill="#EDE9FE" /><Line x={20} y={103} w={66} /><Hl x={13} y={96} w={94} h={20} /><Line x={18} y={128} w={50} /><Line x={18} y={142} w={40} /></Phone> },
  { title: "Toque em Adicionar", text: "Confirme no canto de cima, à direita. O ícone do Jakash fica na tela inicial.",
    art: <Phone><rect x="9" y="12" width="102" height="24" fill="#F3F4F6" /><text x="94" y="28" fontSize="9" fontWeight="700" fill="#2563EB" textAnchor="middle">Adicionar</text><Hl x={76} y={14} w={36} h={20} r={10} /><rect x="42" y="64" width="36" height="36" rx="9" fill="#34D399" /><Line x={30} y={112} w={60} /><Line x={30} y={124} w={40} /></Phone> },
];

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
      {steps.map((s, i) => (
        <li key={s.title} className="rounded-2xl border border-gray-100 dark:border-[#262626] p-3 text-center">
          {s.art}
          <p className="mt-3 font-extrabold text-sm"><span className="inline-flex w-5 h-5 mr-1.5 items-center justify-center rounded-full bg-brand-dark text-white text-[11px]">{i + 1}</span>{s.title}</p>
          <p className="text-xs text-gray-500 mt-1">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function InstallGuide({ openSignal = 0 }: { openSignal?: number }) {
  const { platform, inApp } = useInstall();
  const [tab, setTab] = useState<"android" | "ios">("android");
  useEffect(() => { setTab(platform === "ios-safari" || platform === "ios-other" ? "ios" : "android"); }, [platform]);
  const hint: Partial<Record<Platform, string>> = {
    "ios-other": "Você está em outro navegador. No iPhone, a instalação só funciona pelo Safari: copie o endereço e abra lá.",
    desktop: "No computador, procure o ícone de instalar na barra de endereço do Chrome ou Edge. O passo a passo abaixo é para o celular.",
  };
  return (
    <div id="como-instalar" data-signal={openSignal}>
      <h2 className="font-extrabold text-lg">Como instalar no celular</h2>
      {inApp && <p className="mt-2 text-sm rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 p-3">Você abriu por dentro de outro app (Instagram, WhatsApp...). Toque nos 3 pontinhos e escolha “Abrir no navegador” antes de instalar.</p>}
      {hint[platform] && <p className="mt-2 text-sm text-gray-500">{hint[platform]}</p>}
      <div className="mt-3 inline-flex rounded-full bg-gray-100 dark:bg-[#1E1E1E] p-1 text-sm font-bold" role="tablist">
        {([["android", "Android (Chrome)"], ["ios", "iPhone (Safari)"]] as const).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`px-4 py-1.5 rounded-full transition-colors ${tab === k ? "bg-white dark:bg-[#2A2A2A] shadow-sm text-brand-dark dark:text-brand-soft" : "text-gray-500"}`}>{label}</button>
        ))}
      </div>
      <Steps steps={tab === "android" ? ANDROID : IOS} />
    </div>
  );
}

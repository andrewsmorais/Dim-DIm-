"use client";

import { useEffect, useState } from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { BackTitle, Card } from "@/components/ui/page";

const ACCENTS = [
  { id: "violet", label: "Violeta", a: "#5B5BF0", b: "#EEF0FB" },
  { id: "blue", label: "Azul", a: "#2563EB", b: "#EEF4FF" },
  { id: "green", label: "Verde", a: "#15803D", b: "#EEF8F1" },
  { id: "rose", label: "Rosa", a: "#BE185D", b: "#FBEFF3" },
  { id: "orange", label: "Laranja", a: "#C2410C", b: "#FDF3EA" },
  { id: "cyan", label: "Ciano", a: "#0E7490", b: "#ECF8FA" },
  { id: "red", label: "Vermelho", a: "#B91C1C", b: "#FCEFEF" },
  { id: "slate", label: "Grafite", a: "#334155", b: "#F1F3F6" },
];

export default function AparenciaPage() {
  const { theme, setTheme } = useTheme();
  const [accent, setAccent] = useState("violet");

  useEffect(() => {
    try { setAccent(localStorage.getItem("jakash-accent") || "violet"); } catch { /* sem storage */ }
  }, []);

  function pick(id: string) {
    setAccent(id);
    document.documentElement.dataset.accent = id;
    try { localStorage.setItem("jakash-accent", id); } catch { /* sem storage */ }
  }

  const current = ACCENTS.find((a) => a.id === accent) ?? ACCENTS[0];

  return (
    <div className="max-w-xl mx-auto pb-20">
      <BackTitle title="Aparência" subtitle="Tema e cor do aplicativo." href="/configuracoes" />

      <Card className="mb-4">
        <p className="font-extrabold mb-3">Tema</p>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-brand-dark/10 dark:bg-[#262626]">
          {([["light", "Claro", Sun], ["dark", "Escuro", Moon]] as const).map(([k, l, Icon]) => (
            <button key={k} onClick={() => setTheme(k)} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold ${theme === k ? "bg-white dark:bg-brand-vivid text-brand-dark dark:text-white shadow-sm" : "text-gray-500"}`}>
              <Icon size={18} /> {l}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="font-extrabold">Cor do tema</p>
        <p className="text-sm text-gray-500 mb-4">Escolha a cor que combina com você. Vale só neste aparelho.</p>
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 dark:border-white/5 px-4 py-3 mb-4">
          <div><p className="text-xs text-gray-500">Tema atual</p><p className="font-extrabold">{current.label}</p></div>
          <div className="flex gap-2"><span className="w-9 h-9 rounded-full" style={{ background: current.a }} /><span className="w-9 h-9 rounded-full border border-gray-200 dark:border-white/10" style={{ background: current.b }} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {ACCENTS.map((a) => (
            <button key={a.id} onClick={() => pick(a.id)} className={`rounded-2xl overflow-hidden border text-left ${accent === a.id ? "border-brand-dark ring-2 ring-brand-dark/30" : "border-gray-100 dark:border-white/5"}`}>
              <div className="flex h-12"><span className="flex-[2]" style={{ background: a.a }} /><span className="flex-1" style={{ background: a.b }} /></div>
              <div className="flex items-center justify-between px-3 py-2.5 text-sm font-bold">{a.label}{accent === a.id && <Check size={16} className="text-brand-dark dark:text-brand-soft" />}</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { useSettings } from "@/contexts/SettingsContext";
import { BackTitle, Card, Label, ErrorNote, inputCls, btnCls } from "@/components/ui/page";

export default function PreferenciasPage() {
  const { supabase, userId, ready } = useSupabase();
  const { language, setLanguage } = useSettings();
  const [lang, setLang] = useState<"pt" | "en" | "es">(language);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;
    supabase.from("profiles").select("language").maybeSingle().then(({ data }) => { if (data?.language) setLang(data.language as "pt" | "en" | "es"); });
  }, [ready, userId, supabase]);

  async function save() {
    const { error: err } = await supabase.from("profiles").update({ language: lang }).eq("id", userId);
    if (err) { setError("Não foi possível salvar."); return; }
    setLanguage(lang);
    setError(null); setMsg("Preferências salvas.");
  }

  return (
    <div className="max-w-xl mx-auto pb-20">
      <BackTitle title="Preferências" subtitle="Escolha seu idioma e moeda." href="/configuracoes" />
      <Card className="space-y-5">
        <div><Label>Idioma</Label>
          <select className={inputCls} value={lang} onChange={(e) => setLang(e.target.value as "pt" | "en" | "es")}>
            <option value="pt">Português (Brasil)</option><option value="en">English</option><option value="es">Español</option>
          </select></div>
        <div><Label>Moeda</Label>
          <select className={inputCls} value="BRL" disabled><option value="BRL">Real brasileiro (BRL)</option></select>
          <p className="text-xs text-gray-400 mt-1">Outras moedas chegam em uma próxima versão.</p></div>
        <button onClick={save} className={btnCls + " w-full"}><Save size={16} /> Salvar alterações</button>
        <ErrorNote message={error} />
        {msg && <p className="text-sm text-emerald-600 font-bold">{msg}</p>}
      </Card>
    </div>
  );
}

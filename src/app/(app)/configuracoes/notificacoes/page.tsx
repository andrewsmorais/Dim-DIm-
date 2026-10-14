"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { BackTitle, Card, Label, Toggle, ErrorNote, inputCls, btnCls } from "@/components/ui/page";

const WHEN = [
  { id: "on_due", label: "No dia do vencimento" },
  { id: "1_day", label: "1 dia antes" },
  { id: "3_days", label: "3 dias antes" },
  { id: "7_days", label: "7 dias antes" },
];

export default function NotificacoesPage() {
  const { supabase, userId, ready } = useSupabase();
  const [n, setN] = useState({ enabled: true, whatsapp: true, email: true, when: "on_due" });
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;
    supabase.from("profiles").select("notify_enabled,notify_whatsapp,notify_email,notify_when").maybeSingle().then(({ data }) => {
      if (data) setN({ enabled: data.notify_enabled, whatsapp: data.notify_whatsapp, email: data.notify_email, when: data.notify_when });
    });
  }, [ready, userId, supabase]);

  async function save() {
    const { error: err } = await supabase.from("profiles").update({ notify_enabled: n.enabled, notify_whatsapp: n.whatsapp, notify_email: n.email, notify_when: n.when }).eq("id", userId);
    if (err) { setError("Não foi possível salvar."); return; }
    setError(null); setMsg("Configurações salvas.");
  }

  return (
    <div className="max-w-xl mx-auto pb-20">
      <BackTitle title="Notificações" subtitle="Preferências de lembrete para contas a pagar e receber." href="/configuracoes" />
      <Card className="space-y-3">
        <Toggle checked={n.enabled} onChange={(v) => setN({ ...n, enabled: v })} label="Habilitar notificações" />
        <Toggle checked={n.whatsapp} onChange={(v) => setN({ ...n, whatsapp: v })} label="Notificações via WhatsApp" />
        <Toggle checked={n.email} onChange={(v) => setN({ ...n, email: v })} label="Notificações via e-mail" />
        <div className="pt-2"><Label>Quando notificar</Label>
          <select className={inputCls} value={n.when} onChange={(e) => setN({ ...n, when: e.target.value })}>
            {WHEN.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
          </select></div>
        <button onClick={save} className={btnCls + " w-full mt-2"}><Save size={16} /> Salvar configurações</button>
        <ErrorNote message={error} />
        {msg && <p className="text-sm text-emerald-600 font-bold">{msg}</p>}
        <p className="text-xs text-gray-400">O envio automático dos lembretes está sendo ativado aos poucos. Suas preferências já ficam salvas.</p>
      </Card>
    </div>
  );
}

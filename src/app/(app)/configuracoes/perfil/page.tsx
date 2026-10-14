"use client";

import { useEffect, useState } from "react";
import { Lock, Pencil } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { BackTitle, Card, Label, ErrorNote, inputCls, btnCls } from "@/components/ui/page";

function formatPhone(p: string | null): string {
  if (!p) return "Não conectado";
  const d = p.replace(/\D/g, "");
  if (d.length === 13) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  if (d.length === 12) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, 8)}-${d.slice(8)}`;
  return `+${d}`;
}

export default function PerfilPage() {
  const { supabase, userId, ready } = useSupabase();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !userId) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
    supabase.from("profiles").select("full_name,whatsapp_number").maybeSingle().then(({ data }) => {
      setName(data?.full_name ?? "");
      setPhone(data?.whatsapp_number ?? null);
    });
  }, [ready, userId, supabase]);

  async function save() {
    const clean = name.trim();
    if (clean.length < 2) { setError("Informe seu nome."); return; }
    const { error: err } = await supabase.from("profiles").update({ full_name: clean.slice(0, 80) }).eq("id", userId);
    if (err) { setError("Não foi possível salvar."); return; }
    setError(null); setEditing(false); setMsg("Nome atualizado.");
  }

  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "J";

  return (
    <div className="max-w-xl mx-auto pb-20">
      <BackTitle title="Meu perfil" subtitle="Atualize suas informações pessoais." href="/configuracoes" />
      <Card className="mb-4 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-brand-dark/10 dark:bg-[#262626] text-brand-dark dark:text-brand-soft text-xl font-extrabold flex items-center justify-center">{initials}</div>
        <p className="text-sm text-gray-500">A foto de perfil chega em uma próxima versão.</p>
      </Card>
      <Card className="divide-y divide-gray-100 dark:divide-[#262626] !py-2">
        <div className="py-4">
          <Label>Nome</Label>
          {editing ? (
            <div className="flex gap-2"><input autoFocus className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /><button onClick={save} className={btnCls}>Salvar</button></div>
          ) : (
            <div className="flex items-center justify-between"><p className="font-bold">{name || "—"}</p><button onClick={() => setEditing(true)} aria-label="Editar nome" className="text-gray-400"><Pencil size={16} /></button></div>
          )}
        </div>
        <div className="py-4"><Label>E-mail <Lock size={11} className="inline ml-1" /></Label><p className="font-bold break-all">{email || "—"}</p><p className="text-xs text-gray-400 mt-1">Para alterar, entre em contato com o suporte.</p></div>
        <div className="py-4"><Label>Telefone (WhatsApp) <Lock size={11} className="inline ml-1" /></Label><p className="font-bold">{formatPhone(phone)}</p><p className="text-xs text-gray-400 mt-1">Para alterar, entre em contato com o suporte.</p></div>
      </Card>
      <ErrorNote message={error} />
      {msg && <p className="text-sm text-emerald-600 font-bold mt-3">{msg}</p>}
    </div>
  );
}

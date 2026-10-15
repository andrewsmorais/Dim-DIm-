"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Copy, Heart, MessageCircle, Users } from "lucide-react";
import { usePartnership } from "@/lib/usePartnership";
import { formatDateBR } from "@/lib/format";
import { BackTitle, Card, Empty, ErrorNote, inputCls, btnCls, btnGhostCls } from "@/components/ui/page";

type Lookup = { ownerName: string; ownerEmail: string };

async function call(method: "POST" | "DELETE", body?: unknown) {
  const res = await fetch("/api/partnership", { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export default function CompartilhadaPage() {
  const { data, error: loadError, ready, userId, refresh } = usePartnership();
  const [code, setCode] = useState("");
  const [found, setFound] = useState<Lookup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const changed = () => {
    window.dispatchEvent(new Event("jakash:partnership"));
    window.dispatchEvent(new Event("jakash:changed"));
    refresh();
  };

  async function lookup(c = code) {
    setError(null); setFound(null);
    if (c.trim().length < 6) { setError("Digite o código completo."); return; }
    setBusy(true);
    const { ok, data: d } = await call("POST", { action: "lookup", code: c });
    setBusy(false);
    if (!ok) { setError(d.error || "Não foi possível conferir o código."); return; }
    setFound(d as Lookup);
  }

  // Link de convite: /configuracoes/compartilhada?codigo=XXXX
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("codigo");
    if (q && data?.state === "none") { setCode(q.toUpperCase()); lookup(q); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.state]);

  async function invite() {
    setError(null); setBusy(true);
    const { ok, data: d } = await call("POST", { action: "invite" });
    setBusy(false);
    if (!ok) { setError(d.error || "Não foi possível criar o convite."); return; }
    changed();
  }

  async function accept() {
    setError(null); setBusy(true);
    const { ok, data: d } = await call("POST", { action: "accept", code });
    setBusy(false);
    if (!ok) { setError(d.error || "Não foi possível aceitar."); return; }
    setFound(null); setCode("");
    changed();
  }

  async function end() {
    setBusy(true);
    const { ok, data: d } = await call("DELETE");
    setBusy(false);
    if (!ok) { setError(d.error || "Não foi possível encerrar."); return; }
    setConfirmEnd(false);
    changed();
  }

  const link = (c: string) => `${window.location.origin}/configuracoes/compartilhada?codigo=${c}`;
  async function copy(c: string) {
    try { await navigator.clipboard.writeText(link(c)); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* sem permissão */ }
  }
  const whatsapp = (c: string) =>
    `https://wa.me/?text=${encodeURIComponent(`Oi! Quero dividir as finanças com você no Jakash. Abra ${link(c)} (ou use o código ${c} em Configurações › Gestão compartilhada). O convite vale por 48 horas.`)}`;

  return (
    <div className="max-w-xl mx-auto pb-20">
      <BackTitle title="Gestão compartilhada" subtitle="Dividam as finanças da casa com outra pessoa." href="/configuracoes" />

      <Card className="mb-4">
        <p className="font-extrabold flex items-center gap-2 mb-2"><Heart size={18} className="text-brand-dark dark:text-brand-soft" /> Como funciona</p>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5 list-disc pl-5">
          <li>Vocês dois passam a ver e editar <b>contas bancárias, lançamentos, cartões, contas a pagar, limites, objetivos, dívidas e investimentos</b> um do outro.</li>
          <li>Cada lançamento mostra quem fez. O saldo e os totais passam a somar os dois.</li>
          <li><b>Perfil, assinatura, WhatsApp e conversas do chat continuam privados.</b></li>
          <li>Qualquer um pode encerrar a qualquer momento: cada um volta a ver só o que é seu.</li>
        </ul>
      </Card>

      {ready && !userId ? (
        <Card><Empty>Você está sem login. <Link href="/login" className="font-bold text-brand-dark dark:text-brand-soft">Entre na sua conta</Link> para gerenciar a gestão compartilhada.</Empty></Card>
      ) : !data && loadError ? (
        <Card>
          <p className="text-center text-sm text-gray-500 py-4">Não foi possível carregar agora.</p>
          <button onClick={refresh} className={btnGhostCls + " w-full"}>Tentar de novo</button>
        </Card>
      ) : !data && <Card><p className="text-center text-sm text-gray-400 py-6">Carregando...</p></Card>}

      {data?.state === "none" && (
        <>
          <Card className="mb-4">
            <p className="font-extrabold mb-1">Convidar alguém</p>
            <p className="text-sm text-gray-500 mb-4">Você recebe um código para mandar à outra pessoa. Ela precisa ter (ou criar) uma conta no Jakash.</p>
            <button onClick={invite} disabled={busy} className={btnCls + " w-full"}><Users size={16} /> Gerar convite</button>
          </Card>

          <Card>
            <p className="font-extrabold mb-1">Recebi um código</p>
            <div className="flex gap-2 mt-3">
              <input className={inputCls + " uppercase tracking-widest font-bold"} value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setFound(null); }} placeholder="CÓDIGO" maxLength={24} />
              <button onClick={() => lookup()} disabled={busy} className={btnGhostCls + " !px-5"}>Conferir</button>
            </div>
            {found && (
              <div className="mt-4 rounded-2xl border border-brand-dark/20 bg-brand-dark/5 dark:bg-black/30 p-4 space-y-3">
                <p className="text-sm"><b>{found.ownerName}</b>{found.ownerEmail && <span className="text-gray-500"> ({found.ownerEmail})</span>} convidou você para a gestão compartilhada.</p>
                <p className="text-xs text-gray-500">Ao aceitar, vocês passam a ver e editar as finanças um do outro (contas, lançamentos, cartões, limites, objetivos e investimentos). Se os dois já tiverem limite para a mesma categoria, vale o de quem convidou. Só aceite se você conhece essa pessoa.</p>
                <div className="flex gap-2">
                  <button onClick={() => setFound(null)} className={btnGhostCls + " flex-1 !py-3"}>Agora não</button>
                  <button onClick={accept} disabled={busy} className={btnCls + " flex-1"}>Aceitar</button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {data?.state === "pending" && (
        <Card>
          <p className="font-extrabold mb-1">Convite aberto</p>
          <p className="text-sm text-gray-500 mb-4">Mande este código para a outra pessoa. Vale até {formatDateBR(data.expiresAt.slice(0, 10))}.</p>
          <div className="rounded-2xl bg-brand-dark/10 dark:bg-[#1E1E1E] py-5 text-center text-3xl font-extrabold tracking-[0.25em] select-all">{data.code}</div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => copy(data.code)} className={btnGhostCls + " !py-3"}>{copied ? <><Check size={14} /> Link copiado</> : <><Copy size={14} /> Copiar link</>}</button>
            <a href={whatsapp(data.code)} target="_blank" rel="noopener noreferrer" className={btnCls + " !py-3"}><MessageCircle size={16} /> Enviar no WhatsApp</a>
          </div>
          <button onClick={end} disabled={busy} className="w-full text-sm font-bold text-red-500/80 py-3 mt-2">Cancelar convite</button>
        </Card>
      )}

      {data?.state === "accepted" && (
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-dark/10 dark:bg-[#262626] text-brand-dark dark:text-brand-soft font-extrabold flex items-center justify-center">
              {data.partner.name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Compartilhando com</p>
              <p className="font-extrabold truncate">{data.partner.name}</p>
              {data.since && <p className="text-xs text-gray-500">desde {formatDateBR(data.since.slice(0, 10))}</p>}
            </div>
          </div>
          {confirmEnd ? (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
              <p className="text-sm">Ao encerrar, vocês deixam de ver os dados um do outro. Nada é apagado: cada um continua com o que lançou.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmEnd(false)} className={btnGhostCls + " flex-1 !py-3"}>Voltar</button>
                <button onClick={end} disabled={busy} className={btnCls + " flex-1 !bg-none !bg-red-500 !shadow-none"}>Encerrar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmEnd(true)} className="w-full text-sm font-bold text-red-500/80 py-3 mt-3">Encerrar compartilhamento</button>
          )}
        </Card>
      )}

      <ErrorNote message={error} />
    </div>
  );
}

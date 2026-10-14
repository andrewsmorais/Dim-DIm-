"use client";

import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "@/lib/useSupabase";

export type PartnershipState =
  | { state: "none" }
  | { state: "pending"; code: string; expiresAt: string }
  | { state: "accepted"; role: "owner" | "partner"; me: { id: string; name: string }; partner: { id: string; name: string }; since: string | null };

// Cache curto por usuário para as telas não pedirem a parceria a cada navegação.
let cache: { userId: string; at: number; data: PartnershipState } | null = null;

// Estado da gestão compartilhada + nome de quem lançou (para as etiquetas "Você" / nome do parceiro).
export function usePartnership() {
  const { userId, ready } = useSupabase();
  const [data, setData] = useState<PartnershipState | null>(null);

  const load = useCallback(async (force = false) => {
    if (!userId) return;
    if (!force && cache && cache.userId === userId && Date.now() - cache.at < 60_000) { setData(cache.data); return; }
    try {
      const res = await fetch("/api/partnership", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as PartnershipState;
      cache = { userId, at: Date.now(), data: json };
      setData(json);
    } catch { /* sem rede: mantém o que tinha */ }
  }, [userId]);

  useEffect(() => { if (ready && userId) load(); }, [ready, userId, load]);
  useEffect(() => {
    const h = () => load(true);
    window.addEventListener("jakash:partnership", h);
    return () => window.removeEventListener("jakash:partnership", h);
  }, [load]);

  const partner = data?.state === "accepted" ? data.partner : null;
  // "Você" para o próprio usuário, primeiro nome do parceiro; vazio se não houver parceria.
  const nameOf = (id: string | null | undefined) => {
    if (!id || !partner) return "";
    if (id === userId) return "Você";
    return id === partner.id ? partner.name.split(" ")[0] : "";
  };

  return { data, partner, shared: Boolean(partner), nameOf, userId, refresh: () => load(true) };
}

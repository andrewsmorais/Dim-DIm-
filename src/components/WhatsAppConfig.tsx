"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, Copy, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type LinkInfo = { code: string; expiresInMinutes: number; waLink: string | null; botNumber: string | null };

export function WhatsAppConfig() {
  const [connectedNumber, setConnectedNumber] = useState<string | null>(null);
  const [link, setLink] = useState<LinkInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("whatsapp_number").eq("id", user.id).single();
      setConnectedNumber(data?.whatsapp_number ?? null);
    } catch {
      // sem sessão ou sem rede: mantém o estado atual
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Enquanto há um código ativo, confere a cada 4s se o número já foi vinculado
  useEffect(() => {
    if (!link || connectedNumber) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(checkConnection, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [link, connectedNumber, checkConnection]);

  const generateCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/whatsapp/link-code", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar código");
      setLink(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(`conectar ${link.code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível: o código continua visível na tela
    }
  };

  return (
    <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
          <MessageCircle size={20} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Integração WhatsApp</h3>
          <p className="text-sm text-white/50">Converse com seu assistente e organize gastos.</p>
        </div>
      </div>

      <div className="bg-black/50 p-6 rounded-xl border border-white/5 mb-6 text-center">
        {connectedNumber ? (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="text-primary mb-3" size={48} />
            <h4 className="font-bold text-xl mb-1">Conectado com sucesso!</h4>
            <p className="text-sm text-white/50">Seu número está verificado. Mande uma mensagem agora.</p>
          </div>
        ) : link ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-white/60">Mande esta mensagem para o assistente no WhatsApp:</p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-3 rounded-lg">
              <span className="font-mono text-lg tracking-wider">conectar {link.code}</span>
              <button onClick={copyMessage} className="text-primary hover:text-primary-dark transition-colors p-1" aria-label="Copiar mensagem">
                <Copy size={16} />
              </button>
              {copied && <span className="text-xs text-primary">Copiado!</span>}
            </div>
            {link.waLink ? (
              <a href={link.waLink} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-[#25D366] text-black hover:bg-[#1ebe5b]">Abrir o WhatsApp</Button>
              </a>
            ) : (
              <p className="text-xs text-yellow-500">Número do assistente ainda não configurado.</p>
            )}
            <p className="text-xs text-white/40">
              O código vale por {link.expiresInMinutes} minutos. Esta tela atualiza sozinha quando conectar.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <h4 className="font-bold">Conecte seu WhatsApp</h4>
            <p className="text-sm text-white/50 mb-1">
              Gere um código e mande para o assistente. Assim confirmamos que o número é seu.
            </p>
            <Button onClick={generateCode} disabled={loading} className="bg-primary text-black hover:bg-primary-dark">
              {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Gerando...</>) : "Gerar código"}
            </Button>
          </div>
        )}
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-white/70">Depois de conectar, experimente:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <p className="text-xs text-white/50 mb-1">Exemplo 1 (Gasto)</p>
            <p className="text-sm italic">&quot;Comprei um lanche por 35 no cartão&quot;</p>
          </div>
          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <p className="text-xs text-white/50 mb-1">Exemplo 2 (Entrada)</p>
            <p className="text-sm italic">&quot;Caiu o salário de 4200&quot;</p>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-white/5 pt-6">
        <span className="text-sm flex items-center gap-2">
          Status:
          {connectedNumber ? (
            <span className="text-primary font-bold">Ativo</span>
          ) : (
            <span className="text-yellow-500 font-bold">Aguardando ativação...</span>
          )}
        </span>
      </div>
    </div>
  );
}

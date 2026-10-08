"use client";

import { useState } from "react";
import { Send, Upload, Loader2, Bot, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AITestInterface() {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<{ error?: string; reply?: string; data?: any } | null>(null);

  const handleTest = async () => {
    if (!message && !imageUrl) return;
    
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/process-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, imageUrl }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : "Erro de conexão" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Testar Grana IA</h2>
          <p className="text-sm text-text-secondary">Simulador direto da API OpenAI (GPT-4o-mini)</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Mensagem do Usuário</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Gastei 45 no ifood hoje de noite..."
            className="w-full h-24 bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">URL de Imagem Opcional (Vision OCR)</label>
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-white/50" />
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/comprovante.jpg"
              className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <Button 
          onClick={handleTest} 
          disabled={loading || (!message && !imageUrl)}
          className="w-full h-12 bg-primary text-black font-bold hover:bg-primary-dark transition-all rounded-xl"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analisando contexto...</>
          ) : (
            <><Send className="mr-2 h-5 w-5" /> Enviar para IA</>
          )}
        </Button>
      </div>

      {result && (
        <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 relative z-10">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <FileJson className="text-primary" size={20} />
            Resposta Processada
          </h3>

          {result.error ? (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
              {result.error}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mensagem devolvida pro usuário (Reply) */}
              <div className="bg-[#0A0A0A] border border-white/10 p-4 rounded-xl">
                <span className="text-xs text-white/40 uppercase font-bold block mb-2">Mensagem do Zap (Reply)</span>
                <p className="text-white text-sm">{result.reply}</p>
              </div>

              {/* JSON Data Extraído */}
              {result.data && (
                <div className="bg-[#0A0A0A] border border-white/10 p-4 rounded-xl overflow-x-auto">
                  <span className="text-xs text-white/40 uppercase font-bold block mb-2">JSON Estruturado (Banco de Dados)</span>
                  <pre className="text-xs text-primary font-mono leading-relaxed">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

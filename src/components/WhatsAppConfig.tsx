"use client";

import { useState } from "react";
import { CheckCircle, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppConfig() {
  const [isConnected, setIsConnected] = useState(false);
  const waNumber = "+55 11 99999-9999"; // Número oficial do bot Grana Smart

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
        {isConnected ? (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="text-primary mb-3" size={48} />
            <h4 className="font-bold text-xl mb-1">Conectado com sucesso!</h4>
            <p className="text-sm text-white/50">Seu número está verificado. Mande uma mensagem agora.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded-xl mb-4 w-32 h-32 flex items-center justify-center">
              {/* Fake QR Code */}
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/${waNumber.replace(/\D/g,'')}?text=Oi%20Grana!%20Quero%20conectar%20minha%20conta.`} alt="QR Code WhatsApp" className="w-full h-full object-contain" />
            </div>
            <h4 className="font-bold mb-2">Escaneie o QR Code</h4>
            <p className="text-sm text-white/50 mb-4">
              Aponte a câmera do celular ou clique no link abaixo para ativar seu número.
            </p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg">
              <span className="font-mono text-sm text-white/80">{waNumber}</span>
              <button className="text-primary hover:text-primary-dark transition-colors p-1"><Copy size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-sm text-white/70">Como testar:</h4>
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

      <div className="mt-8 border-t border-white/5 pt-6 flex justify-between items-center">
        <span className="text-sm flex items-center gap-2">
          Status: 
          {isConnected ? (
            <span className="text-primary font-bold">Ativo</span>
          ) : (
            <span className="text-yellow-500 font-bold">Aguardando ativação...</span>
          )}
        </span>
        
        {!isConnected && (
          <Button onClick={() => setIsConnected(true)} variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary hover:text-black">
            Simular Conexão
          </Button>
        )}
      </div>
    </div>
  );
}

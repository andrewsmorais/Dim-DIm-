"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  plan: "cpf" | "mei";
  cpfCnpj: string;
  className?: string;
}

const PLAN_LABEL = { cpf: "Assinar por R$ 19,90", mei: "Assinar por R$ 39,90" } as const;

export function CheckoutButton({ plan, cpfCnpj, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usuário vem da sessão no servidor; o valor vem do plano no servidor.
      const res = await fetch("/api/asaas/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, cpfCnpj }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar assinatura");
      }

      // Redireciona para o link gerado pelo Asaas
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Button 
        onClick={handleCheckout} 
        disabled={loading}
        size="lg"
        className={`w-full font-bold bg-primary text-black hover:bg-primary-dark transition-all rounded-xl ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processando...
          </>
        ) : (
          PLAN_LABEL[plan]
        )}
      </Button>
      {error && (
        <span className="text-red-400 text-sm text-center font-medium">
          {error}
        </span>
      )}
    </div>
  );
}

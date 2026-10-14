"use client";

import { BackTitle, Card } from "@/components/ui/page";
import { WhatsAppConfig } from "@/components/WhatsAppConfig";

export default function WhatsAppPage() {
  return (
    <div className="max-w-xl mx-auto pb-20">
      <BackTitle title="WhatsApp" subtitle="Registre gastos e receitas direto pelo WhatsApp." href="/configuracoes" />
      <Card className="mb-4 space-y-2 text-sm">
        <p className="font-extrabold">Como usar</p>
        <p className="text-gray-500">Depois de conectar, mande mensagens como <b>“gastei 45 no mercado”</b> ou <b>“recebi 1200 do cliente João”</b>. A IA entende, categoriza e lança para você.</p>
      </Card>
      <WhatsAppConfig />
    </div>
  );
}

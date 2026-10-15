import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contato | Jakash",
  description: "Fale com o Jakash: Instagram, WhatsApp do assistente e canais de suporte.",
};

// Lê no servidor a cada acesso, para refletir a variável da Vercel sem novo build.
export const dynamic = "force-dynamic";

export default function ContatoPage() {
  const bot = (process.env.WHATSAPP_BOT_NUMBER || "").replace(/\D/g, "");

  return (
    <LegalPage title="Contato" subtitle="Dúvidas, suporte, pedidos sobre seus dados ou reembolso." updated={false}>
      <h2>Como falar com a gente</h2>
      <ul>
        <li>
          <strong>Instagram:</strong>{" "}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@{INSTAGRAM_HANDLE}</a>, é só mandar uma mensagem direta.
        </li>
        {bot && (
          <li>
            <strong>Assistente no WhatsApp:</strong>{" "}
            <a href={`https://wa.me/${bot}`} target="_blank" rel="noopener noreferrer">abrir conversa</a>. Se você já conectou seu número, o assistente responde dúvidas de uso.
          </li>
        )}
        <li><strong>Dentro do app:</strong> entre na sua conta e veja Configurações para ajustes de perfil, plano e dados.</li>
      </ul>

      <h2>Ao pedir ajuda, informe</h2>
      <ul>
        <li>O e-mail da sua conta (nunca envie sua senha).</li>
        <li>O que aconteceu e, se puder, um print da tela.</li>
        <li>Para <strong>reembolso</strong>, o motivo e a data da cobrança. Veja a <Link href="/politica-de-reembolso">Política de reembolso</Link>.</li>
        <li>Para <strong>pedidos sobre seus dados</strong> (LGPD), o que você quer fazer. Veja a <Link href="/politica-de-privacidade">Política de privacidade</Link>.</li>
      </ul>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de reembolso | Jakash",
  description: "Teste grátis de 7 dias, cancelamento a qualquer momento e como pedir reembolso no Jakash.",
};

export default function ReembolsoPage() {
  return (
    <LegalPage title="Política de reembolso" subtitle="Cancelar é simples e sem multa.">
      <h2>1. Teste grátis</h2>
      <p>Todo plano começa com <strong>7 dias grátis, sem cadastrar cartão</strong>. Se você cancelar antes do fim do teste, nada é cobrado.</p>

      <h2>2. Cancelamento</h2>
      <p>Você pode cancelar a renovação quando quiser, sem multa, em <strong>Configurações › Planos › Cancelar renovação</strong>. Depois de cancelar, você continua usando o Jakash até o fim do período já pago e não será cobrado de novo.</p>

      <h2>3. Direito de arrependimento (7 dias)</h2>
      <p>Conforme o art. 49 do Código de Defesa do Consumidor, se você assinou pela internet e se arrependeu, pode pedir o <strong>reembolso integral em até 7 dias corridos</strong> depois da contratação ou da primeira cobrança, sem precisar explicar o motivo.</p>

      <h2>4. Depois dos 7 dias</h2>
      <p>Passado esse prazo, não fazemos reembolso proporcional do período mensal já iniciado, porque o acesso ao serviço continua disponível até o fim dele. Os casos abaixo são exceções e sempre analisados.</p>

      <h2>5. Quando reembolsamos</h2>
      <ul>
        <li>Cobrança em duplicidade ou em valor diferente do contratado.</li>
        <li>Cobrança depois de um cancelamento feito corretamente.</li>
        <li>Falha do serviço que tenha impedido o uso por período relevante.</li>
      </ul>

      <h2>6. Como pedir</h2>
      <p>Fale conosco pela página de <Link href="/contato">Contato</Link> informando o e-mail da sua conta e o motivo. Respondemos o mais rápido possível.</p>

      <h2>7. Como e quando você recebe</h2>
      <p>O reembolso é feito pela mesma forma de pagamento usada (Pix, cartão ou boleto), pelo Asaas. Em cartão de crédito, o valor pode aparecer em até duas faturas, conforme a operadora do cartão. Em Pix ou boleto, a devolução é feita por transferência bancária.</p>

      <h2>8. Troca de plano</h2>
      <p>Ao trocar de plano em Configurações › Planos, o novo valor vale a partir da próxima renovação. Não há cobrança extra no momento da troca.</p>

      <p>Veja também os <Link href="/termos-de-uso">Termos de uso</Link>.</p>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidade | Jakash",
  description: "Quais dados o Jakash coleta, para que usamos, com quem compartilhamos e como exercer seus direitos (LGPD).",
  alternates: { canonical: "/politica-de-privacidade" },
};

export default function PrivacidadePage() {
  return (
    <LegalPage path="/politica-de-privacidade" title="Política de privacidade" subtitle="Como o Jakash trata os seus dados, de acordo com a LGPD (Lei 13.709/2018).">
      <p>Seus dados financeiros são sensíveis para você, e tratamos assim. Esta página explica o que coletamos, por quê, com quem compartilhamos e como você controla tudo.</p>

      <h2>1. Quais dados coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome, e-mail, telefone/WhatsApp e, ao assinar, CPF ou CNPJ (necessário para emitir a cobrança).</li>
        <li><strong>Dados financeiros que você registra:</strong> lançamentos, categorias, contas, cartões, contas a pagar, limites, objetivos, dívidas, investimentos e arquivos que você importa.</li>
        <li><strong>Mensagens ao assistente:</strong> o texto (e, quando enviados, fotos e áudios) que você manda no WhatsApp, e as respostas.</li>
        <li><strong>Pagamento:</strong> status da assinatura e histórico de cobranças. Dados de cartão são digitados na página segura do Asaas e <strong>não ficam armazenados no Jakash</strong>.</li>
        <li><strong>Dados técnicos:</strong> informações básicas de acesso e segurança (como registros de erro e horário de uso).</li>
      </ul>

      <h2>2. Para que usamos</h2>
      <ul>
        <li>Prestar o serviço: registrar lançamentos, calcular saldos, relatórios e lembretes.</li>
        <li>Montar o plano para quitar suas dívidas: as contas são feitas no próprio app com os valores que você cadastrou, e a inteligência artificial só escreve a explicação.</li>
        <li>Cobrar a assinatura e dar suporte.</li>
        <li>Enviar avisos que você ativou (contas a vencer, por push, e-mail ou WhatsApp).</li>
        <li>Manter a segurança, prevenir fraudes e cumprir obrigações legais.</li>
        <li>Melhorar o produto, de forma agregada.</li>
      </ul>
      <p>Não vendemos seus dados e não os usamos para publicidade de terceiros.</p>

      <h2>3. Bases legais</h2>
      <p>Tratamos seus dados para executar o contrato com você (prestar o serviço), cumprir obrigações legais, atender interesses legítimos (segurança e melhoria do produto) e, quando necessário, com o seu consentimento, que pode ser retirado a qualquer momento.</p>

      <h2>4. Com quem compartilhamos</h2>
      <p>Usamos prestadores que tratam dados em nosso nome, apenas para o que é necessário:</p>
      <ul>
        <li><strong>Supabase:</strong> banco de dados e autenticação.</li>
        <li><strong>Vercel:</strong> hospedagem do site e do aplicativo.</li>
        <li><strong>Asaas:</strong> processamento de pagamentos e assinaturas.</li>
        <li><strong>Meta (WhatsApp Business):</strong> envio e recebimento das mensagens do assistente.</li>
        <li><strong>OpenAI:</strong> interpretação das mensagens e arquivos pela inteligência artificial e redação da explicação do plano de dívidas (ela recebe valores e nomes das dívidas que você cadastrou, nunca CPF).</li>
        <li><strong>Resend:</strong> envio de e-mails do serviço.</li>
      </ul>
      <p>Alguns desses prestadores ficam fora do Brasil, o que significa transferência internacional de dados, feita com as garantias previstas na LGPD. Também podemos compartilhar dados quando a lei ou uma ordem de autoridade exigir.</p>
      <p><strong>Gestão compartilhada:</strong> se você convidar alguém, essa pessoa verá os dados financeiros compartilhados (veja os <Link href="/termos-de-uso">Termos de uso</Link>). Perfil, assinatura, WhatsApp e conversas do chat não são compartilhados.</p>

      <h2>5. Por quanto tempo guardamos</h2>
      <p>Mantemos seus dados enquanto sua conta existir. Ao excluir a conta, apagamos seus dados do aplicativo, exceto o que a lei nos obrigar a guardar (por exemplo, registros de cobrança e fiscais) pelo prazo legal.</p>

      <h2>6. Seus direitos</h2>
      <p>Você pode, a qualquer momento: confirmar que tratamos seus dados; acessá-los; corrigi-los; pedir portabilidade; revogar consentimentos; pedir a eliminação dos dados tratados com consentimento; e saber com quem os compartilhamos. No app, em <strong>Configurações › Dados</strong>, você exporta suas informações, recomeça do zero ou exclui a conta. Para outros pedidos, use a página de <Link href="/contato">Contato</Link>.</p>

      <h2>7. Segurança</h2>
      <p>Usamos conexão criptografada, controle de acesso por conta (cada pessoa só enxerga os próprios dados ou os que compartilhou) e chaves secretas protegidas no servidor. Nenhum sistema é 100% imune, e por isso recomendamos senha forte e nunca compartilhar seu código de vínculo do WhatsApp.</p>

      <h2>8. Crianças e adolescentes</h2>
      <p>O Jakash é destinado a maiores de 18 anos.</p>

      <h2>9. Mudanças nesta política</h2>
      <p>Podemos atualizar esta política. Quando a mudança for relevante, avisaremos pelo app ou por e-mail.</p>

      <h2>10. Contato</h2>
      <p>Dúvidas ou pedidos sobre seus dados: <Link href="/contato">página de Contato</Link>. Veja também a <Link href="/politica-de-cookies">Política de cookies</Link>.</p>
    </LegalPage>
  );
}

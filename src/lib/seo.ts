import { PLANS, PLAN_IDS, planPrice } from "@/lib/plans";

export const SITE_URL = "https://www.jakash.app";
export const INSTAGRAM_URL = "https://www.instagram.com/jakashfinancas/";

// Perguntas e respostas da landing. A MESMA lista alimenta a seção de FAQ visível e o JSON-LD (FAQPage):
// o dado estruturado nunca pode dizer algo que a página não mostra. Preços vêm de lib/plans.
export const FAQS: { q: string; a: string }[] = [
  {
    q: "O que é o Jakash e como funciona o controle financeiro pelo WhatsApp?",
    a: "O Jakash é um aplicativo de organização financeira com um assistente de Inteligência Artificial no WhatsApp. Você manda uma mensagem como “gastei 45 no mercado” e ele registra e categoriza o lançamento. No painel você acompanha saldo, limites de gastos, contas a pagar, dívidas e objetivos.",
  },
  {
    q: "Como a Inteligência Artificial ajuda na minha organização financeira?",
    a: "A IA entende suas mensagens no WhatsApp, identifica valor, categoria e data e lança tudo para você. Ela pode errar, por isso vale conferir os lançamentos no painel e corrigir quando precisar.",
  },
  {
    q: "Quais são os planos e os preços do Jakash?",
    a: `Há três planos, todos com 7 dias grátis: ${PLAN_IDS.map((id) => `${PLANS[id].name} por ${planPrice(id)}/mês`).join(", ")}. O Essencial é para 1 pessoa. O Família divide as finanças com até ${PLANS.familia.members} pessoas e inclui planejamento, investimentos, dívidas, simulador e Chat IA. O MEI inclui tudo do Família mais as ferramentas para MEI.`,
  },
  {
    q: "O Jakash é gratuito?",
    a: "O Jakash oferece 7 dias de teste grátis, sem cadastrar cartão de crédito. Depois disso, é preciso escolher um plano pago. Você pode cancelar a qualquer momento, sem multa.",
  },
  {
    q: "Funciona com o meu banco?",
    a: "Funciona com qualquer banco, porque você registra os lançamentos pelo WhatsApp ou pelo app, ou importa extratos, e informa o saldo das suas contas. A conexão automática com bancos (Open Finance) ainda não está disponível.",
  },
  {
    q: "Meus dados financeiros estão seguros no Jakash?",
    a: "O Jakash não pede a senha do seu banco e não movimenta dinheiro. Seus dados ficam protegidos por login e por regras de acesso individuais no banco de dados, e você pode exportar ou apagar tudo quando quiser, em Configurações › Dados.",
  },
  {
    q: "Posso dividir as finanças com minha família ou sócio?",
    a: `Sim. Nos planos Família e MEI você convida até ${PLANS.familia.members - 1} pessoas para a mesma casa, e todos veem e editam contas, lançamentos, limites e objetivos compartilhados. Perfil, assinatura e conversas do chat continuam privados.`,
  },
  {
    q: "O Jakash serve para MEI?",
    a: "Sim. O plano MEI inclui controle do limite anual, DASN, recibos, relatório do MEI e contas recorrentes como o DAS, com lembrete. O Jakash não emite nota fiscal.",
  },
  {
    q: "Como cancelo minha assinatura?",
    a: "Em Configurações › Planos › Cancelar renovação. Você continua com acesso até o fim do período já pago e não é cobrado de novo. Nos primeiros 7 dias após a contratação você também pode pedir reembolso integral.",
  },
];

// Dados estruturados da página inicial (Schema.org). Sem avaliações, notas, endereço ou números que não temos.
export function homeJsonLd() {
  const org = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Jakash",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [INSTAGRAM_URL],
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Jakash",
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: "Jakash",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        inLanguage: "pt-BR",
        description: "Aplicativo de controle financeiro com assistente de Inteligência Artificial no WhatsApp: lançamentos por mensagem, limites, contas a pagar, objetivos e gestão compartilhada.",
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        offers: PLAN_IDS.map((id) => ({
          "@type": "Offer",
          name: PLANS[id].name,
          price: PLANS[id].value.toFixed(2),
          priceCurrency: "BRL",
          url: `${SITE_URL}/#planos`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Camera, Mic, MessageCircle, BarChart2, Bell, Zap, 
  Plane, Car, Shield, CheckCircle, Smartphone, UserPlus, Send, LayoutDashboard, ChevronDown
} from "lucide-react";

export const metadata: Metadata = {
  title: "Grana Smart | App de Finanças Pessoais com IA e WhatsApp – Economize Dinheiro",
  description: "O app de finanças pessoais que conversa com você no WhatsApp. Controle gastos, economize dinheiro, crie metas e organize seu orçamento com inteligência artificial. R$ 19,90/mês, 7 dias grátis.",
  alternates: {
    canonical: "https://granasmart.com.br/",
  },
  openGraph: {
    title: "Grana Smart | App de Finanças Pessoais com IA e WhatsApp",
    description: "O app de finanças pessoais que conversa com você no WhatsApp. Controle gastos, economize dinheiro e organize seu orçamento.",
    url: "https://granasmart.com.br/",
    siteName: "Grana Smart",
    images: [{ url: "https://granasmart.com.br/og-image.jpg", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grana Smart | App de Finanças Pessoais",
    description: "Controle seus gastos diretamente pelo WhatsApp com Inteligência Artificial.",
    images: ["https://granasmart.com.br/twitter-card.jpg"],
  },
};

export default function LandingPage() {
  const asaasLink = process.env.NEXT_PUBLIC_ASAAS_CHECKOUT_URL || "#";

  const schemaSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Grana Smart",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web, Android, iOS",
    "offers": {
      "@type": "Offer",
      "price": "19.90",
      "priceCurrency": "BRL"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    }
  };

  const schemaOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Grana Smart",
    "url": "https://granasmart.com.br",
    "logo": "https://granasmart.com.br/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+55-11-99999-9999",
      "contactType": "customer service",
      "contactOption": "HearingImpairedSupported"
    },
    "sameAs": [
      "https://twitter.com/granasmart",
      "https://instagram.com/granasmart"
    ]
  };

  const faqs = [
    { q: "O que é o Grana Smart?", a: "O Grana Smart é um app de finanças pessoais inteligente. Ele usa inteligência artificial para organizar suas finanças, categorizar despesas e ajudar a economizar dinheiro, tudo integrado ao WhatsApp." },
    { q: "Como funciona o controle financeiro pelo WhatsApp?", a: "É simples! Basta mandar uma mensagem de texto, áudio ou uma foto de um recibo para o nosso número. A nossa inteligência artificial para finanças lê, interpreta e registra a transação no seu aplicativo para controlar gastos automaticamente." },
    { q: "Quanto custa?", a: "O plano principal custa apenas R$ 19,90/mês, com um período de teste de 7 dias grátis. Você tem acesso ilimitado ao assistente financeiro no WhatsApp, criação de metas financeiras e dashboard web." },
    { q: "É seguro conectar minhas contas?", a: "Sim, utilizamos o sistema Open Finance Brasil, que é altamente seguro e regulamentado pelo Banco Central. Seus dados são protegidos por criptografia de nível bancário e adequados à LGPD." },
    { q: "O que é Open Finance e é seguro?", a: "O Open Finance é um ecossistema seguro criado pelo Banco Central que permite compartilhar seus dados financeiros entre instituições de forma criptografada. É 100% seguro e você controla o que compartilha." },
    { q: "Posso cancelar quando quiser?", a: "Com certeza. Não temos fidelidade. Você pode assinar, usar nosso app de finanças pessoais e, caso não queira continuar, basta cancelar a assinatura com um clique no painel." },
    { q: "Funciona para MEI/CNPJ?", a: "Sim! Temos planos específicos para finanças para MEI, permitindo separar despesas de pessoa física (PF) e pessoa jurídica (PJ), fazer cálculos de impostos e ler Notas Fiscais." },
    { q: "Quais bancos são compatíveis?", a: "Nosso sistema de planejamento financeiro se conecta com os principais bancos e corretoras do Brasil via Open Finance (Nubank, Itaú, Bradesco, Santander, Banco do Brasil, XP, entre outros)." },
    { q: "Meus dados estão protegidos pela LGPD?", a: "Absolutamente. O Grana Smart foi construído desde o primeiro dia com base na Lei Geral de Proteção de Dados (LGPD). Seus dados não são vendidos e servem exclusivamente para o seu orçamento doméstico." },
    { q: "Qual o melhor app para economizar dinheiro em 2025?", a: "O Grana Smart se destaca como a melhor alternativa para organizar finanças pessoais em 2025 por ser o único que elimina o trabalho manual das planilhas, permitindo o controle total de gastos mensais apenas conversando no WhatsApp." }
  ];

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftware) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />

      <div className="min-h-screen flex flex-col bg-background text-text">
        {/* Header Semântico */}
        <header className="flex items-center justify-between p-6 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background font-bold" aria-hidden="true">G</div>
            <span className="font-bold text-xl">Grana Smart</span>
          </div>
          <nav aria-label="Navegação principal" className="hidden md:flex gap-6 items-center">
            <a href="#como-funciona" className="text-text-secondary hover:text-text transition-colors">Como funciona</a>
            <a href="#precos" className="text-text-secondary hover:text-text transition-colors">Preços</a>
            <a href="#faq" className="text-text-secondary hover:text-text transition-colors">Dúvidas</a>
            {/* Supabase Auth integration comment: */}
            {/* <Link href="/login"> -> Vai para o fluxo do Supabase Auth */}
            <Link href="/login" className="text-text-secondary hover:text-text transition-colors">Entrar</Link>
            <a href={asaasLink} target="_blank" rel="noopener noreferrer">
              <Button>7 dias grátis</Button>
            </a>
          </nav>
        </header>

        <main className="flex-1">
          {/* H1 / Hero Section */}
          <section className="py-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mb-6 leading-tight">
              App de finanças pessoais com IA: converse com sua grana e <span className="text-primary">controle seu futuro</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl mb-10 leading-relaxed">
              Economize tempo e dinheiro com o assistente financeiro que te ajuda a gastar melhor, poupar mais e aumentar seu patrimônio. <strong>Controle tudo pelo WhatsApp.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full justify-center">
              <a href={asaasLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-lg px-8 h-14 rounded-full font-bold shadow-[0_0_30px_-5px_rgba(0,255,136,0.4)]">
                  Quero começar agora – 7 dias grátis
                </Button>
              </a>
              <a href="#como-funciona" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full text-lg px-8 h-14 rounded-full font-bold">
                  Ver como funciona
                </Button>
              </a>
            </div>

            {/* Mockup WhatsApp + Dashboard */}
            <article className="w-full max-w-4xl bg-surface rounded-2xl border border-surface-light overflow-hidden shadow-2xl shadow-primary/10 flex flex-col md:flex-row" aria-label="Demonstração do aplicativo">
              {/* Fake WhatsApp Side */}
              <div className="md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-surface-light bg-surface-light/30 flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background">G</div>
                  <div className="text-left">
                    <p className="font-bold text-sm">Grana Smart IA</p>
                    <p className="text-xs text-text-secondary">Online</p>
                  </div>
                </div>
                <div className="bg-primary/20 text-text p-3 rounded-2xl rounded-tr-none self-end max-w-[85%] text-sm">
                  Gastei R$ 45 no mercado hoje mais cedo.
                </div>
                <div className="bg-surface border border-surface-light text-text-secondary p-3 rounded-2xl rounded-tl-none self-start max-w-[85%] text-sm flex flex-col gap-2">
                  <p>Pronto! Registrado: R$ 45,00 em 🛒 Alimentação.</p>
                  <p className="text-xs">Seu saldo atual para essa categoria é de R$ 320,00.</p>
                </div>
                {/* Supabase Webhook Comment here for WhatsApp integration */}
                {/* // Ao receber mensagem no webhook (Pluggy/Twilio), inserir no Supabase DB e retornar via IA. */}
              </div>
              {/* Fake Dashboard Side */}
              <div className="md:w-1/2 p-6 flex flex-col gap-4 justify-center">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Saldo Total</p>
                    <p className="text-3xl font-bold text-primary">R$ 14.520,00</p>
                  </div>
                  <BarChart2 className="text-primary opacity-50" size={32} />
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center bg-surface-light p-3 rounded-xl">
                    <span className="text-sm">🛒 Alimentação</span>
                    <span className="text-sm font-bold">-R$ 45,00</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-light p-3 rounded-xl">
                    <span className="text-sm">⚡ Conta de Luz</span>
                    <span className="text-sm font-bold">-R$ 120,00</span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          {/* H2 / Controle seus gastos pelo WhatsApp */}
          <section id="controle" className="py-24 px-6 bg-surface border-y border-surface-light">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Controle seus gastos pelo WhatsApp</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <article className="bg-background border border-surface-light p-8 rounded-2xl">
                  <Camera className="text-primary mb-4" size={32} aria-hidden="true" />
                  <h3 className="text-xl font-bold mb-3">Foto do recibo vira lançamento</h3>
                  <p className="text-text-secondary">Nosso aplicativo para controlar gastos analisa imagens. Mande a foto da nota fiscal e a IA extrai valores, data e categoria instantaneamente.</p>
                </article>
                <article className="bg-background border border-surface-light p-8 rounded-2xl">
                  <Mic className="text-primary mb-4" size={32} aria-hidden="true" />
                  <h3 className="text-xl font-bold mb-3">Áudio de gastos no dia a dia</h3>
                  <p className="text-text-secondary">Sem tempo para digitar? Envie um áudio: "Gastei 150 de gasolina". O assistente financeiro transcreve e organiza suas finanças pessoais na hora.</p>
                </article>
                <article className="bg-background border border-surface-light p-8 rounded-2xl">
                  <MessageCircle className="text-primary mb-4" size={32} aria-hidden="true" />
                  <h3 className="text-xl font-bold mb-3">Texto livre e natural</h3>
                  <p className="text-text-secondary">Chega de preencher formulários chatos. Escreva como se falasse com um amigo e a inteligência artificial para finanças cuida do resto.</p>
                </article>
              </div>
            </div>
          </section>

          {/* H2 / Inteligência Artificial */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Inteligência Artificial que organiza suas finanças</h2>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2 space-y-8">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
                    <Zap className="text-primary" size={24} aria-hidden="true" /> Categorização automática de despesas
                  </h3>
                  <p className="text-text-secondary">O Grana Smart aprende com seus hábitos de consumo. Suas compras são divididas em categorias precisas sem você levantar um dedo, criando um planejamento financeiro automático.</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
                    <Bell className="text-primary" size={24} aria-hidden="true" /> Alertas de orçamento em tempo real
                  </h3>
                  <p className="text-text-secondary">O orçamento doméstico estourou? Você recebe um aviso no WhatsApp antes de entrar no vermelho, ajudando no controle de gastos mensais e a sair das dívidas.</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-3 mb-2">
                    <BarChart2 className="text-primary" size={24} aria-hidden="true" /> Previsão de saldo e sugestões
                  </h3>
                  <p className="text-text-secondary">Descubra como economizar dinheiro com dicas proativas da IA baseadas no seu padrão, projetando seu saldo até o fim do mês.</p>
                </div>
              </div>
              <div className="md:w-1/2 bg-surface p-8 rounded-3xl border border-surface-light flex justify-center shadow-lg">
                <img src="/api/placeholder/400/400" alt="Gráfico circular mostrando categorias do aplicativo de finanças pessoais" className="rounded-xl w-full max-w-[400px] aspect-square object-cover opacity-80" loading="lazy" />
              </div>
            </div>
          </section>

          {/* H2 / Metas Financeiras */}
          <section className="py-24 px-6 bg-surface border-y border-surface-light">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Metas financeiras: realize seus sonhos</h2>
              <p className="text-center text-text-secondary max-w-2xl mx-auto mb-12">A melhor forma de economizar dinheiro é ter um propósito. Acompanhe a evolução do seu patrimônio visualmente.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <article className="bg-background border border-surface-light p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2"><Plane size={24} className="text-primary" /><h3 className="font-bold text-lg">Viagem de Férias</h3></div>
                    <span className="font-bold">48%</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2 mb-3"><div className="bg-primary h-2 rounded-full w-[48%]"></div></div>
                  <p className="text-sm text-text-secondary">R$ 2.400 / R$ 5.000</p>
                </article>

                <article className="bg-background border border-surface-light p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2"><Car size={24} className="text-info" /><h3 className="font-bold text-lg">Trocar o Carro</h3></div>
                    <span className="font-bold">53%</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2 mb-3"><div className="bg-info h-2 rounded-full w-[53%]"></div></div>
                  <p className="text-sm text-text-secondary">R$ 800 / R$ 1.500</p>
                </article>

                <article className="bg-background border border-surface-light p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2"><Shield size={24} className="text-warning" /><h3 className="font-bold text-lg">Reserva de Emergência</h3></div>
                    <span className="font-bold">53%</span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2 mb-3"><div className="bg-warning h-2 rounded-full w-[53%]"></div></div>
                  <p className="text-sm text-text-secondary">R$ 8.000 / R$ 15.000</p>
                </article>
              </div>
            </div>
          </section>

          {/* H2 / Como funciona o Grana Smart */}
          <section id="como-funciona" className="py-24 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Como funciona o Grana Smart</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center relative">
              <div className="hidden lg:block absolute top-10 left-[15%] right-[15%] h-0.5 bg-surface-light -z-10"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-surface border-4 border-background flex items-center justify-center text-primary mb-6 relative shadow-lg">
                  <UserPlus size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2">1. Crie sua conta</h3>
                <p className="text-sm text-text-secondary">Cadastre-se rapidamente com seu e-mail e ative os 7 dias grátis.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-surface border-4 border-background flex items-center justify-center text-primary mb-6 relative shadow-lg">
                  <Smartphone size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2">2. Conecte o WhatsApp</h3>
                <p className="text-sm text-text-secondary">Vincule seu número para começar a conversar com a inteligência artificial.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-surface border-4 border-background flex items-center justify-center text-primary mb-6 relative shadow-lg">
                  <Send size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2">3. Mande seus gastos</h3>
                <p className="text-sm text-text-secondary">Envie áudios, textos ou fotos das suas despesas pelo celular a qualquer hora.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-surface border-4 border-background flex items-center justify-center text-primary mb-6 relative shadow-lg">
                  <LayoutDashboard size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2">4. Veja a mágica</h3>
                <p className="text-sm text-text-secondary">Acesse o dashboard completo para visualizar a gestão de finanças resolvida.</p>
              </div>
            </div>
          </section>

          {/* H2 / Preços */}
          <section id="precos" className="py-24 px-6 bg-surface border-y border-surface-light">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Quanto custa o app de finanças Grana Smart</h2>
              <p className="text-text-secondary mb-12">Assuma o controle financeiro pessoal pelo preço de dois cafés no mês. Sem surpresas.</p>
              
              <article className="bg-background border border-primary/30 p-10 rounded-3xl relative shadow-[0_0_50px_-12px_rgba(0,255,136,0.15)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-background px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
                  Plano Único
                </div>
                <h3 className="sr-only">Assinatura Mensal Grana Smart</h3>
                <p className="text-6xl font-extrabold mb-2 mt-4 text-text">R$ 19,90<span className="text-lg text-text-secondary font-normal">/mês</span></p>
                <p className="text-text-secondary mb-8">Tudo incluso. 7 dias grátis, cancele quando quiser.</p>
                
                <ul className="text-left space-y-5 mb-10 text-lg">
                  {[
                    'Controle total pelo WhatsApp ilimitado', 
                    'Inteligência Artificial de categorização', 
                    'Dashboard financeiro completo web/mobile', 
                    'Criação de Metas Financeiras',
                    'Alertas anti-dívidas proativos',
                    'Suporte humano prioritário'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="text-primary shrink-0" size={24} />
                      <span className="font-medium text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <a href={asaasLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button className="w-full h-16 text-xl rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    Assinar agora por R$ 19,90
                  </Button>
                </a>
              </article>
            </div>
          </section>

          {/* H2 / FAQ com Schema */}
          <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Perguntas frequentes</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <details key={index} className="group bg-surface border border-surface-light rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg hover:text-primary transition-colors">
                    {faq.q}
                    <ChevronDown className="transition-transform group-open:rotate-180 text-text-secondary" size={20} />
                  </summary>
                  <div className="px-6 pb-6 text-text-secondary text-base leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* CTA Final */}
          <section className="py-24 px-6 bg-primary/10 border-t border-primary/20 text-center relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[100px] rounded-full -z-10"></div>
            
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 max-w-3xl mx-auto">Comece a tomar o controle da sua grana hoje</h2>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de brasileiros que transformaram a planilha de gastos em uma conversa inteligente.
            </p>
            <div className="inline-block relative">
              <div className="absolute -top-4 -right-6 bg-warning text-background text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12 z-10">
                7 DIAS GRÁTIS
              </div>
              <a href={asaasLink} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-full shadow-[0_0_40px_-10px_rgba(0,255,136,0.5)]">
                  Criar conta grátis agora
                </Button>
              </a>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="bg-background py-16 px-6 border-t border-surface-light">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background font-bold" aria-hidden="true">G</div>
                <span className="font-bold text-xl">Grana Smart</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                O app de finanças pessoais que simplifica o controle financeiro, te ajuda a economizar dinheiro e a alcançar suas metas através do WhatsApp.
              </p>
            </div>
            
            <div className="flex gap-12">
              <div className="flex flex-col gap-3 text-sm">
                <span className="font-bold text-text mb-2">Produto</span>
                <Link href="#como-funciona" className="text-text-secondary hover:text-primary transition-colors">Como funciona</Link>
                <Link href="#precos" className="text-text-secondary hover:text-primary transition-colors">Preços</Link>
                <Link href="#faq" className="text-text-secondary hover:text-primary transition-colors">Perguntas Frequentes</Link>
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <span className="font-bold text-text mb-2">Legal</span>
                <Link href="/termos-de-uso" className="text-text-secondary hover:text-primary transition-colors">Termos de Uso</Link>
                <Link href="/politica-de-privacidade" className="text-text-secondary hover:text-primary transition-colors">Privacidade</Link>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto pt-8 border-t border-surface-light flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-text-secondary">
              © {new Date().getFullYear()} Grana Smart. Feito com ❤️ no Brasil.
            </div>
            <div className="text-xs text-text-secondary/70 flex items-center gap-2">
              <span>Ambiente Open Finance Regulamentado Banco Central do Brasil</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Camera, Mic, MessageCircle, BarChart2, Bell, Zap, 
  Plane, Car, Shield, CheckCircle, Smartphone, UserPlus, 
  Send, LayoutDashboard, ChevronDown, Lock, ShieldCheck, Check
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

      <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-text font-sans overflow-x-hidden selection:bg-primary selection:text-black">
        
        {/* 1. NAV */}
        <header className="sticky top-0 z-50 flex items-center justify-between p-4 md:px-8 max-w-7xl w-full mx-auto bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-black font-extrabold text-lg" aria-hidden="true">G</div>
            <span className="font-bold text-xl tracking-tight">Grana Smart</span>
          </div>
          <nav aria-label="Navegação principal" className="hidden md:flex gap-8 items-center text-sm font-medium">
            <a href="#funcionalidades" className="text-text-secondary hover:text-white transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="text-text-secondary hover:text-white transition-colors">Como funciona</a>
            <a href="#seguranca" className="text-text-secondary hover:text-white transition-colors">Segurança</a>
            <a href="#faq" className="text-text-secondary hover:text-white transition-colors">FAQ</a>
            {/* Supabase Auth integration comment: */}
            {/* <Link href="/login"> -> Vai para o fluxo do Supabase Auth */}
            <Link href="/login" className="text-text-secondary hover:text-white transition-colors ml-4">Entrar</Link>
            <a href={asaasLink} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="font-bold tracking-wide rounded-full px-5">Começar grátis</Button>
            </a>
          </nav>
        </header>

        <main className="flex-1">
          {/* 2. HERO */}
          <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
            
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Turma fundadora — 7 dias grátis
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6 leading-[1.1]">
              Sua vida financeira organizada <br className="hidden md:block" />começa numa <span className="text-primary italic">conversa.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mb-12 leading-relaxed">
              Um agente de IA no seu WhatsApp cuida dos seus gastos, metas e orçamento. 
              Você só manda mensagem — foto, áudio ou texto. E ele faz o trabalho chato.
            </p>
            
            <a href={asaasLink} target="_blank" rel="noopener noreferrer" className="relative group mb-20 z-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-[#00CC6A] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
              <Button size="lg" className="relative h-14 px-10 text-lg font-bold rounded-full bg-primary text-black hover:bg-primary-dark transition-all">
                Começar 7 dias grátis agora
              </Button>
            </a>

            {/* Mockup WhatsApp Hero */}
            <div className="w-full max-w-md mx-auto bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] p-2 shadow-2xl relative z-10">
              <div className="bg-[#0A0A0A] rounded-[2.25rem] overflow-hidden border border-white/5 h-[400px] flex flex-col relative">
                {/* iPhone Notch */}
                <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20">
                  <div className="w-32 h-6 bg-[#1A1A1A] rounded-b-3xl"></div>
                </div>
                
                {/* Chat Header */}
                <div className="bg-[#1A1A1A] pt-10 pb-3 px-4 flex items-center gap-3 border-b border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold">G</div>
                  <div>
                    <p className="font-bold text-sm leading-tight text-white">Grana Smart IA</p>
                    <p className="text-xs text-primary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Online
                    </p>
                  </div>
                </div>
                
                {/* Chat Body */}
                <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative bg-[#0A0A0A]">
                  <div className="bg-[#075E54]/30 text-white p-3 rounded-2xl rounded-tr-none self-end max-w-[80%] text-sm border border-[#075E54]/50 backdrop-blur-sm">
                    Mano, gastei R$ 120 de gasolina hoje e R$ 45 de ifood.
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/10 text-white/90 p-3 rounded-2xl rounded-tl-none self-start max-w-[85%] text-sm shadow-lg">
                    <p className="font-bold text-primary mb-1">Tudo anotado! ✍️</p>
                    <p>🚗 Transporte: -R$ 120,00</p>
                    <p>🍔 Alimentação: -R$ 45,00</p>
                    <div className="mt-2 text-xs text-text-secondary border-t border-white/10 pt-2">
                      Saldo livre no mês: R$ 850,00
                    </div>
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="bg-[#1A1A1A] p-3 flex items-center gap-2 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Camera size={16} className="text-white/50" /></div>
                  <div className="flex-1 h-9 bg-white/5 rounded-full border border-white/10 px-3 flex items-center">
                    <span className="text-white/30 text-xs">Mensagem...</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><Mic size={16} className="text-black" /></div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. SELOS DE CONFIANÇA */}
          <section id="seguranca" className="py-10 border-y border-white/5 bg-[#0D0D0D]">
            <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 text-sm font-medium">
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-primary" /> Homologado pela Meta</div>
              <div className="flex items-center gap-2"><Lock size={18} className="text-primary" /> Open Finance (em breve)</div>
              <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-primary" /> Conta Verificada no WhatsApp</div>
              <div className="flex items-center gap-2"><Shield size={18} className="text-primary" /> Acesso leitura • LGPD</div>
            </div>
          </section>

          {/* 4. PROBLEMA */}
          <section className="py-24 px-6 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Vive esquecendo onde foi parar o dinheiro? <br className="hidden md:block" />
              <span className="text-text-secondary">Mande uma mensagem ou áudio e deixe tudo organizado.</span>
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Planilhas são chatas, anotar em caderninho não funciona e abrir app de banco toda hora cansa. 
              Você só precisa do WhatsApp que você já usa todo dia.
            </p>
          </section>

          {/* 5. PERSONA DO AGENTE + DASHBOARD */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="bg-[#121212] rounded-3xl border border-white/10 p-8 md:p-12 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="lg:w-1/2 z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Pare de tentar organizar tudo sozinho. <br/>
                  Conheça o Grana, seu assessor financeiro com IA.
                </h2>
                <p className="text-text-secondary text-lg mb-8">
                  Ele tira dúvidas sobre seu saldo, alerta quando o orçamento da semana apertar e consolida seus números em um painel lindo.
                </p>
                <ul className="space-y-4">
                  {['Lê fotos de notas fiscais e comprovantes', 'Entende áudios longos perfeitamente', 'Te manda um resumo diário ou semanal'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/90">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check size={14} className="text-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:w-1/2 w-full z-10">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <p className="font-medium text-white/70">Visão Geral</p>
                    <p className="text-xs bg-white/10 px-2 py-1 rounded">Outubro</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                      <p className="text-xs text-white/50 mb-1">Entradas</p>
                      <p className="text-xl font-bold text-primary">R$ 8.240</p>
                    </div>
                    <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                      <p className="text-xs text-white/50 mb-1">Saídas</p>
                      <p className="text-xl font-bold text-red-400">R$ 3.930</p>
                    </div>
                  </div>
                  <div className="bg-[#1A1A1A] p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Meta: Viagem</span>
                      <span className="text-primary">48%</span>
                    </div>
                    <div className="w-full bg-black rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full w-[48%]"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 6. TIMELINE */}
          <section className="py-24 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">Um dia normal</h2>
              <h3 className="text-3xl font-bold">Só que alguém cuidou de tudo por você.</h3>
            </div>
            
            <div className="relative border-l border-white/10 ml-4 md:ml-12 space-y-12 pb-8">
              {[
                { time: "07:12", icon: Mic, color: "text-blue-400", bg: "bg-blue-400/10", title: "Áudio: \"gastei 12 reais no café\"", desc: "A IA transcreve, identifica o valor e lança na categoria Alimentação automaticamente." },
                { time: "12:30", icon: Camera, color: "text-purple-400", bg: "bg-purple-400/10", title: "Foto do cupom fiscal do almoço", desc: "Apenas mandou a foto. O Grana leu o CNPJ, o total de R$ 68,90 e registrou tudo." },
                { time: "18:05", icon: Zap, color: "text-primary", bg: "bg-primary/10", title: "O salário caiu na conta", desc: "Alerta no Zap: 'Opa, entraram R$ 5.000! Que tal guardar R$ 500 na meta da Viagem?'" },
                { time: "21:00", icon: BarChart2, color: "text-orange-400", bg: "bg-orange-400/10", title: "Resumo do dia", desc: "Você recebe um mini-relatório pra fechar o dia com a cabeça tranquila." }
              ].map((item, i) => (
                <div key={i} className="relative pl-10 md:pl-16">
                  <div className="absolute -left-[21px] top-1 w-10 h-10 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center">
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div className="text-sm font-mono text-white/50 mb-1">{item.time}</div>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <p className="text-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 7. NUVEM DE EXEMPLOS */}
          <section id="funcionalidades" className="py-24 px-6 bg-[#121212] border-y border-white/5 overflow-hidden">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 max-w-2xl mx-auto">
                Se você sabe mandar mensagem no WhatsApp, <span className="text-primary">já sabe usar o Grana Smart.</span>
              </h2>
              
              <div className="relative h-[400px] w-full flex items-center justify-center">
                {/* Simulated floating chat bubbles */}
                <div className="absolute top-10 left-0 md:left-[10%] bg-[#075E54]/40 border border-[#075E54] p-3 rounded-2xl rounded-bl-none text-sm shadow-xl rotate-[-5deg] animate-pulse">
                  🎤 Áudio: 0:15
                </div>
                <div className="absolute top-[40%] right-0 md:right-[5%] bg-[#1A1A1A] border border-white/10 p-3 rounded-2xl rounded-br-none text-sm shadow-xl rotate-[3deg]">
                  Comprei um tênis na Nike por 350
                </div>
                <div className="absolute bottom-10 left-[10%] md:left-[20%] bg-[#075E54]/40 border border-[#075E54] p-3 rounded-2xl rounded-bl-none text-sm shadow-xl rotate-[2deg]">
                  📷 [Foto do Cupom do Mercado]
                </div>
                <div className="absolute bottom-[30%] right-[15%] md:right-[25%] bg-[#1A1A1A] border border-primary/30 p-3 rounded-2xl rounded-br-none text-sm shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                  <span className="text-primary font-bold">Grana:</span> Tudo registrado! ✅
                </div>
                
                <div className="z-10 w-48 h-48 rounded-full bg-gradient-to-br from-primary to-[#006633] flex items-center justify-center shadow-[0_0_80px_rgba(0,255,136,0.3)]">
                  <MessageCircle size={64} className="text-black" />
                </div>
              </div>
            </div>
          </section>

          {/* 8. OPEN FINANCE */}
          <section className="py-24 px-6 max-w-7xl mx-auto text-center">
            <div className="inline-block bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 text-white/70">
              ⚡ Em Breve — Entre na lista de espera
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 max-w-3xl mx-auto">
              Saiba exatamente para onde vai seu dinheiro sem somar faturas manualmente.
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12">
              Conexão Open Finance via Banco Central. Seus cartões e contas sincronizados 
              com segurança de nível bancário. Leitura automática.
            </p>
            <div className="flex flex-wrap justify-center gap-6 opacity-50 grayscale">
              {/* Fake bank logos with text */}
              {['Nubank', 'Itaú', 'Bradesco', 'Santander', 'Banco do Brasil', 'Inter'].map(b => (
                <div key={b} className="bg-white/5 px-6 py-3 rounded-xl border border-white/10 font-bold tracking-tight">
                  {b}
                </div>
              ))}
            </div>
          </section>

          {/* 9. PAINEL IA */}
          <section className="py-24 px-6 bg-[#0D0D0D] border-y border-white/5">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Quer ver só os números que importam? <br/>
                  <span className="text-text-secondary">Peça pro Grana e ele monta seu painel.</span>
                </h2>
                <p className="text-text-secondary mb-8 text-lg">
                  Além do WhatsApp, você tem acesso a um Web App completo. Visualize gráficos, exporte planilhas (se quiser) e acompanhe seu fluxo de caixa mensal sem enrolação.
                </p>
              </div>
              <div className="md:w-1/2 w-full">
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl">
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-[10px] text-white/50 uppercase">Entradas</p>
                      <p className="text-sm font-bold text-primary">R$ 18.240</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-[10px] text-white/50 uppercase">Saídas</p>
                      <p className="text-sm font-bold text-red-400">R$ 13.930</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg text-center">
                      <p className="text-[10px] text-white/50 uppercase">Saldo</p>
                      <p className="text-sm font-bold text-white">R$ 4.310</p>
                    </div>
                  </div>
                  <div className="h-40 flex items-center justify-center border border-white/5 bg-white/[0.02] rounded-xl border-dashed">
                    {/* Placeholder gráfico Donut */}
                    <div className="w-24 h-24 rounded-full border-[8px] border-primary/20 border-t-primary border-r-blue-500 border-l-warning flex items-center justify-center">
                      <span className="text-xs text-white/50">Gráfico</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 10. METAS */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Metas que saem do papel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { i: "✈️", n: "Viagem pra Europa", p: "48%", v: "R$ 2.400 / R$ 5.000", c: "bg-primary" },
                { i: "🚗", n: "Manutenção do Carro", p: "25%", v: "R$ 800 / R$ 3.200", c: "bg-blue-400" },
                { i: "🛡️", n: "Reserva de Emergência", p: "80%", v: "R$ 8.000 / R$ 10.000", c: "bg-orange-400" }
              ].map((m, i) => (
                <div key={i} className="bg-[#121212] border border-white/10 p-6 rounded-2xl hover:border-white/20 transition-colors">
                  <div className="text-4xl mb-4">{m.i}</div>
                  <h3 className="font-bold text-lg mb-4">{m.n}</h3>
                  <div className="flex justify-between text-sm mb-2 text-white/70">
                    <span>{m.v}</span>
                    <span className="font-bold text-white">{m.p}</span>
                  </div>
                  <div className="w-full bg-black rounded-full h-2">
                    <div className={`${m.c} h-2 rounded-full`} style={{ width: m.p }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 11. TEASER MEI */}
          <section className="py-8 px-6 bg-primary/10 border-y border-primary/20 text-center">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
              <span className="bg-primary text-black font-bold text-xs px-2 py-1 rounded uppercase tracking-wider">Novo</span>
              <p className="font-medium">
                É MEI? Em breve: DAS automático, nota fiscal e separação PF/PJ. 
                <a href="#" className="text-primary ml-2 hover:underline">Entre na lista de espera do plano CNPJ &rarr;</a>
              </p>
            </div>
          </section>

          {/* 12. PREÇO */}
          <section id="precos" className="py-24 px-6 max-w-lg mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Seu assessor financeiro completo</h2>
              <p className="text-text-secondary">Simplifique sua vida hoje.</p>
            </div>
            
            <div className="bg-[#121212] border border-primary/40 rounded-3xl p-8 relative shadow-[0_0_50px_-15px_rgba(0,255,136,0.2)]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-text-secondary line-through text-sm">de R$ 29,90</p>
                  <p className="text-5xl font-extrabold text-white mt-1">R$ 19,90<span className="text-lg text-white/50 font-normal">/mês</span></p>
                </div>
                <div className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  7 dias grátis
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {[
                  'WhatsApp ilimitado com IA', 
                  'Lê fotos de cupons e áudios', 
                  'Dashboard financeiro web completo', 
                  'Criação de Metas Financeiras',
                  'Alertas de orçamento no Zap',
                  'Suporte VIP via e-mail'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check size={20} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
              
              <a href={asaasLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button className="w-full h-14 text-lg rounded-xl font-bold bg-primary text-black hover:bg-primary-dark">
                  Assinar agora
                </Button>
              </a>
              <p className="text-center text-xs text-white/40 mt-4">Cancele quando quiser, a um clique.</p>
            </div>
          </section>

          {/* 13. PROVA SOCIAL */}
          <section className="py-24 px-6 bg-[#0A0A0A] border-t border-white/5">
            <h2 className="text-3xl font-bold text-center mb-16">Gente que você conhece já organiza a grana com o Grana.</h2>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Lucas M.", role: "Desenvolvedor", text: "Eu odeio planilhas. O Grana Smart foi a única coisa que me fez anotar os gastos pq é só mandar um áudio no trânsito e pronto." },
                { name: "Mariana S.", role: "Freelancer", text: "A IA entende até quando eu mando foto de recibo amassado do almoço! Mudou meu controle financeiro completamente." },
                { name: "Roberto T.", role: "Empreendedor", text: "Receber o resumo no fim do dia pelo Zap é bizarro de bom. Sinto que finalmente tenho controle da minha vida financeira." }
              ].map((dep, i) => (
                <div key={i} className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                  <div className="flex text-primary mb-4">{'★'.repeat(5)}</div>
                  <p className="text-white/80 mb-6 text-sm leading-relaxed">"{dep.text}"</p>
                  <div>
                    <p className="font-bold">{dep.name}</p>
                    <p className="text-xs text-text-secondary">{dep.role} • Beta Tester</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 14. FAQ GIGANTE */}
          <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Perguntas frequentes</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details key={index} className="group bg-[#121212] border border-white/5 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-medium hover:bg-white/[0.02] transition-colors">
                    {faq.q}
                    <ChevronDown className="transition-transform group-open:rotate-180 text-white/50 shrink-0" size={20} />
                  </summary>
                  <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </main>

        {/* 15. FOOTER */}
        <footer className="bg-[#0A0A0A] py-16 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-black font-bold text-xs" aria-hidden="true">G</div>
                <span className="font-bold text-lg">Grana Smart</span>
              </div>
              <p className="text-sm text-text-secondary mb-6">
                Seu assessor financeiro com IA pelo WhatsApp. Instale como app no seu celular (PWA) e tenha o painel na tela inicial.
              </p>
              <a href={asaasLink} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-white/10 text-white hover:bg-white/20 border-0">Instalar App (PWA)</Button>
              </a>
            </div>
            
            <div className="flex flex-wrap gap-12 md:gap-24">
              <div className="flex flex-col gap-3 text-sm">
                <span className="font-bold text-white mb-2">Plataforma</span>
                <Link href="/login" className="text-white/50 hover:text-primary transition-colors">Entrar</Link>
                <Link href="#precos" className="text-white/50 hover:text-primary transition-colors">Preços</Link>
                <Link href="#funcionalidades" className="text-white/50 hover:text-primary transition-colors">Funcionalidades</Link>
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <span className="font-bold text-white mb-2">Legal</span>
                <Link href="/termos-de-uso" className="text-white/50 hover:text-primary transition-colors">Termos de Uso</Link>
                <Link href="/politica-de-privacidade" className="text-white/50 hover:text-primary transition-colors">Privacidade</Link>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <div>© {new Date().getFullYear()} Grana Smart. Todos os direitos reservados.</div>
            <div className="flex items-center gap-1">Feito no Brasil 🇧🇷</div>
          </div>
        </footer>
      </div>
    </>
  );
}

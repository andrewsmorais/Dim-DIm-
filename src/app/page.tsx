"use client";

import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CTAButton } from "@/components/CTAButton";
import { FAQItem } from "@/components/FAQItem";
import { SectionBadge } from "@/components/SectionBadge";
import { 
  CalendarDays, StickyNote, Calculator, 
  CheckCircle2, Lock
} from "lucide-react";

export default function LandingPage() {
  
  // Intersection Observer for fade-in animations on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <Header />

      <main>
        {/* 2. HERO SECTION (Dark) */}
        <section className="relative pt-32 pb-24 px-6 bg-background-dark text-white overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
            <div className="lg:w-1/2 flex flex-col items-start fade-in-section">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Turma fundadora — 7 dias grátis
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Cuidar das contas dava trabalho. <br className="hidden md:block"/>
                <span className="text-primary italic">Agora é automático</span>
              </h1>
              
              <p className="text-lg md:text-xl text-text-secondaryDark mb-10 leading-relaxed max-w-xl">
                O Grana Smart importa, categoriza e fica de olho por você. Te avisa no WhatsApp a fatura que vai vencer, a assinatura que subiu e o saldo que não cobre o débito.
              </p>
              
              <CTAButton text="Testar 7 dias grátis →" size="lg" className="h-16 px-10 text-lg w-full sm:w-auto" />
              <p className="text-sm text-text-secondaryDark mt-4">Sem precisar cadastrar cartão de crédito</p>
            </div>

            <div className="lg:w-1/2 w-full relative h-[600px] fade-in-section">
              {/* Fake Phone Mockup */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[650px] bg-black border-[8px] border-[#2A2A2A] rounded-[3rem] shadow-2xl animate-float z-10 flex flex-col overflow-hidden">
                 <div className="w-32 h-6 bg-[#2A2A2A] absolute top-0 left-1/2 -translate-x-1/2 rounded-b-3xl z-20"></div>
                 {/* WhatsApp BG */}
                 <div className="flex-1 bg-[#0A0A0A] p-4 flex flex-col gap-4 pt-16">
                    {/* Floating Notifications */}
                    <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-2xl shadow-lg relative -left-8 w-[110%]">
                      <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-white text-[10px]">W</div><span className="text-xs text-white/50">Grana Smart - agora</span></div>
                      <p className="text-sm text-white">Sua fatura do Itaú vence amanhã: <span className="font-bold text-red-400">R$ 1.247,90</span></p>
                    </div>

                    <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-2xl shadow-lg relative left-4 w-[100%]">
                      <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-white text-[10px]">W</div><span className="text-xs text-white/50">Grana Smart - há 12 min</span></div>
                      <p className="text-sm text-white">Sua assinatura da Netflix subiu para <span className="font-bold text-yellow-400">R$ 59,90</span></p>
                    </div>

                    <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-2xl shadow-lg relative -left-4 w-[105%]">
                      <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-white text-[10px]">W</div><span className="text-xs text-white/50">Grana Smart - há 1h</span></div>
                      <p className="text-sm text-white">Seu saldo no Nubank ficou negativo: <span className="font-bold text-red-400">-R$ 120,00</span></p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SEÇÃO "QUEM FAZ" (Light) */}
        <section className="py-24 px-6 bg-white text-black">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 fade-in-section">
            <div className="lg:w-1/2">
              <SectionBadge text="✓ QUEM FAZ" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                O Grana Smart é feito pela <span className="text-primary-dark">Grana Capital</span>
              </h2>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                No mercado desde 2019, Grana Capital cuida do Imposto de Renda de quem investe. Agora, traz essa experiência para o seu dia a dia: o Grana Smart organiza suas contas sem nunca movimentar o seu dinheiro.
              </p>
              <div className="flex flex-wrap gap-4 text-sm font-bold">
                <span className="bg-background px-4 py-2 rounded-full">Indicada pela B3</span>
                <span className="bg-background px-4 py-2 rounded-full">Prêmio Reclame Aqui 2025</span>
                <span className="bg-background px-4 py-2 rounded-full">+400 mil downloads</span>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
              <div className="bg-background p-8 rounded-3xl flex items-center justify-center font-extrabold text-2xl h-32">
                grana
              </div>
              <div className="bg-background p-8 rounded-3xl flex items-center justify-center font-bold text-xl h-32">
                Open Finance
              </div>
              <div className="bg-background p-8 rounded-3xl flex items-center justify-center font-bold text-lg text-center h-32">
                Banco Central<br/>do Brasil
              </div>
              <div className="bg-background p-8 rounded-3xl flex flex-col items-center justify-center h-32 text-text-secondary">
                <Lock size={24} className="mb-2" />
                <span className="font-bold text-black">Só leitura</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SEÇÃO "SOLUÇÃO" (Light/Gray) */}
        <section id="funcionalidades" className="py-24 px-6 bg-background text-black">
          <div className="max-w-7xl mx-auto fade-in-section">
            <SectionBadge text="✓ SOLUÇÃO" />
            <h2 className="text-4xl md:text-5xl font-bold mb-16 max-w-2xl">
              Se organizar não devia ser mais um trabalho
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-primary/20 text-primary-dark rounded-2xl flex items-center justify-center mb-8">
                  <CalendarDays size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Você não precisa lembrar de cada vencimento</h3>
                <p className="text-text-secondary leading-relaxed">Fatura, boleto, assinatura. Basta esquecer um para pagar juros.</p>
              </div>
              
              <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-primary/20 text-primary-dark rounded-2xl flex items-center justify-center mb-8">
                  <StickyNote size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Você não precisa anotar cada gasto</h3>
                <p className="text-text-secondary leading-relaxed">Isso só funciona no primeiro dia. Depois, o mês fica em aberto, e ninguém volta a anotar.</p>
              </div>
              
              <div className="bg-white p-10 rounded-[2rem] shadow-sm hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-primary/20 text-primary-dark rounded-2xl flex items-center justify-center mb-8">
                  <Calculator size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Você não precisa conferir tudo na mão</h3>
                <p className="text-text-secondary leading-relaxed">Abrir cada app, somar, comparar com o mês passado. Quando sobra tempo, o mês já acabou.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SEÇÃO "AUTOMAÇÃO" (Light/White) */}
        <section className="py-24 px-6 bg-white text-black overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 fade-in-section">
            <div className="lg:w-1/2">
              <SectionBadge text="✓ AUTOMAÇÃO" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                O trabalho manual acaba aqui. <br/>
                <span className="text-primary-dark">O Grana Smart faz</span>
              </h2>
              <p className="text-lg text-text-secondary mb-10 leading-relaxed">
                Ele acompanha suas contas todo dia e avisa no WhatsApp do que precisa de você: fatura vencendo, assinatura que subiu de preço, saldo que não cobre o débito. Você só decide.
              </p>
              <CTAButton text="Testar 7 dias grátis →" />
            </div>
            
            <div className="lg:w-1/2 w-full relative h-[500px]">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full max-w-[400px] h-[500px] bg-background-dark rounded-[3rem] shadow-2xl overflow-hidden p-6 text-white border-[8px] border-[#2A2A2A]">
                <div className="w-32 h-6 bg-[#2A2A2A] absolute top-0 left-1/2 -translate-x-1/2 rounded-b-3xl"></div>
                <div className="pt-10">
                  <p className="text-sm text-white/50 uppercase tracking-widest mb-2">Saldo Geral</p>
                  <p className="text-4xl font-bold text-white mb-8">R$ 4.280,50</p>
                  
                  <div className="space-y-4">
                    <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 bg-primary/20 rounded-xl"></div><span className="font-bold">Nubank</span></div>
                      <span>R$ 1.250,00</span>
                    </div>
                    <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-500/20 rounded-xl"></div><span className="font-bold">Itaú</span></div>
                      <span>R$ 3.030,50</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-[60%] right-[60%] bg-white p-4 rounded-2xl shadow-xl border border-black/5 animate-float flex gap-3 w-64 z-20">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center shrink-0">🔔</div>
                <div>
                  <p className="font-bold text-sm">Aviso Importante</p>
                  <p className="text-xs text-text-secondary mt-1">Sua fatura vence amanhã!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SEÇÃO "DADOS" (Light/Gray) */}
        <section className="py-24 px-6 bg-background text-black">
          <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16 fade-in-section">
            <div className="lg:w-1/2 w-full flex justify-center items-center py-10">
              <div className="relative w-[350px] h-[350px]">
                {/* Central Logo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary-dark rounded-3xl flex items-center justify-center text-white font-bold text-xl shadow-2xl z-20">
                  G
                </div>
                {/* Connecting lines & nodes */}
                <svg className="absolute inset-0 w-full h-full text-black/10" viewBox="0 0 350 350">
                  <circle cx="175" cy="175" r="120" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-spin-slow" style={{ animationDuration: '30s' }}/>
                  <line x1="175" y1="175" x2="175" y2="55" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="280" y2="115" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="280" y2="235" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="175" y2="295" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="70" y2="235" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="70" y2="115" stroke="currentColor" strokeWidth="2" />
                </svg>
                {/* Bank Nodes */}
                <div className="absolute top-[35px] left-[155px] w-10 h-10 bg-purple-600 rounded-full border-4 border-background shadow-lg"></div>
                <div className="absolute top-[95px] left-[260px] w-10 h-10 bg-orange-500 rounded-full border-4 border-background shadow-lg"></div>
                <div className="absolute top-[215px] left-[260px] w-10 h-10 bg-red-600 rounded-full border-4 border-background shadow-lg"></div>
                <div className="absolute top-[275px] left-[155px] w-10 h-10 bg-yellow-400 rounded-full border-4 border-background shadow-lg"></div>
                <div className="absolute top-[215px] left-[50px] w-10 h-10 bg-blue-600 rounded-full border-4 border-background shadow-lg"></div>
                <div className="absolute top-[95px] left-[50px] w-10 h-10 bg-green-500 rounded-full border-4 border-background shadow-lg"></div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <SectionBadge text="✓ DADOS" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Para automatizar, o dado tem que estar <span className="text-primary-dark">certo</span>
              </h2>
              <p className="text-lg text-text-secondary mb-8 leading-relaxed">
                Por isso o Grana Smart começa pelos dados: recebe o extrato bruto de cada banco e entrega só o que você precisa ver. Sem atraso, sem duplicação, sem precisar digitar na mão.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'Sem duplicar',
                  'IA que categoriza e se aperfeiçoa a cada transação',
                  'Nomes que você reconhece, não códigos',
                  'Todo dia, todas as contas'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <CheckCircle2 size={24} className="text-primary-dark shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <CTAButton text="Testar 7 dias grátis →" />
            </div>
          </div>
        </section>

        {/* 7. SEÇÃO "CONVERSA" (Dark) */}
        <section className="py-32 px-6 bg-background-dark text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 fade-in-section">
            <div className="lg:w-1/2">
              <SectionBadge text="✓ CONVERSA" dark />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                E o que você quiser saber, é <span className="text-primary italic">só perguntar</span>
              </h2>
              <p className="text-lg text-text-secondaryDark mb-8 leading-relaxed">
                Com tudo importado e categorizado, o WhatsApp vira o lugar onde o Grana Smart avisa e responde: cobrança estranha, resumo da semana, quanto foi de delivery.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'Cobrança estranha? Alerta na hora',
                  'Resumo da semana, sem abrir app',
                  'Pergunte. "Quanto gastei com delivery?"'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg">
                    <CheckCircle2 size={24} className="text-primary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <CTAButton text="Testar 7 dias grátis →" />
            </div>

            <div className="lg:w-1/2 w-full relative">
              <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden relative">
                {/* Simulated Image Background */}
                <div className="absolute inset-0 bg-[#1A1A1A] bg-[url('https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>
                
                {/* Floating Chat Bubble */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#1A1A1A] border border-white/10 p-5 rounded-3xl shadow-2xl animate-float">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white">W</div>
                    <span className="font-bold text-sm text-white">Grana Smart - agora</span>
                  </div>
                  <p className="text-white text-[15px] leading-relaxed">
                    Você gastou R$ 312 em delivery este mês. Ainda está abaixo do orçamento: sobram R$ 88 para usar. 🍔
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. SEÇÃO "DEPOIMENTOS" (Dark) */}
        <section className="py-24 px-6 bg-[#0F0F0F] text-white border-t border-white/5">
          <div className="max-w-7xl mx-auto fade-in-section">
            <div className="text-center mb-16">
              <SectionBadge text="✓ DEPOIMENTOS" dark />
              <h2 className="text-4xl md:text-5xl font-bold">
                Quem veio de outro app <span className="text-primary italic">conta</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { text: "Talvez vocês estejam salvando vidas. Parabéns pelo trabalho!", author: "Thamires M." },
                { text: "Já acordei com a mensagem do Grana Smart alertando para pagamento futuro. Difícil expressar o nível de satisfação", author: "Miguel" },
                { text: "Sem limite de conta e cartão. Esse foi o diferencial.", author: "Claudio R." }
              ].map((dep, i) => (
                <div key={i} className="bg-[#1A1A1A] border border-white/5 p-10 rounded-[2rem] flex flex-col justify-between">
                  <p className="text-lg leading-relaxed text-white/90 font-medium mb-8">"{dep.text}"</p>
                  <p className="text-text-secondaryDark font-bold">— {dep.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. SEÇÃO "INÍCIO" (Light) */}
        <section id="como-funciona" className="py-32 px-6 bg-white text-black text-center">
          <div className="max-w-6xl mx-auto fade-in-section">
            <SectionBadge text="✓ INÍCIO" />
            <h2 className="text-4xl md:text-5xl font-bold mb-20">
              Como organizar suas finanças em <span className="text-primary-dark">3 passos</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-background rounded-[2rem] p-8 flex flex-col items-center">
                <div className="h-32 flex items-center justify-center mb-6">
                  <div className="bg-white px-6 py-3 rounded-full shadow-sm font-mono font-bold text-lg border border-black/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center">W</div>
                    +55 11 9 8765-4321
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-primary-dark">Passo 1</h3>
                <p className="text-text-secondary">Cadastro rápido com seu WhatsApp.</p>
              </div>

              <div className="bg-background rounded-[2rem] p-8 flex flex-col items-center">
                <div className="h-32 flex items-center justify-center mb-6 relative w-full">
                   <div className="w-12 h-12 bg-black rounded-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-primary font-bold">G</div>
                   <div className="w-full flex justify-between absolute top-1/2 -translate-y-1/2 px-4">
                     <div className="w-8 h-8 rounded-full bg-purple-600"></div>
                     <div className="w-8 h-8 rounded-full bg-orange-500"></div>
                   </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-primary-dark">Passo 2</h3>
                <p className="text-text-secondary">Conecte seus bancos de forma segura pelo Open Finance.</p>
              </div>

              <div className="bg-background rounded-[2rem] p-8 flex flex-col items-center">
                <div className="h-32 flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-primary-dark">Passo 3</h3>
                <p className="text-text-secondary">Pronto! Dados importados e categorizados, sem você digitar nada.</p>
              </div>
            </div>
            
            <CTAButton text="Testar 7 dias grátis →" size="lg" className="h-14 px-12 text-lg" />
          </div>
        </section>

        {/* 10. SEÇÃO "PLANOS" (Light/Gray) */}
        <section id="planos" className="py-24 px-6 bg-background text-black text-center">
          <div className="max-w-7xl mx-auto fade-in-section">
            <SectionBadge text="✓ PLANOS" />
            <h2 className="text-4xl md:text-5xl font-bold mb-10">
              Um plano, <span className="text-primary-dark">tudo incluso</span>
            </h2>
            
            <div className="flex justify-center mb-12">
              <div className="bg-white p-1 rounded-full inline-flex border border-black/5 shadow-sm">
                <button className="px-6 py-2 rounded-full font-bold bg-primary/20 text-primary-dark">Anual</button>
                <button className="px-6 py-2 rounded-full font-medium text-text-secondary">Mensal</button>
              </div>
            </div>

            <div className="max-w-md mx-auto bg-white rounded-[2rem] p-10 border border-black/5 shadow-xl">
              <div className="flex items-center gap-2 mb-6 text-sm font-bold text-primary-dark uppercase tracking-widest">
                <CheckCircle2 size={16} /> TUDO INCLUSO
              </div>
              
              <div className="text-left mb-8">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-5xl font-black">R$ 19</span>
                  <span className="text-2xl font-bold mb-1">,90</span>
                  <span className="text-text-secondary font-medium mb-1.5">/mês</span>
                </div>
                <p className="text-sm text-text-secondary"><strike>R$ 29,90</strike> · preço de turma fundadora</p>
              </div>
              
              <ul className="space-y-4 mb-10 text-left font-medium text-text-secondary">
                {[
                  'Conexões ilimitadas com bancos e cartões',
                  'Insights sobre suas finanças',
                  'IA ilimitada - pergunte o que quiser',
                  'Automações financeiras personalizadas',
                  'Sincronização com Google Planilhas',
                  'Categorização automática'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-primary-dark shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <CTAButton text="Começar teste grátis" className="w-full h-14" />
              <div className="mt-6 flex flex-col gap-1 text-xs text-text-secondary text-center font-medium">
                <p>Cancele quando quiser, sem multa</p>
                <p>Pagamento seguro via Asaas</p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. SEÇÃO "RESPOSTAS" (Light) */}
        <section id="faq" className="py-24 px-6 bg-white text-black">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-16 fade-in-section">
            <div className="md:w-1/3">
              <SectionBadge text="✓ RESPOSTAS" />
              <h2 className="text-3xl font-bold leading-tight sticky top-32">
                O que as pessoas perguntam antes de conectar
              </h2>
            </div>
            <div className="md:w-2/3">
              <FAQItem 
                isOpenDefault
                question="Preciso dar a senha do banco?" 
                answer="Não. A conexão é pelo Open Finance, regulado pelo Banco Central: você autoriza no app do seu banco. O Grana Smart lê seus dados e nunca paga nada sem você aprovar." 
              />
              <FAQItem 
                question="Funciona com meu banco?" 
                answer="Sim! Funciona com todos os grandes bancos brasileiros: Nubank, Itaú, Bradesco, Santander, Caixa, Banco do Brasil, Inter, C6 e mais de 100 instituições via Open Finance." 
              />
              <FAQItem 
                question="O que acontece depois dos 7 dias?" 
                answer="Se você gostar, continua por apenas R$ 19,90/mês. Se não, é só cancelar — sem multa, sem burocracia, sem ligação de retenção." 
              />
              <FAQItem 
                question="E se eu quiser cancelar?" 
                answer="Cancele a qualquer momento direto no app, em 2 cliques. Seu acesso continua até o fim do período pago." 
              />
            </div>
          </div>
        </section>

        {/* 12. SEÇÃO FINAL CTA (Dark) */}
        <section className="py-32 px-6 bg-background-dark text-white text-center">
          <div className="max-w-3xl mx-auto fade-in-section">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              7 dias grátis, sem cadastrar cartão
            </h2>
            <p className="text-xl text-text-secondaryDark mb-12">
              Depois, apenas R$ 19,90/mês. Cancele quando quiser, sem multa.
            </p>
            <CTAButton text="Comece agora, é grátis →" size="lg" className="h-16 px-12 text-xl" />
            <p className="mt-12 text-sm text-text-secondaryDark">Grana Smart, feito no Brasil 🇧🇷</p>
          </div>
        </section>
      </main>

      {/* 13. FOOTER */}
      <Footer />
    </div>
  );
}

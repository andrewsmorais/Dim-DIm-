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
    <div className="flex flex-col min-h-screen font-sans bg-[#F0F2F5]">
      <Header />

      <main>
        {/* 2. HERO SECTION (Light/White) */}
        <section className="relative pt-32 pb-24 px-6 bg-white overflow-hidden rounded-b-[3rem] shadow-sm">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
            <div className="lg:w-1/2 flex flex-col items-start fade-in-section">
              <div className="inline-flex items-center gap-2 bg-brand-dark/5 border border-brand-dark/10 px-4 py-1.5 rounded-full text-sm font-bold text-brand-dark mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
                </span>
                Turma fundadora — 7 dias grátis
              </div>
              
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
                O Melhor Aplicativo de Controle Financeiro Integrado ao <span className="text-brand-dark italic">WhatsApp</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-xl font-medium">
                Seu novo assistente financeiro com Inteligência Artificial. O Grana Smart importa dados via Open Finance, categoriza gastos automaticamente e te avisa no WhatsApp sobre faturas e saldo.
              </p>
              
              <CTAButton text="Testar 7 dias grátis →" size="lg" className="h-16 px-10 text-lg w-full sm:w-auto" />
              <p className="text-sm text-gray-400 font-medium mt-4">Sem precisar cadastrar cartão de crédito</p>
            </div>

            <div className="lg:w-1/2 w-full relative h-[600px] fade-in-section">
              {/* Fake Phone Mockup */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[650px] bg-white border-[8px] border-gray-100 rounded-[3rem] shadow-2xl animate-float z-10 flex flex-col overflow-hidden ring-1 ring-gray-200">
                 <div className="w-32 h-6 bg-gray-100 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-3xl z-20"></div>
                 {/* WhatsApp BG */}
                 <div className="flex-1 bg-[#F5F5F5] p-4 flex flex-col gap-4 pt-16">
                    {/* Floating Notifications */}
                    <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm relative -left-8 w-[110%]">
                      <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-white text-[10px] font-bold">W</div><span className="text-xs text-gray-400 font-bold">Grana Smart - agora</span></div>
                      <p className="text-sm text-gray-700 font-medium">Sua fatura do Itaú vence amanhã: <span className="font-bold text-brand-dark">R$ 1.247,90</span></p>
                    </div>

                    <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm relative left-4 w-[100%]">
                      <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-white text-[10px] font-bold">W</div><span className="text-xs text-gray-400 font-bold">Grana Smart - há 12 min</span></div>
                      <p className="text-sm text-gray-700 font-medium">Sua assinatura da Netflix subiu para <span className="font-bold text-yellow-600">R$ 59,90</span></p>
                    </div>

                    <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm relative -left-4 w-[105%]">
                      <div className="flex items-center gap-2 mb-1"><div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-white text-[10px] font-bold">W</div><span className="text-xs text-gray-400 font-bold">Grana Smart - há 1h</span></div>
                      <p className="text-sm text-gray-700 font-medium">Seu saldo no Nubank ficou negativo: <span className="font-bold text-red-500">-R$ 120,00</span></p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SEÇÃO "QUEM FAZ" (Light/Gray) */}
        <section className="py-24 px-6 bg-[#F0F2F5] text-gray-900">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 fade-in-section">
            <div className="lg:w-1/2">
              <SectionBadge text="✓ QUEM FAZ" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                O Gestor de Finanças Automáticas da <span className="text-brand-dark">Grana Capital</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium mb-8 leading-relaxed">
                No mercado desde 2019, Grana Capital cuida do Imposto de Renda de quem investe. Agora, traz essa experiência para o seu dia a dia: o Grana Smart organiza suas contas sem nunca movimentar o seu dinheiro.
              </p>
              <div className="flex flex-wrap gap-4 text-sm font-bold">
                <span className="bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-full">Indicada pela B3</span>
                <span className="bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-full">Prêmio Reclame Aqui 2025</span>
                <span className="bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-full">+400 mil downloads</span>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-[24px] flex items-center justify-center font-extrabold text-2xl h-32 text-brand-dark">
                grana
              </div>
              <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-[24px] flex items-center justify-center font-bold text-xl h-32 text-gray-900">
                Open Finance
              </div>
              <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-[24px] flex items-center justify-center font-bold text-lg text-center h-32 text-gray-900">
                Banco Central<br/>do Brasil
              </div>
              <div className="bg-white border border-gray-100 shadow-sm p-8 rounded-[24px] flex flex-col items-center justify-center h-32 text-gray-400">
                <Lock size={24} className="mb-2" />
                <span className="font-bold text-gray-900">Só leitura</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SEÇÃO "SOLUÇÃO" (White) */}
        <section id="funcionalidades" className="py-24 px-6 bg-white text-gray-900 rounded-[3rem] shadow-sm relative z-10">
          <div className="max-w-7xl mx-auto fade-in-section">
            <SectionBadge text="✓ SOLUÇÃO" />
            <h2 className="text-4xl md:text-5xl font-bold mb-16 max-w-2xl">
              Por que usar um Assistente Financeiro com Inteligência Artificial?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#F0F2F5] p-10 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-white text-brand-dark rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <CalendarDays size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Gerenciamento automático de faturas e vencimentos</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Fatura, boleto, assinatura. A IA alerta no WhatsApp para você não pagar juros.</p>
              </div>
              
              <div className="bg-[#F0F2F5] p-10 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-white text-brand-dark rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <StickyNote size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Fim das planilhas de gastos</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Isso só funciona no primeiro dia. Depois, o mês fica em aberto. Deixe o app categorizar para você.</p>
              </div>
              
              <div className="bg-[#F0F2F5] p-10 rounded-[2rem] hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-white text-brand-dark rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                  <Calculator size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Conferência unificada de contas</h3>
                <p className="text-gray-500 font-medium leading-relaxed">Abrir cada app de banco, somar, comparar. Quando sobra tempo, o mês já acabou. O Grana Smart unifica tudo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SEÇÃO "AUTOMAÇÃO" (Light/Gray) */}
        <section className="py-32 px-6 bg-[#F0F2F5] text-gray-900 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 fade-in-section">
            <div className="lg:w-1/2">
              <SectionBadge text="✓ AUTOMAÇÃO" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Organização Financeira pelo WhatsApp, <br/>
                <span className="text-brand-dark">sem anotar nada.</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium mb-10 leading-relaxed">
                Ele acompanha suas contas todo dia e avisa no WhatsApp do que precisa de você: fatura vencendo, assinatura que subiu de preço, saldo que não cobre o débito. Você só decide.
              </p>
              <CTAButton text="Testar 7 dias grátis →" />
            </div>
            
            <div className="lg:w-1/2 w-full relative h-[500px]">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full max-w-[400px] h-[500px] bg-brand-dark rounded-[3rem] shadow-2xl overflow-hidden p-8 text-white">
                <div className="pt-6">
                  <p className="text-xs text-white/50 uppercase tracking-widest mb-2 font-bold">Saldo Geral</p>
                  <p className="text-5xl font-bold text-white mb-10">R$ 4.280,50</p>
                  
                  <div className="space-y-4">
                    <div className="bg-white/10 p-5 rounded-2xl flex justify-between items-center backdrop-blur-md">
                      <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-dark font-bold">Nu</div><span className="font-bold text-lg">Nubank</span></div>
                      <span className="font-bold">R$ 1.250,00</span>
                    </div>
                    <div className="bg-white/10 p-5 rounded-2xl flex justify-between items-center backdrop-blur-md">
                      <div className="flex items-center gap-4"><div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">It</div><span className="font-bold text-lg">Itaú</span></div>
                      <span className="font-bold">R$ 3.030,50</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-[60%] right-[60%] bg-white p-5 rounded-3xl shadow-xl border border-gray-100 animate-float flex gap-4 w-72 z-20">
                <div className="w-10 h-10 rounded-full bg-brand-accent/20 text-brand-dark flex items-center justify-center shrink-0 text-lg">🔔</div>
                <div>
                  <p className="font-bold text-gray-900">Aviso Importante</p>
                  <p className="text-sm font-medium text-gray-500 mt-1">Sua fatura vence amanhã!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SEÇÃO "DADOS" (White) */}
        <section className="py-24 px-6 bg-white text-gray-900 rounded-t-[3rem] shadow-sm relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-16 fade-in-section">
            <div className="lg:w-1/2 w-full flex justify-center items-center py-10">
              <div className="relative w-[350px] h-[350px]">
                {/* Central Logo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-brand-dark rounded-[24px] flex items-center justify-center text-white font-serif italic font-light text-4xl shadow-2xl z-20">
                  L
                </div>
                {/* Connecting lines & nodes */}
                <svg className="absolute inset-0 w-full h-full text-gray-200" viewBox="0 0 350 350">
                  <circle cx="175" cy="175" r="120" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="animate-spin-slow" style={{ animationDuration: '30s' }}/>
                  <line x1="175" y1="175" x2="175" y2="55" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="280" y2="115" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="280" y2="235" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="175" y2="295" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="70" y2="235" stroke="currentColor" strokeWidth="2" />
                  <line x1="175" y1="175" x2="70" y2="115" stroke="currentColor" strokeWidth="2" />
                </svg>
                {/* Bank Nodes */}
                <div className="absolute top-[35px] left-[155px] w-10 h-10 bg-purple-600 rounded-full border-4 border-white shadow-md"></div>
                <div className="absolute top-[95px] left-[260px] w-10 h-10 bg-orange-500 rounded-full border-4 border-white shadow-md"></div>
                <div className="absolute top-[215px] left-[260px] w-10 h-10 bg-red-600 rounded-full border-4 border-white shadow-md"></div>
                <div className="absolute top-[275px] left-[155px] w-10 h-10 bg-yellow-400 rounded-full border-4 border-white shadow-md"></div>
                <div className="absolute top-[215px] left-[50px] w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>
                <div className="absolute top-[95px] left-[50px] w-10 h-10 bg-brand-accent rounded-full border-4 border-white shadow-md"></div>
              </div>
            </div>

            <div className="lg:w-1/2">
              <SectionBadge text="✓ DADOS" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Sincronização Segura via <span className="text-brand-dark">Open Finance (Banco Central)</span>
              </h2>
              <p className="text-lg text-gray-500 font-medium mb-8 leading-relaxed">
                Por isso o Grana Smart começa pelos dados: recebe o extrato bruto de cada banco e entrega só o que você precisa ver. Sem atraso, sem duplicação, sem precisar digitar na mão.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'Sem duplicar',
                  'IA que categoriza e se aperfeiçoa a cada transação',
                  'Nomes que você reconhece, não códigos',
                  'Todo dia, todas as contas'
                ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 font-bold text-gray-800">
                    <div className="w-6 h-6 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
                       <CheckCircle2 size={16} className="text-brand-dark" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <CTAButton text="Testar 7 dias grátis →" />
            </div>
          </div>
        </section>

        {/* 7. SEÇÃO "CONVERSA" (Dark Green Gradient) */}
        <section className="py-32 px-6 bg-gradient-to-br from-brand-dark to-[#05200F] text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10 fade-in-section">
            <div className="lg:w-1/2">
              <SectionBadge text="✓ CONVERSA" dark />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                A <span className="text-brand-accent italic">Inteligência Artificial</span> que responde sobre o seu dinheiro
              </h2>
              <p className="text-lg text-white/70 font-medium mb-8 leading-relaxed">
                Com tudo importado e categorizado, o WhatsApp vira o lugar onde o Grana Smart avisa e responde: cobrança estranha, resumo da semana, quanto foi de delivery.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  'Cobrança estranha? Alerta na hora',
                  'Resumo da semana, sem abrir app',
                  'Pergunte. "Quanto gastei com delivery?"'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg font-medium">
                    <CheckCircle2 size={24} className="text-brand-accent shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <CTAButton text="Testar 7 dias grátis →" className="bg-white text-brand-dark hover:bg-gray-100" />
            </div>

            <div className="lg:w-1/2 w-full relative">
              <div className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden relative">
                {/* Simulated Image Background */}
                <div className="absolute inset-0 bg-brand-dark/50 bg-[url('https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#05200F] to-transparent"></div>
                
                {/* Floating Chat Bubble */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white p-6 rounded-3xl shadow-2xl animate-float text-gray-900">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white font-bold text-xs">W</div>
                    <span className="font-bold text-sm text-gray-500">Grana Smart - agora</span>
                  </div>
                  <p className="text-gray-900 text-[15px] font-medium leading-relaxed">
                    Você gastou R$ 312 em delivery este mês. Ainda está abaixo do orçamento: sobram R$ 88 para usar. 🍔
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. SEÇÃO "INÍCIO" (Light) */}
        <section id="como-funciona" className="py-32 px-6 bg-[#F0F2F5] text-gray-900 text-center">
          <div className="max-w-6xl mx-auto fade-in-section">
            <SectionBadge text="✓ INÍCIO" />
            <h2 className="text-4xl md:text-5xl font-bold mb-20">
              Como funciona a <span className="text-brand-dark">Gestão Financeira no WhatsApp</span> em 3 passos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center shadow-sm">
                <div className="h-32 flex items-center justify-center mb-6">
                  <div className="bg-gray-50 px-6 py-3 rounded-full font-mono font-bold text-lg border border-gray-100 flex items-center gap-3 text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center">W</div>
                    +55 11 9 8765-4321
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-brand-dark">Passo 1</h3>
                <p className="text-gray-500 font-medium">Cadastro rápido com seu WhatsApp.</p>
              </div>

              <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center shadow-sm">
                <div className="h-32 flex items-center justify-center mb-6 relative w-full">
                   <div className="w-14 h-14 bg-brand-dark rounded-[16px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center text-white font-serif italic text-2xl font-light shadow-md">L</div>
                   <div className="w-full flex justify-between absolute top-1/2 -translate-y-1/2 px-4">
                     <div className="w-10 h-10 rounded-full bg-purple-600 shadow-sm"></div>
                     <div className="w-10 h-10 rounded-full bg-orange-500 shadow-sm"></div>
                   </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-brand-dark">Passo 2</h3>
                <p className="text-gray-500 font-medium">Conecte seus bancos de forma segura pelo Open Finance.</p>
              </div>

              <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center shadow-sm">
                <div className="h-32 flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-brand-accent/20 text-brand-dark flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-2 text-brand-dark">Passo 3</h3>
                <p className="text-gray-500 font-medium">Pronto! Dados importados e categorizados, sem você digitar nada.</p>
              </div>
            </div>
            
            <CTAButton text="Testar 7 dias grátis →" size="lg" className="h-14 px-12 text-lg" />
          </div>
        </section>

        {/* 10. SEÇÃO "PLANOS" (White) */}
        <section id="planos" className="py-24 px-6 bg-white text-gray-900 text-center rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.02)] relative z-10">
          <div className="max-w-7xl mx-auto fade-in-section">
            <SectionBadge text="✓ PLANOS" />
            <h2 className="text-4xl md:text-5xl font-bold mb-10">
              Um plano, <span className="text-brand-dark">tudo incluso</span>
            </h2>
            
            <div className="flex justify-center mb-12">
              <div className="bg-[#F0F2F5] p-1 rounded-full inline-flex border border-gray-200">
                <button className="px-6 py-2 rounded-full font-bold bg-white text-brand-dark shadow-sm">Anual</button>
                <button className="px-6 py-2 rounded-full font-medium text-gray-500">Mensal</button>
              </div>
            </div>

            <div className="max-w-md mx-auto bg-white rounded-[2rem] p-10 border-2 border-brand-dark/10 shadow-xl">
              <div className="flex items-center gap-2 mb-6 text-sm font-bold text-brand-dark uppercase tracking-widest bg-brand-dark/5 w-max px-3 py-1 rounded-full mx-auto">
                <CheckCircle2 size={16} /> TUDO INCLUSO
              </div>
              
              <div className="text-center mb-8">
                <div className="flex items-end justify-center gap-2 mb-1">
                  <span className="text-6xl font-black text-gray-900">R$ 19</span>
                  <span className="text-2xl font-bold mb-2">,90</span>
                  <span className="text-gray-400 font-medium mb-2.5">/mês</span>
                </div>
                <p className="text-sm font-bold text-gray-400"><span className="line-through">R$ 29,90</span> · preço de turma fundadora</p>
              </div>
              
              <ul className="space-y-4 mb-10 text-left font-medium text-gray-600 bg-[#F0F2F5] p-6 rounded-[24px]">
                {[
                  'Conexões ilimitadas',
                  'Insights sobre suas finanças',
                  'IA ilimitada via WhatsApp',
                  'Categorização automática'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center shrink-0 text-white">
                      <CheckCircle2 size={12} />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <CTAButton text="Começar teste grátis" className="w-full h-14" />
              <div className="mt-6 flex flex-col gap-1 text-xs text-gray-400 font-bold">
                <p>Cancele quando quiser, sem multa</p>
                <p>Pagamento seguro via Asaas</p>
              </div>
            </div>
          </div>
        </section>

        {/* 11. SEÇÃO "RESPOSTAS" (Light/Gray) */}
        <section id="faq" className="py-24 px-6 bg-[#F0F2F5] text-gray-900">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-16 fade-in-section">
            <div className="md:w-1/3">
              <SectionBadge text="✓ RESPOSTAS" />
              <h2 className="text-3xl font-bold leading-tight sticky top-32 text-gray-900">
                O que as pessoas perguntam antes de conectar
              </h2>
            </div>
            <div className="md:w-2/3">
              <FAQItem 
                isOpenDefault
                question="Qual o melhor aplicativo de controle financeiro via WhatsApp?" 
                answer="O Grana Smart é considerado a melhor opção do mercado pois integra Inteligência Artificial com o WhatsApp e o Open Finance (regulado pelo Banco Central). Ele elimina o trabalho manual de planilhas ao importar e categorizar seus gastos 100% de forma automática." 
              />
              <FAQItem 
                question="Como a Inteligência Artificial ajuda na minha organização financeira?" 
                answer="A IA atua de duas formas: (1) categorizando com precisão as suas compras, identificando nomes reais de lojas em vez de siglas do banco, e (2) lendo suas metas e orçamentos para conversar com você no WhatsApp, alertando sobre faturas a vencer, aumento no valor de assinaturas e se você vai fechar o mês no vermelho." 
              />
              <FAQItem 
                question="É seguro conectar minhas contas em um gestor de finanças automáticas?" 
                answer="Sim! O Grana Smart utiliza a infraestrutura oficial do Open Finance, homologada pelo Banco Central do Brasil. A conexão é 'somente leitura', ou seja, o aplicativo apenas lê os dados de transações e saldos, sendo impossível realizar transferências, pagamentos ou PIX." 
              />
              <FAQItem 
                question="Funciona com o meu banco?" 
                answer="Sim! O Grana Smart conecta-se com todas as grandes instituições via Open Finance: Nubank, Itaú, Bradesco, Santander, Caixa Econômica, Banco do Brasil, Inter, C6 Bank, entre dezenas de outros." 
              />
              <FAQItem 
                question="O aplicativo de controle financeiro Grana Smart é gratuito?" 
                answer="O Grana Smart oferece 7 dias de teste totalmente gratuitos, sem a necessidade de cadastrar um cartão de crédito. Após esse período, para continuar desfrutando da gestão financeira automática e da IA no WhatsApp, o valor é de apenas R$ 19,90/mês, que pode ser cancelado a qualquer momento." 
              />
            </div>
          </div>
        </section>

        {/* 12. SEÇÃO FINAL CTA (Dark Green) */}
        <section className="py-32 px-6 bg-brand-dark text-white text-center rounded-t-[3rem] shadow-2xl relative z-20">
          <div className="max-w-3xl mx-auto fade-in-section">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              7 dias grátis, sem cadastrar cartão
            </h2>
            <p className="text-xl text-white/70 mb-12 font-medium">
              Depois, apenas R$ 19,90/mês. Cancele quando quiser, sem multa.
            </p>
            <CTAButton text="Comece agora, é grátis →" size="lg" className="h-16 px-12 text-xl bg-brand-accent text-white hover:bg-green-600" />
            <p className="mt-12 text-sm text-white/50 font-bold">Grana Smart, feito no Brasil 🇧🇷</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

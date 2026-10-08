import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Search, BarChart2, Plane, AlertTriangle, 
  DollarSign, CheckCircle, Tag, Zap, Calendar
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background font-bold">G</div>
          <span className="font-bold text-xl">Grana Smart</span>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="#como-funciona" className="text-text-secondary hover:text-text transition-colors">Como funciona</Link>
          <Link href="#preco" className="text-text-secondary hover:text-text transition-colors">Planos</Link>
          <Link href="/login" className="text-text-secondary hover:text-text transition-colors">Entrar</Link>
          <Link href="/cadastro">
            <Button>Começar grátis</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 max-w-7xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
            Converse com sua grana e <span className="text-primary">controle seu futuro</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mb-10">
            Economize tempo e dinheiro com o assistente financeiro que te ajuda a gastar melhor, poupar mais e aumentar seu patrimônio.
          </p>
          <Link href="/cadastro">
            <Button size="lg" className="text-lg px-10 h-14 rounded-full font-bold">
              Quero começar agora
            </Button>
          </Link>
          
          <div className="mt-20 w-full max-w-3xl h-[400px] bg-surface rounded-2xl border border-surface-light overflow-hidden relative shadow-2xl shadow-primary/10">
            {/* Mockup simplificado */}
            <div className="absolute inset-0 flex flex-col">
              <div className="h-12 border-b border-surface-light flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-danger"></div>
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <div className="w-3 h-3 rounded-full bg-success"></div>
              </div>
              <div className="flex-1 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">Saldo Total</p>
                    <p className="text-3xl font-bold text-primary">R$ 14.520,00</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-surface-light"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-surface-light p-4 rounded-xl">
                    <p className="text-xs text-text-secondary mb-1">Entradas</p>
                    <p className="text-lg font-semibold text-success">R$ 5.200,00</p>
                  </div>
                  <div className="bg-surface-light p-4 rounded-xl">
                    <p className="text-xs text-text-secondary mb-1">Saídas</p>
                    <p className="text-lg font-semibold text-danger">R$ 2.100,00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inspire-se */}
        <section className="py-24 px-6 bg-surface border-y border-surface-light">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Ou se inspire nas ideias que a comunidade está criando</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Search, title: "Descubra minhas despesas invisíveis" },
                { icon: BarChart2, title: "Faça meu dinheiro parado render" },
                { icon: Plane, title: "Quero conhecer o Mickey!" },
                { icon: AlertTriangle, title: "Cuidado com as parcelas!" },
                { icon: DollarSign, title: "Reinvestindo meus dividendos" },
                { icon: CheckCircle, title: "Meus clientes já me pagaram?" },
              ].map((item, i) => (
                <div key={i} className="bg-background border border-surface-light p-6 rounded-2xl flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="p-3 bg-surface rounded-lg text-primary">
                    <item.icon size={24} />
                  </div>
                  <p className="font-medium text-lg">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Você diz o que quer e o Grana Smart cria a solução para você!</h2>
            <p className="text-text-secondary text-lg">Crie automações apenas conversando com seu assistente.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {[
              { icon: Tag, text: "Qual a categoria desse pagamento?" },
              { icon: Search, text: "De olho nas assinaturas" },
              { icon: Zap, text: "Sua conta de luz aumentou!" },
              { icon: Calendar, text: "Dia de pagar a Nesca" },
              { icon: DollarSign, text: "Seu salário caiu na conta" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-surface border border-surface-light px-4 py-3 rounded-full">
                <item.icon size={18} className="text-primary" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline" className="rounded-full px-8">
              Quero criar minhas automações
            </Button>
          </div>
        </section>

        {/* Preço */}
        <section id="preco" className="py-24 px-6 bg-surface border-y border-surface-light">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Pronto para tomar o controle da sua grana?</h2>
            <p className="text-xl text-text-secondary mb-10">Um plano, tudo incluso. Comece com 7 dias grátis e cancele quando quiser</p>
            
            <div className="bg-background border border-primary/30 p-10 rounded-3xl relative max-w-md mx-auto shadow-[0_0_50px_-12px_rgba(0,255,136,0.2)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-background px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                Mais Popular
              </div>
              <p className="text-5xl font-extrabold mb-2">R$ 19,90<span className="text-lg text-text-secondary font-normal">/mês</span></p>
              <p className="text-text-secondary mb-8">Faturado mensalmente</p>
              
              <ul className="text-left space-y-4 mb-8">
                {['Contas ilimitadas', 'Automações com IA', 'Alertas no WhatsApp', 'Metas personalizadas'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="text-primary" size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/cadastro" className="block">
                <Button className="w-full h-12 text-lg rounded-xl">Começar 7 dias grátis</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background py-12 px-6 border-t border-surface-light">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-background font-bold text-xs">G</div>
            <span className="font-bold">Grana Smart</span>
          </div>
          <div className="text-sm text-text-secondary flex gap-6">
            <Link href="#" className="hover:text-text transition-colors">Termos de Uso</Link>
            <Link href="#" className="hover:text-text transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-text transition-colors">Contato</Link>
          </div>
          <p className="text-sm text-text-secondary">© 2026 Grana Smart. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

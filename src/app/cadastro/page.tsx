import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CadastroPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-background font-bold text-xl">G</div>
        <span className="font-bold text-2xl text-text">Grana Smart</span>
      </Link>
      
      <div className="w-full max-w-md bg-surface border border-surface-light p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-center">Crie sua conta</h1>
        <p className="text-center text-text-secondary mb-6">7 dias grátis, sem compromisso</p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Nome completo</label>
            <input 
              type="text" 
              className="w-full bg-background border border-surface-light rounded-lg px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="João da Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">E-mail</label>
            <input 
              type="email" 
              className="w-full bg-background border border-surface-light rounded-lg px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">WhatsApp</label>
            <input 
              type="tel" 
              className="w-full bg-background border border-surface-light rounded-lg px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="+55 (11) 99999-9999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full bg-background border border-surface-light rounded-lg px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-start gap-2 py-2">
            <input type="checkbox" id="termos" className="mt-1" />
            <label htmlFor="termos" className="text-sm text-text-secondary">
              Aceito os <Link href="#" className="text-primary hover:underline">termos de uso</Link> e <Link href="#" className="text-primary hover:underline">política de privacidade</Link>
            </label>
          </div>
          
          <Link href="/dashboard" className="block pt-2">
            <Button className="w-full h-12 text-lg">Criar conta grátis</Button>
          </Link>
        </form>
        
        <div className="mt-8 text-center text-text-secondary">
          Já tem uma conta? <Link href="/login" className="text-primary hover:underline">Entrar</Link>
        </div>
      </div>
    </div>
  );
}

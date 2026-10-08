import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-background font-bold text-xl">G</div>
        <span className="font-bold text-2xl text-text">Grana Smart</span>
      </Link>
      
      <div className="w-full max-w-md bg-surface border border-surface-light p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Acesse sua conta</h1>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">E-mail</label>
            <input 
              type="email" 
              className="w-full bg-background border border-surface-light rounded-lg px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
              placeholder="seu@email.com"
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
          
          <div className="flex justify-end">
            <Link href="#" className="text-sm text-primary hover:underline">Esqueci minha senha</Link>
          </div>
          
          <Link href="/dashboard" className="block pt-2">
            <Button className="w-full h-12 text-lg">Entrar</Button>
          </Link>
        </form>
        
        <div className="mt-8 text-center text-text-secondary">
          Não tem uma conta? <Link href="/cadastro" className="text-primary hover:underline">Criar conta</Link>
        </div>
      </div>
    </div>
  );
}

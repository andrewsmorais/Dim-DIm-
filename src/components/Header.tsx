import Link from "next/link";
import { CTAButton } from "./CTAButton";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-2xl tracking-tight text-white">
            grana <span className="text-primary">smart</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#funcionalidades" className="text-white/70 hover:text-white transition-colors">Funcionalidades</Link>
          <Link href="#como-funciona" className="text-white/70 hover:text-white transition-colors">Como funciona</Link>
          <Link href="#planos" className="text-white/70 hover:text-white transition-colors">Preços</Link>
          <Link href="#faq" className="text-white/70 hover:text-white transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:flex items-center justify-center h-10 px-6 rounded-full border border-primary text-primary font-bold hover:bg-primary/10 transition-colors text-sm">
            Entrar
          </Link>
          <CTAButton text="Testar 7 dias grátis →" size="sm" />
        </div>
      </div>
    </header>
  );
}

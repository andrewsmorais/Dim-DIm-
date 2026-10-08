import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-dark pt-20 pb-10 px-6 border-t border-brand-dark">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <Link href="/" className="mb-12 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-brand-dark font-serif italic text-xl font-light">
            L
          </div>
          <span className="font-bold text-3xl tracking-tight text-white">
            Grana <span className="text-brand-accent">Smart</span>
          </span>
        </Link>
        
        <div className="flex gap-8 mb-12 text-sm font-medium">
          <Link href="/termos-de-uso" className="text-white/70 hover:text-white transition-colors">Termos de uso</Link>
          <Link href="/politica-de-privacidade" className="text-white/70 hover:text-white transition-colors">Privacidade</Link>
          <Link href="/contato" className="text-white/70 hover:text-white transition-colors">Contato</Link>
        </div>
        
        <div className="flex gap-6 mb-12 text-white/50 font-medium text-sm">
          <a href="#" className="hover:text-brand-accent transition-colors">Instagram</a>
          <a href="#" className="hover:text-brand-accent transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-brand-accent transition-colors">YouTube</a>
        </div>
        
        <div className="text-xs text-white/40 text-center flex flex-col items-center gap-2">
          <p>Grana Smart · CNPJ XX.XXX.XXX/0001-XX</p>
          <p>Feito no Brasil 🇧🇷</p>
        </div>
      </div>
    </footer>
  );
}

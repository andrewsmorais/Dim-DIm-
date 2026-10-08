import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] pt-20 pb-10 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <Link href="/" className="mb-12">
          <span className="font-extrabold text-3xl tracking-tight text-white">
            grana <span className="text-primary">smart</span>
          </span>
        </Link>
        
        <div className="flex gap-8 mb-12 text-sm">
          <Link href="/termos-de-uso" className="text-white/60 hover:text-white transition-colors">Termos de uso</Link>
          <Link href="/politica-de-privacidade" className="text-white/60 hover:text-white transition-colors">Privacidade</Link>
          <Link href="/contato" className="text-white/60 hover:text-white transition-colors">Contato</Link>
        </div>
        
        <div className="flex gap-6 mb-12 text-white/40 font-medium text-sm">
          <a href="#" className="hover:text-primary transition-colors">Instagram</a>
          <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-primary transition-colors">YouTube</a>
        </div>
        
        <div className="text-xs text-white/40 text-center flex flex-col items-center gap-2">
          <p>Grana Smart · CNPJ XX.XXX.XXX/0001-XX</p>
          <p>Feito no Brasil 🇧🇷</p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

export const INSTAGRAM_HANDLE = "jakashfinancas";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

const LINKS: { href: string; label: string }[] = [
  { href: "/termos-de-uso", label: "Termos de uso" },
  { href: "/politica-de-privacidade", label: "Política de privacidade" },
  { href: "/politica-de-reembolso", label: "Política de reembolso" },
  { href: "/politica-de-cookies", label: "Política de cookies" },
  { href: "/sobre", label: "Sobre a empresa" },
  { href: "/contato", label: "Contato" },
];

// Ícone do Instagram em SVG (o pacote de ícones não traz logos de marcas).
function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-brand-dark pt-14 pb-8 px-6 border-t border-brand-dark">
      <div className="max-w-7xl mx-auto">
        {/* Marca de um lado, Instagram do outro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Jakash" className="w-11 h-11 rounded-xl object-cover" />
            <span className="font-bold text-3xl tracking-tight text-white">Jakash</span>
          </Link>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Instagram do Jakash (@${INSTAGRAM_HANDLE})`}
            className="inline-flex items-center gap-2.5 w-max rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/80 hover:text-white hover:border-white/50 transition-colors"
          >
            <InstagramIcon /> @{INSTAGRAM_HANDLE}
          </a>
        </div>

        {/* Menu institucional */}
        <nav aria-label="Links institucionais" className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-3 py-8 text-sm font-medium">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-white/70 hover:text-white transition-colors">{l.label}</Link>
          ))}
        </nav>

        <div className="text-xs text-white/40 flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t border-white/10">
          <p>© {new Date().getFullYear()} Jakash. Todos os direitos reservados.</p>
          <p>Feito no Brasil 🇧🇷</p>
        </div>
      </div>
    </footer>
  );
}

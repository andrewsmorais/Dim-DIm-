import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Renova a sessão do Supabase a cada acesso e manda para o login quem não está logado nas telas do app.
// As rotas /api cuidam da própria autenticação; páginas públicas (landing, login, cadastro, contador, etc.) ficam livres.
const PROTECTED = ['/dashboard', '/transacoes', '/contas-bancarias', '/cartoes', '/relatorios', '/planejamento', '/limites', '/contas', '/dividas', '/metas', '/reserva', '/investimentos', '/chat', '/importar', '/mei', '/menu', '/categorias', '/configuracoes', '/bem-vindo', '/simulador'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + '/'));
  if (isProtected && !user) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', path + request.nextUrl.search);
    return NextResponse.redirect(login);
  }
  if (user && (path === '/login' || path === '/cadastro')) return NextResponse.redirect(new URL('/dashboard', request.url));
  return response;
}

export const config = {
  matcher: ['/((?!api/|contador/|_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|offline.html|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|webmanifest)$).*)'],
};

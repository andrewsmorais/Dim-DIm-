"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, Database, Globe, LogOut, MessageCircle, Palette, Sparkles, User, Users, type LucideIcon } from "lucide-react";
import { useSupabase } from "@/lib/useSupabase";
import { BackTitle, Card } from "@/components/ui/page";
import { InstallAppButton } from "@/components/PWA";
import { InstallGuide } from "@/components/InstallGuide";

const ITEMS: { icon: LucideIcon; title: string; desc: string; href?: string; soon?: boolean }[] = [
  { icon: User, title: "Meu perfil", desc: "Nome, e-mail e telefone.", href: "/configuracoes/perfil" },
  { icon: Globe, title: "Preferências", desc: "Idioma e moeda.", href: "/configuracoes/preferencias" },
  { icon: Bell, title: "Notificações", desc: "Lembretes de contas a pagar e receber.", href: "/configuracoes/notificacoes" },
  { icon: Palette, title: "Aparência", desc: "Tema claro/escuro e cor do app.", href: "/configuracoes/aparencia" },
  { icon: MessageCircle, title: "WhatsApp", desc: "Conecte o número que registra seus gastos.", href: "/configuracoes/whatsapp" },
  { icon: Sparkles, title: "Planos e assinatura", desc: "Seu plano, faturas e cancelamento.", href: "/configuracoes/planos" },
  { icon: Database, title: "Dados", desc: "Exportar, recomeçar do zero ou excluir a conta.", href: "/configuracoes/dados" },
  { icon: Users, title: "Gestão compartilhada", desc: "Dividir as finanças com outra pessoa.", href: "/configuracoes/compartilhada" },
];

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [signal, setSignal] = useState(0);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <BackTitle title="Configurações" subtitle="Ajuste o Jakash do seu jeito." href="/menu" />
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <p className="font-extrabold">Instale o Jakash no celular</p>
            <p className="text-xs text-gray-500">Abre com um toque, em tela cheia, como um app.</p>
          </div>
          <InstallAppButton className="sm:min-w-[170px]" onFallback={() => { setSignal((n) => n + 1); document.getElementById("como-instalar")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
        </div>
      </Card>
      <Card className="!p-2">
        <ul className="divide-y divide-gray-100 dark:divide-[#262626]">
          {ITEMS.map((it) => {
            const inner = (
              <div className="flex items-center gap-4 px-3 py-4">
                <div className="w-11 h-11 rounded-2xl bg-brand-dark/10 dark:bg-[#262626] text-brand-dark dark:text-brand-soft flex items-center justify-center shrink-0"><it.icon size={20} /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold">{it.title}</p>
                  <p className="text-xs text-gray-500">{it.desc}</p>
                </div>
                {it.soon ? <span className="text-[10px] font-bold rounded-full bg-gray-100 dark:bg-[#262626] px-2.5 py-1 text-gray-500">Em breve</span> : <ChevronRight size={18} className="text-gray-300" />}
              </div>
            );
            return <li key={it.title}>{it.href ? <Link href={it.href} className="block hover:bg-brand-dark/5 dark:hover:bg-[#1E1E1E] rounded-2xl">{inner}</Link> : <div className="opacity-70">{inner}</div>}</li>;
          })}
        </ul>
      </Card>
      <Card className="mt-4"><InstallGuide openSignal={signal} /></Card>
      <button onClick={logout} className="mt-6 w-full flex items-center justify-center gap-2 rounded-full border border-red-500/30 text-red-500 font-bold py-3 text-sm"><LogOut size={16} /> Sair da conta</button>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Monitor, Tag, Users, 
  Send, FileText, 
  Settings, ThumbsUp, HelpCircle
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#E5E7EB] dark:bg-gray-900" />;

  return (
    <div className="min-h-screen bg-[#E5E7EB] dark:bg-gray-900 flex flex-col md:flex-row font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white dark:bg-gray-800 hidden md:flex flex-col h-screen sticky top-0 rounded-r-3xl shadow-sm z-20 transition-colors duration-300 border-r border-transparent dark:border-gray-700">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-white font-serif italic text-xl font-light">
            L
          </div>
          <span className="font-bold text-lg text-black dark:text-white tracking-tight">Grana Smart</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6 scrollbar-hide">
          
          {/* MENU Section */}
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest">MENU</p>
            <nav className="space-y-1">
              {[
                { icon: Home, labelKey: "menu.dashboard", href: "/dashboard" },
                { icon: Monitor, labelKey: "menu.reports", href: "#" },
                { icon: Tag, labelKey: "menu.accounts", href: "#" },
                { icon: Users, labelKey: "menu.cards", href: "#" },
              ].map((item) => {
                const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard");
                return (
                  <Link 
                    key={item.labelKey} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                      isActive 
                        ? "bg-brand-dark text-white font-medium shadow-md shadow-brand-dark/20" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* FINANCIAL Section */}
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest">FINANCIAL</p>
            <nav className="space-y-1">
              {[
                { icon: Send, labelKey: "menu.transactions", href: "/transacoes" },
                { icon: FileText, labelKey: "menu.invoices", href: "#" },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.labelKey} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                      isActive 
                        ? "bg-brand-dark text-white font-medium shadow-md shadow-brand-dark/20" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* TOOLS Section */}
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 tracking-widest">TOOLS</p>
            <nav className="space-y-1">
              {[
                { icon: Settings, labelKey: "menu.settings", href: "/configuracoes" },
                { icon: ThumbsUp, labelKey: "menu.feedback", href: "#" },
                { icon: HelpCircle, labelKey: "menu.help", href: "#" },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.labelKey} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                      isActive 
                        ? "bg-brand-dark text-white font-medium shadow-md shadow-brand-dark/20" 
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Upgrade Pro Card */}
        <div className="p-6 mb-4">
          <div className="bg-[#051009] dark:bg-black rounded-2xl p-5 text-white flex flex-col relative overflow-hidden border border-transparent dark:border-gray-800">
             {/* Logo background watermark */}
             <div className="absolute -bottom-4 -right-4 opacity-10 text-6xl font-serif italic">L</div>
             <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-white font-serif italic text-sm mb-3 font-light">
                L
             </div>
             <h4 className="font-bold text-lg mb-1 z-10">{t('sidebar.upgrade.title')}</h4>
             <p className="text-[10px] text-gray-400 mb-4 leading-tight z-10">
               {t('sidebar.upgrade.desc')}
             </p>
             <button className="w-full bg-brand-dark hover:bg-green-900 text-white text-xs font-medium py-2.5 rounded-full transition-colors z-10">
               {t('sidebar.upgrade.btn')}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full relative">
        <main className="flex-1 p-8 md:p-10 overflow-x-hidden pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

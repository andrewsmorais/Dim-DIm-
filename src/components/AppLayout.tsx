"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, DollarSign, Target, PieChart, 
  Settings, LogOut, Bell, Menu, Zap
} from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: DollarSign, label: "Transações", href: "/transacoes" },
    { icon: Target, label: "Metas", href: "/metas" },
    { icon: PieChart, label: "Relatórios", href: "#" },
    { icon: Zap, label: "Automações", href: "#" },
    { icon: Settings, label: "Configurações", href: "/configuracoes" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-text">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-surface border-r border-surface-light hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background font-bold">G</div>
          <span className="font-bold text-xl">Grana Smart</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-text-secondary hover:bg-surface-light hover:text-text"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-surface-light">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-danger hover:bg-danger/10 rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Sair</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="h-20 border-b border-surface-light bg-surface/50 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 md:hidden">
            <Menu className="text-text" size={24} />
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-background font-bold">G</div>
          </div>
          
          <div className="hidden md:block">
            <h2 className="text-xl font-bold">Olá, João 👋</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-text-secondary hover:text-text transition-colors">
              <Bell size={24} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-surface-light border border-primary/50 overflow-hidden">
              {/* Avatar placeholder */}
              <div className="w-full h-full flex items-center justify-center text-text-secondary font-medium">J</div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation (Simplified for MVP) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light flex justify-around p-3 z-50">
        {[menuItems[0], menuItems[1], menuItems[2], menuItems[5]].map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 ${
                isActive ? "text-primary" : "text-text-secondary"
              }`}
            >
              <item.icon size={24} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

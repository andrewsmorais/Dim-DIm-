"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Monitor, Tag, Users, 
  Send, FileText, 
  Settings, ThumbsUp, HelpCircle
} from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-[#E5E7EB] flex flex-col md:flex-row font-sans text-gray-800">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white hidden md:flex flex-col h-screen sticky top-0 rounded-r-3xl shadow-sm z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center text-white font-serif italic text-xl font-light">
            L
          </div>
          <span className="font-bold text-lg text-black tracking-tight">Grana Smart</span>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6 scrollbar-hide">
          
          {/* MENU Section */}
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 tracking-widest">MENU</p>
            <nav className="space-y-1">
              {[
                { icon: Home, label: "Dashboard", href: "/dashboard" },
                { icon: Monitor, label: "Report", href: "#" },
                { icon: Tag, label: "Products", href: "#" },
                { icon: Users, label: "Consumer", href: "#" },
              ].map((item) => {
                const isActive = pathname === item.href || (item.label === "Dashboard" && pathname === "/dashboard");
                return (
                  <Link 
                    key={item.label} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                      isActive 
                        ? "bg-brand-dark text-white font-medium shadow-md shadow-brand-dark/20" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* FINANCIAL Section */}
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 tracking-widest">FINANCIAL</p>
            <nav className="space-y-1">
              {[
                { icon: Send, label: "Transactions", href: "/transacoes" },
                { icon: FileText, label: "Invoices", href: "#" },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.label} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                      isActive 
                        ? "bg-brand-dark text-white font-medium shadow-md shadow-brand-dark/20" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* TOOLS Section */}
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 tracking-widest">TOOLS</p>
            <nav className="space-y-1">
              {[
                { icon: Settings, label: "Settings", href: "/configuracoes" },
                { icon: ThumbsUp, label: "Feedback", href: "#" },
                { icon: HelpCircle, label: "Help", href: "#" },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.label} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors ${
                      isActive 
                        ? "bg-brand-dark text-white font-medium shadow-md shadow-brand-dark/20" 
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

        </div>

        {/* Upgrade Pro Card */}
        <div className="p-6 mb-4">
          <div className="bg-[#051009] rounded-2xl p-5 text-white flex flex-col relative overflow-hidden">
             {/* Logo background watermark */}
             <div className="absolute -bottom-4 -right-4 opacity-10 text-6xl font-serif italic">L</div>
             <div className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center text-white font-serif italic text-sm mb-3 font-light">
                L
             </div>
             <h4 className="font-bold text-lg mb-1 z-10">Upgrade Pro</h4>
             <p className="text-[10px] text-gray-400 mb-4 leading-tight z-10">
               Discover the benefit of an upgraded account
             </p>
             <button className="w-full bg-brand-dark hover:bg-green-900 text-white text-xs font-medium py-2.5 rounded-full transition-colors z-10">
               Upgrade $580
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

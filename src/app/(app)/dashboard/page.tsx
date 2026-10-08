"use client";

import { useState } from "react";
import { 
  ArrowUpRight, ArrowDownRight, TrendingUp,
  ShoppingCart, Car, Briefcase, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Note: In a real app we would use recharts here
export default function DashboardPage() {
  const [chatMessage, setChatMessage] = useState("");

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* Saldo Consolidado */}
      <div className="bg-surface border border-surface-light p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-1">Saldo Total</h3>
          <p className="text-4xl font-bold text-primary">R$ 14.520,00</p>
          <p className="text-xs text-text-secondary mt-1">Atualizado agora</p>
        </div>
        {/* Placeholder for Mini Chart */}
        <div className="w-full md:w-48 h-16 bg-surface-light/50 rounded-lg flex items-center justify-center text-xs text-text-secondary border border-dashed border-surface-light">
          Evolução (7 dias)
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-surface-light p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success/10 text-success rounded-lg">
              <ArrowUpRight size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Entradas do Mês</h3>
          </div>
          <p className="text-2xl font-bold mb-1">R$ 8.200,00</p>
          <p className="text-xs text-success flex items-center gap-1">
            <TrendingUp size={12} /> +12% vs mês anterior
          </p>
        </div>
        
        <div className="bg-surface border border-surface-light p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-danger/10 text-danger rounded-lg">
              <ArrowDownRight size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Saídas do Mês</h3>
          </div>
          <p className="text-2xl font-bold mb-1">R$ 3.100,00</p>
          <p className="text-xs text-success flex items-center gap-1">
            <TrendingUp size={12} className="rotate-180" /> -5% vs mês anterior
          </p>
        </div>
        
        <div className="bg-surface border border-surface-light p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-text-secondary text-sm font-medium">Economia do Mês</h3>
          </div>
          <p className="text-2xl font-bold mb-1">R$ 5.100,00</p>
          <p className="text-xs text-text-secondary">62% da renda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metas e Transações na mesma linha em desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metas */}
          <div className="bg-surface border border-surface-light p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Suas Metas</h3>
              <Button variant="outline" size="sm">+ Nova Meta</Button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Viagem", icon: "✈️", current: 2400, target: 5000, color: "bg-primary", text: "Faltam R$ 2.600 · Previsão: 4 meses" },
                { name: "Reserva de Emergência", icon: "🛡️", current: 8000, target: 15000, color: "bg-info", text: "Faltam R$ 7.000 · Previsão: 8 meses" }
              ].map((meta, i) => {
                const percent = Math.round((meta.current / meta.target) * 100);
                return (
                  <div key={i} className="bg-background p-4 rounded-xl border border-surface-light">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{meta.icon}</span>
                        <span className="font-medium">{meta.name}</span>
                      </div>
                      <span className="text-sm font-bold">{percent}%</span>
                    </div>
                    <div className="w-full bg-surface-light rounded-full h-2 mb-2">
                      <div className={`${meta.color} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-text-secondary">
                      <span>R$ {meta.current} / R$ {meta.target}</span>
                      <span>{meta.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transações Recentes */}
          <div className="bg-surface border border-surface-light p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Últimas Transações</h3>
              <select className="bg-background border border-surface-light rounded px-2 py-1 text-sm focus:outline-none focus:border-primary">
                <option>Todas</option>
                <option>Entradas</option>
                <option>Saídas</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Supermercado Dia", cat: "Alimentação", icon: ShoppingCart, val: -87.40, date: "Hoje, 14:32", origin: "WhatsApp" },
                { name: "Uber", cat: "Transporte", icon: Car, val: -32.90, date: "Hoje, 09:15", origin: "Manual" },
                { name: "Salário", cat: "Trabalho", icon: Briefcase, val: 5200.00, date: "Ontem, 08:00", origin: "Banco" },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-background rounded-xl transition-colors border border-transparent hover:border-surface-light">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-surface-light rounded-lg text-text-secondary">
                      <t.icon size={20} />
                    </div>
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                        <span>{t.cat}</span>
                        <span className="w-1 h-1 rounded-full bg-surface-light"></span>
                        <span className="bg-background px-1.5 py-0.5 rounded border border-surface-light text-[10px] uppercase">
                          {t.origin}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.val > 0 ? "text-success" : "text-text"}`}>
                      {t.val > 0 ? "+" : ""}R$ {Math.abs(t.val).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">{t.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Direita (Gráfico e IA) */}
        <div className="space-y-6">
          {/* Gráfico Pizza */}
          <div className="bg-surface border border-surface-light p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-6">Gastos por Categoria</h3>
            <div className="h-48 flex items-center justify-center bg-background rounded-xl border border-dashed border-surface-light mb-4">
              <span className="text-sm text-text-secondary">Gráfico (Alimentação, Transporte, etc.)</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary"></span>Alimentação</div><span>35%</span></div>
              <div className="flex justify-between items-center text-sm"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-info"></span>Transporte</div><span>20%</span></div>
              <div className="flex justify-between items-center text-sm"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-warning"></span>Moradia</div><span>20%</span></div>
            </div>
          </div>

          {/* Assistente IA */}
          <div className="bg-surface border border-surface-light p-6 rounded-2xl relative overflow-hidden">
            {/* Efeito Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
            
            <h3 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
              <span className="text-2xl">🤖</span> Pergunte ao seu Assistente
            </h3>
            
            <div className="relative z-10">
              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ex: Quanto gastei com delivery?" 
                  className="w-full bg-background border border-surface-light rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <Button size="icon" className="shrink-0"><Send size={16} /></Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button className="text-xs bg-background border border-surface-light px-3 py-1.5 rounded-full hover:border-primary transition-colors">
                  Posso investir R$ 500?
                </button>
                <button className="text-xs bg-background border border-surface-light px-3 py-1.5 rounded-full hover:border-primary transition-colors">
                  Quanto gastei no iFood?
                </button>
                <button className="text-xs bg-background border border-surface-light px-3 py-1.5 rounded-full hover:border-primary transition-colors">
                  Resumo da semana
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

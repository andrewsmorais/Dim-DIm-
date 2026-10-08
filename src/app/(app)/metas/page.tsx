import { Plus, Edit2, Trash2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MetasPage() {
  const metas = [
    { name: "Viagem para Europa", icon: "✈️", current: 2400, target: 5000, color: "bg-primary", date: "Dez/2026", desc: "Viagem de férias com a família" },
    { name: "Manutenção do Carro", icon: "🚗", current: 800, target: 1500, color: "bg-warning", date: "Nov/2026", desc: "Revisão dos 50.000km" },
    { name: "Reserva de Emergência", icon: "🛡️", current: 8000, target: 15000, color: "bg-info", date: "Jun/2027", desc: "6 meses de custo de vida" },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Suas Metas Financeiras</h1>
          <p className="text-text-secondary">Acompanhe seus objetivos</p>
        </div>
        <Button className="gap-2"><Plus size={18} /> Criar Nova Meta</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metas.map((meta, i) => {
          const percent = Math.round((meta.current / meta.target) * 100);
          return (
            <div key={i} className="bg-surface border border-surface-light p-6 rounded-2xl flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="text-4xl">{meta.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{meta.name}</h3>
                    <p className="text-xs text-text-secondary mt-1">Até {meta.date}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 text-text-secondary hover:text-text transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-text-secondary hover:text-danger transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-text-secondary mb-6 flex-1">{meta.desc}</p>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-2xl font-bold text-text">R$ {meta.current}</p>
                    <p className="text-xs text-text-secondary">de R$ {meta.target}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{percent}%</span>
                </div>
                
                <div className="w-full bg-background rounded-full h-3 mb-4 border border-surface-light overflow-hidden">
                  <div className={`${meta.color} h-full rounded-full`} style={{ width: `${percent}%` }}></div>
                </div>
                
                <Button variant="outline" className="w-full gap-2 text-primary border-primary/30 hover:bg-primary/10">
                  <PlusCircle size={16} /> Adicionar Valor
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

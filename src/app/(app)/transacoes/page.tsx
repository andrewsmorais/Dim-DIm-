import { 
  Search, Filter, Plus, 
  ShoppingCart, Car, Briefcase, Coffee, 
  Edit2, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TransacoesPage() {
  const transacoes = [
    { id: 1, nome: "Supermercado Dia", cat: "Alimentação", icon: ShoppingCart, val: -87.40, date: "14 Out 2026", origin: "WhatsApp" },
    { id: 2, nome: "Uber", cat: "Transporte", icon: Car, val: -32.90, date: "14 Out 2026", origin: "Manual" },
    { id: 3, nome: "Salário", cat: "Trabalho", icon: Briefcase, val: 5200.00, date: "13 Out 2026", origin: "Open Finance" },
    { id: 4, nome: "Padaria", cat: "Alimentação", icon: Coffee, val: -15.50, date: "13 Out 2026", origin: "Manual" },
    { id: 5, nome: "Assinatura Netflix", cat: "Lazer", icon: Filter, val: -39.90, date: "12 Out 2026", origin: "Cartão" },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Todas as Transações</h1>
          <p className="text-text-secondary">Gerencie suas entradas e saídas</p>
        </div>
        <Button className="gap-2"><Plus size={18} /> Adicionar Transação</Button>
      </div>

      <div className="bg-surface border border-surface-light rounded-2xl overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-surface-light flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Buscar transação..." 
              className="w-full bg-background border border-surface-light rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-background border border-surface-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option>Este Mês</option>
              <option>Mês Passado</option>
              <option>Últimos 90 dias</option>
            </select>
            <select className="bg-background border border-surface-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option>Todas Categorias</option>
              <option>Alimentação</option>
              <option>Transporte</option>
            </select>
            <select className="bg-background border border-surface-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option>Todos Tipos</option>
              <option>Entradas</option>
              <option>Saídas</option>
            </select>
          </div>
        </div>

        {/* Table/List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 border-b border-surface-light text-text-secondary">
              <tr>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium">Descrição</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium text-right">Valor</th>
                <th className="px-6 py-4 font-medium">Origem</th>
                <th className="px-6 py-4 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-light">
              {transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 text-text-secondary">{t.date}</td>
                  <td className="px-6 py-4 font-medium">{t.nome}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-surface-light rounded text-text-secondary">
                        <t.icon size={14} />
                      </div>
                      {t.cat}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${t.val > 0 ? "text-success" : "text-text"}`}>
                    {t.val > 0 ? "+" : ""}R$ {Math.abs(t.val).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-surface-light px-2 py-1 rounded text-xs">
                      {t.origin}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-text-secondary hover:text-primary transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-text-secondary hover:text-danger transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { 
  User, CreditCard, MessageSquare, 
  Bell, Shield, Info, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-text-secondary">Gerencie sua conta e preferências</p>
      </div>

      <div className="space-y-6">
        {/* Perfil */}
        <section className="bg-surface border border-surface-light rounded-2xl overflow-hidden">
          <div className="p-4 bg-surface-light/30 border-b border-surface-light flex items-center gap-2">
            <User size={18} className="text-primary" />
            <h2 className="font-bold">Perfil</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Nome completo</label>
                <input type="text" defaultValue="João da Silva" className="w-full bg-background border border-surface-light rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">E-mail</label>
                <input type="email" defaultValue="joao@email.com" className="w-full bg-background border border-surface-light rounded-lg px-4 py-2 focus:outline-none focus:border-primary" />
              </div>
            </div>
            <Button>Salvar alterações</Button>
          </div>
        </section>

        {/* Plano Atual */}
        <section className="bg-surface border border-surface-light rounded-2xl overflow-hidden">
          <div className="p-4 bg-surface-light/30 border-b border-surface-light flex items-center gap-2">
            <CreditCard size={18} className="text-primary" />
            <h2 className="font-bold">Plano Atual</h2>
          </div>
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-lg">Plano Grana Smart - R$ 19,90/mês</p>
              <p className="text-sm text-success flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-success"></span> Ativo · Renovação em 23 dias
              </p>
            </div>
            <Button variant="outline">Gerenciar assinatura</Button>
          </div>
        </section>

        {/* Conexão WhatsApp */}
        <section className="bg-surface border border-surface-light rounded-2xl overflow-hidden">
          <div className="p-4 bg-surface-light/30 border-b border-surface-light flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            <h2 className="font-bold">Conexão WhatsApp</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-text-secondary mb-4">Envie suas despesas e ganhos diretamente pelo WhatsApp.</p>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-background border border-surface-light p-4 rounded-xl gap-4">
              <div>
                <p className="font-medium">+55 11 9XXXX-XXXX</p>
                <p className="text-sm text-success flex items-center gap-1 mt-1">Conectado ✅</p>
              </div>
              <Button variant="outline" className="text-danger hover:bg-danger/10 hover:border-danger/30">Desconectar</Button>
            </div>
          </div>
        </section>

        {/* Notificações & Segurança */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-surface border border-surface-light rounded-2xl overflow-hidden">
            <div className="p-4 bg-surface-light/30 border-b border-surface-light flex items-center gap-2">
              <Bell size={18} className="text-primary" />
              <h2 className="font-bold">Notificações</h2>
            </div>
            <div className="p-6 space-y-4">
              {['Alertas de orçamento', 'Resumo semanal', 'Metas concluídas'].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm">{item}</span>
                  <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-background rounded-full absolute top-0.5 right-0.5"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-surface border border-surface-light rounded-2xl overflow-hidden">
            <div className="p-4 bg-surface-light/30 border-b border-surface-light flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              <h2 className="font-bold">Segurança</h2>
            </div>
            <div className="p-6 space-y-3">
              <Button variant="outline" className="w-full justify-start">Alterar senha</Button>
              <Button variant="outline" className="w-full justify-start">Ativar autenticação 2FA</Button>
            </div>
          </section>
        </div>

        {/* Sobre */}
        <section className="bg-surface border border-surface-light rounded-2xl overflow-hidden">
          <div className="p-4 bg-surface-light/30 border-b border-surface-light flex items-center gap-2">
            <Info size={18} className="text-primary" />
            <h2 className="font-bold">Sobre</h2>
          </div>
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-text-secondary flex gap-4">
              <span>Versão 1.0.0</span>
              <a href="#" className="hover:text-text">Termos de Uso</a>
              <a href="#" className="hover:text-text">Privacidade</a>
            </div>
            <Button variant="outline" className="text-danger hover:bg-danger/10 hover:border-danger/30 gap-2 border-danger/20">
              <LogOut size={16} /> Sair da conta
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CircleDollarSign, Percent, Receipt, TrendingDown, TrendingUp, UserMinus, UserPlus, Users, Wallet } from "lucide-react";
import { BackTitle, Card, Empty, ErrorNote } from "@/components/ui/page";
import { KpiCard } from "@/components/admin/KpiCard";
import { CustomersChart, RevenueChart } from "@/components/admin/AdminCharts";
import { CostsForm } from "@/components/admin/CostsForm";
import { SyncBar } from "@/components/admin/SyncBar";
import { brl } from "@/lib/format";
import type { CostRow, Dashboard } from "@/lib/adminMetrics";

const pct = (cur: number, prev: number | undefined): number | null =>
  prev === undefined || prev === 0 ? null : ((cur - prev) / Math.abs(prev)) * 100;

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [costs, setCosts] = useState<CostRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/admin/metrics", { cache: "no-store" });
    if (res.status === 404 || res.status === 401) { router.replace("/menu"); return; }
    if (!res.ok) { setError("Não foi possível carregar as métricas."); setLoading(false); return; }
    const d = (await res.json()) as Dashboard;
    setData(d);
    setCosts(d.costs);
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="max-w-5xl mx-auto"><Empty>Carregando…</Empty></div>;

  const cur = data?.current;
  const prev = data?.previous ?? undefined;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <BackTitle title="Painel do dono" subtitle="Métricas do Jakash. Só você vê esta página." />
      <ErrorNote message={error} />

      {data && cur && (
        <>
          <SyncBar sync={data.sync} onDone={load} />
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={Users} label="Clientes pagantes" value={String(data.paying)} hint={`${data.trial} em teste · ${data.pastDue} em atraso`} />
            <KpiCard icon={Banknote} label="Vendido no mês" value={brl(cur.revenue)} delta={pct(cur.revenue, prev?.revenue)} hint={`${cur.payments} pagamento(s)`} />
            <KpiCard icon={CircleDollarSign} label="MRR (recorrente)" value={brl(data.mrr)} hint={`ARR ${brl(data.arr)}`} />
            <KpiCard icon={UserMinus} label="Desistências no mês" value={String(cur.churned)} delta={pct(cur.churned, prev?.churned)} invert hint={`churn ≈ ${data.churnRate.toFixed(1)}%`} />
            <KpiCard icon={UserPlus} label="Novos clientes no mês" value={String(cur.new_customers)} delta={pct(cur.new_customers, prev?.new_customers)} hint={`${data.payersTotal} já pagaram na vida`} />
            <KpiCard icon={Wallet} label="Custo operacional" value={brl(cur.operatingCost)} hint={cur.hasCosts ? undefined : "lance os custos abaixo"} />
            <KpiCard icon={TrendingUp} label="Lucro bruto" value={brl(cur.grossProfit)} delta={pct(cur.grossProfit, prev?.grossProfit)} />
            <KpiCard icon={cur.netProfit >= 0 ? Receipt : TrendingDown} label="Lucro líquido" value={brl(cur.netProfit)} delta={pct(cur.netProfit, prev?.netProfit)} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="font-extrabold text-lg mb-3">Vendas por mês</h2>
              <RevenueChart series={data.series} />
            </Card>
            <Card>
              <h2 className="font-extrabold text-lg mb-3">Novos clientes x cancelamentos</h2>
              <CustomersChart series={data.series} />
            </Card>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="font-extrabold text-lg mb-3">Planos</h2>
              {data.byPlan.length === 0 ? <Empty>Nenhum assinante ainda.</Empty> : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-200 dark:border-white/5">
                      <th className="py-2 font-bold">Plano</th>
                      <th className="py-2 font-bold text-right">Assinantes</th>
                      <th className="py-2 font-bold text-right">Vendido no mês</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {data.byPlan.map((p) => (
                      <tr key={p.plan}>
                        <td className="py-2.5 font-bold">{p.label}</td>
                        <td className="py-2.5 text-right tabular-nums">{p.subscribers}</td>
                        <td className="py-2.5 text-right tabular-nums">{brl(p.revenueMonth)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="text-xs text-gray-500 mt-3">
                Ticket médio {brl(data.arpu)}/cliente · LTV estimado {data.ltv === null ? "— (sem cancelamentos)" : brl(data.ltv)}
              </p>
            </Card>

            <Card>
              <h2 className="font-extrabold text-lg mb-3 flex items-center gap-2"><Percent size={18} /> Como o lucro é calculado</h2>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1.5">
                <li><b>Vendido</b> = pagamentos confirmados no mês (Asaas).</li>
                <li><b>Lucro bruto</b> = vendido − reembolsos − taxas do Asaas (reais, vindas da API), Vercel, Supabase, IA e WhatsApp.</li>
                <li><b>Custo operacional</b> = todos os custos lançados, menos impostos.</li>
                <li><b>Lucro líquido</b> = lucro bruto − domínio, outros e impostos.</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Vendas e cancelamentos contam a partir de agora (quando o painel passou a registrar os eventos do Asaas). O que você lança em &ldquo;Custos&rdquo; vem de você, não é automático.
              </p>
            </Card>
          </section>

          <CostsForm costs={costs} onSaved={load} />
        </>
      )}
    </div>
  );
}

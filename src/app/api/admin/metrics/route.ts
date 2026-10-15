import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/adminAuth';
import { PLANS } from '@/lib/plans';
import { buildDashboard, type RawMetrics } from '@/lib/adminMetrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { data, error } = await createAdminClient().rpc('admin_metrics', {
    p_cpf: PLANS.cpf.value,
    p_mei: PLANS.mei.value,
    p_months: 12,
  });
  if (error || !data) {
    console.error('admin_metrics error', error);
    return NextResponse.json({ error: 'Não foi possível carregar as métricas.' }, { status: 500 });
  }
  return NextResponse.json(buildDashboard(data as RawMetrics), { headers: { 'Cache-Control': 'no-store' } });
}

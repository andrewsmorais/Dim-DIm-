import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/adminAuth';
import { buildDashboard, type RawPeriod, type CurrentMetrics } from '@/lib/adminMetrics';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const from = url.searchParams.get('from') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const to = url.searchParams.get('to') || new Date().toISOString().split('T')[0];

  const admin = createAdminClient();
  const [period, syncState, snapshot] = await Promise.all([
    admin.rpc('admin_period', { p_from: from, p_to: to, p_grain: 'auto' }),
    admin.from('admin_sync_state').select('*').eq('id', 1).maybeSingle(),
    admin.from('profiles').select('subscription_status, subscription_plan').eq('is_admin', false),
  ]);

  if (period.error || !period.data) {
    console.error('admin_period error', period.error);
    return NextResponse.json({ error: 'Não foi possível carregar as métricas.' }, { status: 500 });
  }

  // Current snapshot metrics
  const profiles = snapshot.data || [];
  const paying = profiles.filter((p: any) => p.subscription_status === 'active' || p.subscription_status === 'past_due').length;
  const trial = profiles.filter((p: any) => p.subscription_status === 'trial').length;
  const active = profiles.filter((p: any) => p.subscription_status === 'active').length;
  const pastDue = profiles.filter((p: any) => p.subscription_status === 'past_due').length;

  // Calculate MRR from paying + trial
  const cpfCount = profiles.filter((p: any) => p.subscription_plan === 'cpf' && (p.subscription_status === 'active' || p.subscription_status === 'past_due' || p.subscription_status === 'trial')).length;
  const meiCount = profiles.filter((p: any) => p.subscription_plan === 'mei' && (p.subscription_status === 'active' || p.subscription_status === 'past_due' || p.subscription_status === 'trial')).length;
  const mrr = cpfCount * 19.9 + meiCount * 39.9;

  const current: CurrentMetrics = {
    paying,
    trial,
    active,
    pastDue,
    mrr,
    arr: mrr * 12,
  };

  const dashboard = buildDashboard(
    period.data as RawPeriod,
    current,
    syncState.data ? { last_sync_at: syncState.data.last_sync_at, last_full_sync_at: syncState.data.last_full_sync_at, last_result: syncState.data.last_result } : null
  );

  return NextResponse.json(dashboard, { headers: { 'Cache-Control': 'no-store' } });
}

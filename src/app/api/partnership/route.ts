import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Gestão compartilhada (casal). O convite vale 48h e é aceito com um código de uso único.
// Quem aceita passa a ver e editar os dados financeiros de quem convidou, e vice-versa (políticas RLS household_user_ids()).

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I
const INVITE_HOURS = 48;

const genCode = () => Array.from({ length: 10 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
const normalize = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
const expired = (iso: string | null) => Boolean(iso && new Date(iso).getTime() < Date.now());

function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '';
  const [user, domain] = email.split('@');
  return `${user.slice(0, 1)}***@${domain}`;
}

const bodySchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('invite') }),
  z.object({ action: z.literal('lookup'), code: z.string().min(6).max(24) }),
  z.object({ action: z.literal('accept'), code: z.string().min(6).max(24) }),
]);

async function currentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { user } = await currentUser();
  if (!user) return NextResponse.json({ error: 'Faça login' }, { status: 401 });
  const admin = createAdminClient();

  const { data: rows } = await admin.from('partnerships').select('id,owner_id,partner_id,status,invite_code,expires_at,accepted_at')
    .or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`).limit(2);
  const row = (rows ?? []).find((r) => r.status === 'accepted') ?? (rows ?? [])[0];
  if (!row) return NextResponse.json({ state: 'none' });

  if (row.status === 'pending') {
    if (expired(row.expires_at)) {
      await admin.from('partnerships').delete().eq('id', row.id);
      return NextResponse.json({ state: 'none' });
    }
    return NextResponse.json({ state: 'pending', code: row.invite_code, expiresAt: row.expires_at });
  }

  const otherId = row.owner_id === user.id ? row.partner_id : row.owner_id;
  const { data: profs } = await admin.from('profiles').select('id,full_name').in('id', [user.id, otherId]);
  const nameOf = (id: string) => profs?.find((p) => p.id === id)?.full_name ?? 'Parceiro(a)';
  return NextResponse.json({
    state: 'accepted',
    role: row.owner_id === user.id ? 'owner' : 'partner',
    me: { id: user.id, name: nameOf(user.id) },
    partner: { id: otherId, name: nameOf(otherId) },
    since: row.accepted_at,
  });
}

export async function POST(request: Request) {
  try {
    const { user } = await currentUser();
    if (!user) return NextResponse.json({ error: 'Faça login' }, { status: 401 });

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
    const body = parsed.data;
    const admin = createAdminClient();

    const { data: mine } = await admin.from('partnerships').select('id,owner_id,partner_id,status,invite_code,expires_at')
      .or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`);

    // ---- criar convite ----
    if (body.action === 'invite') {
      for (const r of mine ?? []) {
        if (r.status === 'accepted') return NextResponse.json({ error: 'Você já está em uma gestão compartilhada.' }, { status: 409 });
        if (r.owner_id === user.id) {
          if (!expired(r.expires_at)) return NextResponse.json({ code: r.invite_code, expiresAt: r.expires_at });
          await admin.from('partnerships').delete().eq('id', r.id);
        }
      }
      const expiresAt = new Date(Date.now() + INVITE_HOURS * 3600_000).toISOString();
      for (let attempt = 0; attempt < 3; attempt++) {
        const code = genCode();
        const { error } = await admin.from('partnerships').insert({ owner_id: user.id, invite_code: code, expires_at: expiresAt });
        if (!error) return NextResponse.json({ code, expiresAt });
        if (error.code !== '23505') { console.error('[partnership] invite', error); break; } // 23505 = código repetido: tenta de novo
      }
      return NextResponse.json({ error: 'Não foi possível criar o convite agora.' }, { status: 500 });
    }

    // ---- conferir / aceitar convite ----
    const code = normalize(body.code);
    const { data: row } = await admin.from('partnerships').select('id,owner_id,status,expires_at').eq('invite_code', code).maybeSingle();
    if (!row || row.status !== 'pending' || expired(row.expires_at)) {
      return NextResponse.json({ error: 'Código inválido ou expirado. Peça um novo a quem convidou.' }, { status: 404 });
    }
    if (row.owner_id === user.id) return NextResponse.json({ error: 'Esse é o código do seu próprio convite. Envie-o para a outra pessoa.' }, { status: 400 });
    if ((mine ?? []).length > 0) {
      return NextResponse.json({ error: 'Você já tem uma gestão compartilhada ou um convite aberto. Encerre antes de aceitar outro.' }, { status: 409 });
    }

    if (body.action === 'lookup') {
      const [{ data: prof }, { data: auth }] = await Promise.all([
        admin.from('profiles').select('full_name').eq('id', row.owner_id).maybeSingle(),
        admin.auth.admin.getUserById(row.owner_id),
      ]);
      return NextResponse.json({ ownerName: prof?.full_name ?? 'Alguém', ownerEmail: maskEmail(auth.user?.email) });
    }

    const { data: updated, error: updError } = await admin.from('partnerships')
      .update({ partner_id: user.id, status: 'accepted', accepted_at: new Date().toISOString(), invite_code: null, expires_at: null })
      .eq('id', row.id).eq('status', 'pending').select('id');
    if (updError || !updated?.length) {
      return NextResponse.json({ error: 'Esse convite não está mais disponível.' }, { status: 409 });
    }

    // Limites duplicados (mesma categoria ou geral): vale o de quem convidou.
    const { data: ownerBudgets } = await admin.from('budgets').select('category_id').eq('user_id', row.owner_id);
    const ownerKeys = new Set((ownerBudgets ?? []).map((b) => b.category_id ?? 'geral'));
    const { data: myBudgets } = await admin.from('budgets').select('id,category_id').eq('user_id', user.id);
    const dup = (myBudgets ?? []).filter((b) => ownerKeys.has(b.category_id ?? 'geral')).map((b) => b.id);
    if (dup.length) await admin.from('budgets').delete().in('id', dup);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[partnership] erro', error);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

// Encerra a parceria (ou cancela o convite). Cada um continua dono do que lançou.
export async function DELETE() {
  const { supabase, user } = await currentUser();
  if (!user) return NextResponse.json({ error: 'Faça login' }, { status: 401 });
  const { error } = await supabase.from('partnerships').delete().or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`);
  if (error) return NextResponse.json({ error: 'Não foi possível encerrar agora.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

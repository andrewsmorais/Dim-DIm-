export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

// Status de entrega das respostas da Jaki. Nunca vira lançamento: só atualiza a linha da fila
// cuja resposta tem esse wamid. Falha aqui não derruba o webhook (é informação de diagnóstico).
type DeliveryStatus = { id?: string; status?: string; timestamp?: string; errors?: { code?: number; title?: string }[] };
const STATUS_ORDER: Record<string, number> = { sent: 1, delivered: 2, read: 3 };

async function applyDeliveryStatus(supabase: SupabaseClient, st: DeliveryStatus) {
  if (!st.id || !st.status) return;

  if (st.status === 'failed') {
    // Ex.: 131047 = fora da janela de 24 h (precisa de modelo aprovado). Sem telefone nem texto no log.
    const codes = (st.errors ?? []).map((e) => `${e.code ?? '?'}`).join(',');
    console.warn(`[whatsapp] entrega falhou: wamid=${st.id} codes=${codes || '-'}`);
  }

  // Status pode chegar fora de ordem (read antes de delivered): nunca volta para um estágio anterior.
  const rank = STATUS_ORDER[st.status];
  const lowerStages = rank ? Object.entries(STATUS_ORDER).filter(([, r]) => r < rank).map(([s]) => s) : [];
  let q = supabase
    .from('whatsapp_inbox')
    .update({ reply_status: st.status, reply_status_at: new Date(Number(st.timestamp) * 1000 || Date.now()).toISOString() })
    .eq('reply_wamid', st.id);
  if (rank) q = q.or(['reply_status.is.null', ...lowerStages.map((s) => `reply_status.eq.${s}`)].join(','));
  const { error } = await q;
  if (error) console.warn(`[whatsapp] status não gravado: ${error.message}`);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return new NextResponse(challenge, { 
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } else {
      return new NextResponse("Token de verificação inválido", { status: 403 });
    }
  } catch (error) {
    console.error("WhatsApp Verify Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const secret = process.env.META_APP_SECRET;

    if (!secret) {
      console.error("META_APP_SECRET is not configured");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    const expectedSignature = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;
    
    try {
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch (error) {
      console.error("Signature verification error:", error);
      return NextResponse.json({ error: "Invalid signature format" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.object === "whatsapp_business_account") {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // A Meta pode agrupar várias mensagens (e vários entries/changes) num único POST.
      for (const entry of body.entry ?? []) {
        for (const change of entry?.changes ?? []) {
          const value = change?.value;
          for (const message of value?.messages ?? []) {
            const wamid = message?.id;
            const phone_number = value?.contacts?.[0]?.wa_id ?? message?.from;

            if (!wamid || !phone_number) {
              console.warn("WhatsApp webhook: mensagem sem id ou remetente. Ignorando.");
              continue;
            }

            // raw_payload guarda SÓ esta mensagem, no mesmo formato que o worker já lê
            // (entry[0].changes[0].value.messages[0]).
            const singlePayload = {
              object: body.object,
              entry: [{
                id: entry.id,
                changes: [{
                  field: change.field,
                  value: { ...value, messages: [message] },
                }],
              }],
            };

            // Atomic Insert into the Queue
            const { error: dbError } = await supabase
              .from('whatsapp_inbox')
              .insert({ wamid, phone_number, raw_payload: singlePayload });

            if (dbError) {
              // 23505 = wamid duplicado (reenvio da Meta): ok, responde 200 para ela parar de tentar.
              if (dbError.code === '23505') {
                console.log(`Duplicate webhook received for wamid: ${wamid}. Ignoring.`);
              } else {
                console.error("Queue insert error:", dbError);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
              }
            }
          }
          for (const st of (value?.statuses ?? []) as DeliveryStatus[]) {
            await applyDeliveryStatus(supabase, st);
          }
        }
      }
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Not a WhatsApp API event" }, { status: 404 });
    }
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import crypto from 'crypto';

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

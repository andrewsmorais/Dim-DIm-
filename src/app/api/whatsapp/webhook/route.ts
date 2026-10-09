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
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (message && contact) {
        const phone_number = contact.wa_id;
        const wamid = message.id; // Correct extraction of wamid

        if (!wamid) {
           return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
        }

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Atomic Insert into the Queue
        const { error: dbError } = await supabase
          .from('whatsapp_inbox')
          .insert({
            wamid: wamid,
            phone_number: phone_number,
            raw_payload: body
          });

        if (dbError) {
          // If the error is a UNIQUE constraint violation (code 23505), it's a duplicate retry from Meta.
          // We must return 200 OK to stop Meta from retrying.
          if (dbError.code === '23505') {
             console.log(`Duplicate webhook received for wamid: ${wamid}. Ignoring.`);
          } else {
             console.error("Queue insert error:", dbError);
             return NextResponse.json({ error: "Database error" }, { status: 500 });
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

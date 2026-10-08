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

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

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
        
        let userMessage = "";
        const imageUrl = undefined;

        if (message.type === "text") {
          userMessage = message.text.body;
        } else if (message.type === "image") {
          userMessage = "[FOTO RECEBIDA] Leia este recibo.";
        } else if (message.type === "audio") {
          userMessage = "[ÁUDIO RECEBIDO] O usuário enviou um áudio.";
        } else {
          return NextResponse.json({ success: true }); 
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const aiResponse = await fetch(`${baseUrl}/api/ai/process-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, imageUrl })
        });
        
        const aiData = await aiResponse.json();

        if (aiData.success && aiData.data) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          // EXACT MATCH FOR SECURITY
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('whatsapp_number', phone_number)
            .single();

          if (profile) {
            const { data: categoryData } = await supabase
              .from('categories')
              .select('id')
              .ilike('name', aiData.data.category)
              .single();

            await supabase.from('transactions').insert({
              user_id: profile.id,
              amount: aiData.data.amount,
              description: aiData.data.description,
              category_id: categoryData?.id || null,
              type: aiData.data.type,
              date: aiData.data.date,
              origin: 'whatsapp'
            });

            await supabase.from('chat_history').insert([
              { user_id: profile.id, message_role: 'user', content: userMessage },
              { user_id: profile.id, message_role: 'assistant', content: aiData.reply }
            ]);
          } else {
            aiData.reply = "Seu número não está cadastrado. Acesse o painel do Grana Smart e ative seu WhatsApp! 📱";
          }
        }

        const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
        const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (WA_TOKEN && WA_PHONE_ID) {
          await fetch(`https://graph.facebook.com/v17.0/${WA_PHONE_ID}/messages`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${WA_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: phone_number,
              type: "text",
              text: { body: aiData.reply }
            })
          });
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

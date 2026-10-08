import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// METODO GET: VERIFICAÇÃO DO WEBHOOK (META)
// ==========================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook do WhatsApp verificado com sucesso!");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return NextResponse.json({ error: "Token de verificação inválido" }, { status: 403 });
  }
}

// ==========================================
// METODO POST: RECEBIMENTO DE MENSAGENS
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verifica se é evento do WhatsApp
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (message && contact) {
        const phone_number = contact.wa_id;
        
        let userMessage = "";

        // Lidar com Texto
        if (message.type === "text") {
          userMessage = message.text.body;
        } 
        // Lidar com Áudio e Imagem (Futuramente baixar mídia e usar Gemini Vision/Whisper)
        else if (message.type === "image") {
          userMessage = "[FOTO RECEBIDA] O usuário enviou a foto de um recibo/nota. (Integração com Gemini Vision necessária)";
        } else if (message.type === "audio") {
          userMessage = "[ÁUDIO RECEBIDO] O usuário enviou um áudio. (Integração de transcrição necessária)";
        } else {
          return NextResponse.json({ success: true }); // Ignorar outros tipos
        }

        // ====================================================
        // 1. PROCESSAR MENSAGEM COM GOOGLE AI STUDIO (GEMINI)
        // ====================================================
        const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY;
        const prompt = `Você é o Grana Smart. Leia a mensagem e retorne APENAS um JSON válido com { transaction: { amount, description, category, type, date }, reply: "mensagem amigavel" }. \nHoje é ${new Date().toISOString().split('T')[0]}.\nMensagem: "${userMessage}"`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        const geminiData = await geminiRes.json();
        
        let aiResult;
        try {
          const aiResponseText = geminiData.candidates[0].content.parts[0].text;
          aiResult = JSON.parse(aiResponseText);
        } catch (e) {
          console.error("Erro ao fazer parse do Gemini JSON:", e);
          aiResult = { transaction: null, reply: "Deu um tilt aqui! Manda de novo de um jeito diferente? 😅" };
        }

        // ====================================================
        // 2. SALVAR NO SUPABASE
        // ====================================================
        if (aiResult.transaction) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          // 2.1 Encontrar o usuário pelo WhatsApp
          // No Brasil, os números podem vir com ou sem o dígito 9. Usaremos um like % ou match.
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .filter('whatsapp_number', 'ilike', `%${phone_number.substring(4)}%`) // Pula DDI e DDD grosseiramente para simplificar, em prod use validação libphonenumber
            .single();

          if (profile) {
            // 2.2 Encontrar a ID da categoria (Ex: 'Alimentação')
            const { data: categoryData } = await supabase
              .from('categories')
              .select('id')
              .ilike('name', aiResult.transaction.category)
              .single();

            // 2.3 Inserir transação
            await supabase.from('transactions').insert({
              user_id: profile.id,
              amount: aiResult.transaction.amount,
              description: aiResult.transaction.description,
              category_id: categoryData?.id || null,
              type: aiResult.transaction.type,
              date: aiResult.transaction.date,
              origin: 'whatsapp'
            });

            // 2.4 Salvar histórico de chat
            await supabase.from('chat_history').insert([
              { user_id: profile.id, message_role: 'user', content: userMessage },
              { user_id: profile.id, message_role: 'assistant', content: aiResult.reply }
            ]);
          } else {
            aiResult.reply = "Não encontrei seu número cadastrado. Faça login no app e atualize seu WhatsApp! 📱";
          }
        }

        // ====================================================
        // 3. RESPONDER NO WHATSAPP
        // ====================================================
        const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
        const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

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
            text: { body: aiResult.reply }
          })
        });

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

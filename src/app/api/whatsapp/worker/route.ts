import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { whatsappGate } from '@/lib/whatsappGate';
import { sendText } from '@/lib/whatsappApi';

const MEDIA_NOT_SUPPORTED_REPLY =
  "Por enquanto eu só entendo texto 🙂 Me manda assim: \"gastei 35 no almoço\". Foto e áudio estão chegando!";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.WORKER_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const workerId = crypto.randomUUID();

    // 1. Acquire task
    const { data: tasks, error: acquireError } = await supabase.rpc('acquire_whatsapp_task', {
      p_worker_id: workerId,
      p_lease_seconds: 45 // 45 seconds lease for Serverless safety
    });

    if (acquireError || !tasks || tasks.length === 0) {
      return NextResponse.json({ message: 'No pending tasks' }, { status: 200 });
    }

    const task = tasks[0];
    const { id: taskId, wamid, phone_number, raw_payload, wa_replied } = task;
    let { ai_response, db_synced } = task;

    console.log(`[Worker ${workerId}] Acquired task ${taskId} (wamid: ${wamid})`);

    // Helper function to handle failure backoff
    const failTask = async (errorMessage: string, isPermanent = false) => {
      console.error(`[Worker ${workerId}] Task Failed: ${errorMessage}`);
      const newStatus = isPermanent || task.retry_count >= 3 ? 'failed' : 'pending';
      const backoffMinutes = Math.pow(2, task.retry_count); // 1, 2, 4, 8 minutes
      
      await supabase
        .from('whatsapp_inbox')
        .update({
           status: newStatus,
           last_error: errorMessage,
           locked_until: null,
           worker_id: null,
           next_attempt_at: new Date(Date.now() + backoffMinutes * 60000).toISOString()
        })
        .match({ id: taskId, worker_id: workerId }); // Fencing token

      return NextResponse.json({ error: errorMessage, status: newStatus }, { status: isPermanent ? 400 : 500 });
    };

    // --- CHECKPOINT 1: AI Processing ---
    if (!ai_response) {
      const message = raw_payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) {
         await failTask('Malformed payload: no message', true);
         return NextResponse.json({ success: true });
      }

      const isText = message.type === "text" && typeof message.text?.body === "string";

      // Vinculação do número: "conectar ABC123" (código gerado no painel). Não usa IA.
      const linkMatch = isText
        ? String(message.text.body).trim().match(/^(?:conectar|vincular)\s+([A-Za-z0-9]{6})$/i)
        : null;

      if (message.type === "reaction") {
        // Reação (👍 numa resposta da Jaki) não é um pedido: conclui sem IA e sem responder.
        ai_response = { success: false, skipDb: true, silent: true, reply: "" };
      } else if (linkMatch) {
        const { data: linkResult, error: linkError } = await supabase.rpc('link_whatsapp_number', {
          p_code: linkMatch[1],
          p_phone: phone_number
        });
        if (linkError) return await failTask(`Link failed: ${linkError.message}`);

        const linkReplies: Record<string, string> = {
          ok: "Pronto! ✅ Seu WhatsApp está conectado. Agora é só me mandar seus gastos, tipo: \"gastei 35 no almoço\".",
          in_use: "Esse número já está conectado a outra conta. Fale com o suporte se precisar de ajuda.",
          invalid: "Esse código é inválido ou expirou. Gere um novo no painel e me mande de novo."
        };
        ai_response = { success: false, link: true, reply: linkReplies[String(linkResult)] ?? linkReplies.invalid };
      } else {
        // Antes de gastar IA: número desconhecido, assinatura inativa ou limite diário estourado.
        const gate = await whatsappGate(supabase, phone_number);

        if (gate) {
          ai_response = gate;
        } else if (!isText) {
          // Foto, áudio, vídeo, documento, figurinha, localização... O app ainda não baixa a mídia da Meta,
          // então a IA nunca veria o conteúdo. Melhor dizer a verdade do que deixar a IA chutar.
          ai_response = { success: false, skipDb: true, reply: MEDIA_NOT_SUPPORTED_REPLY };
        } else {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          const aiFetchRes = await fetch(`${baseUrl}/api/ai/process-message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.WORKER_SECRET}`
            },
            body: JSON.stringify({ message: message.text.body, imageUrl: undefined })
          });

          if (!aiFetchRes.ok) {
             return await failTask(`AI Service returned ${aiFetchRes.status}`);
          }

          ai_response = await aiFetchRes.json();
        }
      }

      // Persist AI Response using fencing token and strict lease validation
      const { error: updateAiError, data: aiUpdated } = await supabase
        .from('whatsapp_inbox')
        .update({ ai_response })
        .eq('id', taskId)
        .eq('worker_id', workerId)
        .gte('locked_until', new Date().toISOString())
        .select('id');

      if (updateAiError || !aiUpdated || aiUpdated.length === 0) {
        return NextResponse.json({ error: "Lease expired or task lost at Checkpoint 1" }, { status: 409 });
      }
    }

    // --- CHECKPOINT 2: Database Sync ---
    // Mensagem de vinculação não grava chat nem transação: só marca como sincronizada.
    if (!db_synced && (ai_response?.link || ai_response?.skipDb)) {
      const { data: linkSynced, error: linkSyncError } = await supabase
        .from('whatsapp_inbox')
        .update({ db_synced: true })
        .eq('id', taskId)
        .eq('worker_id', workerId)
        .gte('locked_until', new Date().toISOString())
        .select('id');
      if (linkSyncError || !linkSynced || linkSynced.length === 0) {
        return NextResponse.json({ error: "Lease expired at CP2" }, { status: 409 });
      }
      db_synced = true;
    }

    if (!db_synced) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('whatsapp_number', phone_number)
        .single();

      if (profile) {
        const userMsgContent = raw_payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || 'Media';
        const aiReplyContent = ai_response.reply || 'Processado.';

        if (ai_response.success === false || !ai_response.data || (Array.isArray(ai_response.data) && ai_response.data.length === 0)) {
           // Rule: If there are no valid transactions, we just save chat history safely, skipping financial commit
           const { error: chatError } = await supabase.from('chat_history').insert([
             { user_id: profile.id, message_role: 'user', content: userMsgContent },
             { user_id: profile.id, message_role: 'assistant', content: aiReplyContent }
           ]);
           if (chatError) return await failTask(`Chat commit failed: ${chatError.message}`);
           
           const { error: updateSyncError, data: syncUpdated } = await supabase.from('whatsapp_inbox').update({ db_synced: true })
            .eq('id', taskId).eq('worker_id', workerId).gte('locked_until', new Date().toISOString()).select('id');
           if (updateSyncError || !syncUpdated || syncUpdated.length === 0) return NextResponse.json({ error: "Lease expired at CP2" }, { status: 409 });
           
           db_synced = true;
        } else {
           // Financial Commit 
           const txArray = Array.isArray(ai_response.data) ? ai_response.data : [ai_response.data];
           
           const txToCommit = await Promise.all(txArray.map(async (tx: Record<string, unknown>, index: number) => {
              let categoryId = null;
              if (tx.category) {
                  const { data: categoryData } = await supabase
                    .from('categories')
                    .select('id')
                    .ilike('name', String(tx.category))
                    .is('parent_id', null)
                    .or(`user_id.eq.${profile.id},is_default.eq.true`)
                    .limit(1);
                  categoryId = categoryData?.[0]?.id || null;
              }

              return {
                amount: tx.amount,
                description: tx.description,
                category_id: categoryId,
                type: tx.type,
                date: tx.date,
                index: index
              };
           }));

           const { error: commitError } = await supabase.rpc('commit_financial_transactions', {
               p_task_id: taskId,
               p_worker_id: workerId,
               p_user_id: profile.id,
               p_transactions: txToCommit,
               p_user_message: userMsgContent,
               p_ai_reply: aiReplyContent
           });

           if (commitError) return await failTask(`Transaction commit failed: ${commitError.message}`);
           db_synced = true;
        }
      } else {
        ai_response.reply = "Seu número não está cadastrado. Acesse o painel do Jakash e ative seu WhatsApp! 📱";
      }
    }

    // --- CHECKPOINT 3: Send WhatsApp Reply ---
    // Acima do limite diário: não responde (o aviso já foi dado na primeira mensagem excedente).
    if (!wa_replied && ai_response?.silent) {
      await supabase.from('whatsapp_inbox')
        .update({ wa_replied: true, status: 'completed', worker_id: null, locked_until: null })
        .eq('id', taskId).eq('worker_id', workerId);
      return NextResponse.json({ success: true, taskId, silent: true }, { status: 200 });
    }

    if (!wa_replied) {
      const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
      const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!WA_TOKEN || !WA_PHONE_ID) return await failTask('Missing WA Credentials', true);

      // RISK: Meta API is not transactional with our PostgreSQL. 
      // If Meta receives the request but times out responding, the worker will retry 
      // and send a duplicate WhatsApp message to the user.
      const waRes = await sendText(phone_number, ai_response.reply || "Desculpe, não entendi.");

      if (!waRes.ok) {
         return await failTask(`WhatsApp API returned ${waRes.status}${waRes.errorCode ? ` (code ${waRes.errorCode})` : ''}`);
      }

      // Guarda o wamid da resposta para casar com os status de entrega do webhook. É só diagnóstico:
      // se a coluna ainda não existir (migration pendente), segue sem travar a resposta.
      if (waRes.wamid) {
        const { error: replyIdError } = await supabase.from('whatsapp_inbox').update({ reply_wamid: waRes.wamid }).eq('id', taskId);
        if (replyIdError) console.warn(`[Worker ${workerId}] reply_wamid não gravado: ${replyIdError.message}`);
      }

      // Mark as completed securely
      const { data: finished } = await supabase
        .from('whatsapp_inbox')
        .update({ wa_replied: true, status: 'completed', worker_id: null, locked_until: null })
        .eq('id', taskId)
        .eq('worker_id', workerId)
        .gte('locked_until', new Date().toISOString())
        .select('id');
        
      if (!finished || finished.length === 0) {
         console.warn(`[Worker ${workerId}] Task finished but lease was lost at Checkpoint 3.`);
      }
    }

    console.log(`[Worker ${workerId}] Task ${taskId} successfully completed.`);
    return NextResponse.json({ success: true, taskId }, { status: 200 });

  } catch (error: unknown) {
    console.error("Worker Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

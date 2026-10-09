import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

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
      
      let userMessage = "";
      if (message?.type === "text") {
        userMessage = message.text.body;
      } else if (message?.type === "image") {
        userMessage = "[FOTO RECEBIDA] Leia este recibo.";
      } else if (message?.type === "audio") {
        userMessage = "[ÁUDIO RECEBIDO] O usuário enviou um áudio.";
      } else {
         await failTask('Unsupported message type', true);
         return NextResponse.json({ success: true });
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const aiFetchRes = await fetch(`${baseUrl}/api/ai/process-message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WORKER_SECRET}`
        },
        body: JSON.stringify({ message: userMessage, imageUrl: undefined })
      });

      if (!aiFetchRes.ok) {
         return await failTask(`AI Service returned ${aiFetchRes.status}`);
      }
      
      ai_response = await aiFetchRes.json();

      // Persist AI Response using fencing token and strict lease validation
      const { error: updateAiError, count: aiUpdateCount } = await supabase
        .from('whatsapp_inbox')
        .update({ ai_response })
        .eq('id', taskId)
        .eq('worker_id', workerId)
        .gte('locked_until', new Date().toISOString())
        .select('id');

      if (updateAiError || !aiUpdateCount || aiUpdateCount === 0) {
        return NextResponse.json({ error: "Lease expired or task lost at Checkpoint 1" }, { status: 409 });
      }
    }

    // --- CHECKPOINT 2: Database Sync ---
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
           
           const { error: updateSyncError, count: syncCount } = await supabase.from('whatsapp_inbox').update({ db_synced: true })
            .eq('id', taskId).eq('worker_id', workerId).gte('locked_until', new Date().toISOString()).select('id');
           if (updateSyncError || !syncCount || syncCount === 0) return NextResponse.json({ error: "Lease expired at CP2" }, { status: 409 });
           
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
    if (!wa_replied) {
      const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
      const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!WA_TOKEN || !WA_PHONE_ID) return await failTask('Missing WA Credentials', true);

      // RISK: Meta API is not transactional with our PostgreSQL. 
      // If Meta receives the request but times out responding, the worker will retry 
      // and send a duplicate WhatsApp message to the user.
      const waRes = await fetch(`https://graph.facebook.com/v17.0/${WA_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone_number,
          type: "text",
          text: { body: ai_response.reply || "Desculpe, não entendi." }
        })
      });

      if (!waRes.ok) {
         return await failTask(`WhatsApp API returned ${waRes.status}`);
      }

      // Mark as completed securely
      const { count: finishCount } = await supabase
        .from('whatsapp_inbox')
        .update({ wa_replied: true, status: 'completed', worker_id: null, locked_until: null })
        .eq('id', taskId)
        .eq('worker_id', workerId)
        .gte('locked_until', new Date().toISOString())
        .select('id');
        
      if (!finishCount || finishCount === 0) {
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

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Data de hoje no fuso do Brasil (toISOString usa UTC e vira o dia depois das 21h).
function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
}

// Nada que a IA devolver vai para o banco sem passar por aqui.
const transactionSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000).transform((n) => Math.round(n * 100) / 100),
  description: z.string().trim().min(1).max(200),
  category: z.string().trim().max(60).nullish(),
  type: z.enum(['income', 'expense']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((d) => !Number.isNaN(Date.parse(d)), 'data inválida'),
});
const transactionsSchema = z.union([transactionSchema, z.array(transactionSchema).min(1).max(20)]);

export async function POST(request: Request) {
  try {
    // Internal Worker Auth (System-to-System)
    const authHeader = request.headers.get('authorization');
    const workerSecret = process.env.WORKER_SECRET;
    const isInternal = workerSecret && authHeader === `Bearer ${workerSecret}`;

    // Validar sessão de usuário logado (Web App Auth)
    let isWebAuthenticated = false;
    if (!isInternal) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        isWebAuthenticated = true;
      }
    }

    if (!isInternal && !isWebAuthenticated) {
      console.error('[SECURITY] Unauthorized access attempt to AI endpoint.');
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { message, imageUrl } = await request.json();

    if (!message && !imageUrl) {
      return NextResponse.json({ error: 'Mensagem ou imagem é obrigatória' }, { status: 400 });
    }

    // Lê o prompt do sistema
    const promptPath = path.join(process.cwd(), 'prompts', 'financial-agent-system.md');
    const systemPromptText = fs.readFileSync(promptPath, 'utf8');

    // Monta o array de conteúdo dinamicamente se tiver imagem (Vision)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentArray: any[] = [];
    
    if (message) {
      contentArray.push({ type: "text", text: `Hoje é ${todayInSaoPaulo()}.\nMensagem do usuário: "${message}"` });
    } else {
      contentArray.push({ type: "text", text: `Hoje é ${todayInSaoPaulo()}.\nO usuário enviou apenas a imagem em anexo.` });
    }

    if (imageUrl) {
      contentArray.push({
        type: "image_url",
        image_url: { url: imageUrl }
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPromptText },
        { role: "user", content: contentArray }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponse = completion.choices[0]?.message?.content || "{}";
    let parsedData: { transaction?: unknown; reply?: string };
    try {
      parsedData = JSON.parse(aiResponse);
    } catch {
      return NextResponse.json({ success: false, reply: "Não consegui entender essa mensagem. Pode mandar de novo?" }, { status: 200 });
    }

    if (parsedData.transaction) {
      const validated = transactionsSchema.safeParse(parsedData.transaction);
      if (!validated.success) {
        console.warn('[AI] Transação rejeitada pela validação:', validated.error.issues);
        return NextResponse.json({
          success: false,
          reply: "Não consegui ter certeza do valor ou da data. Pode mandar de novo, com o valor?"
        }, { status: 200 });
      }
      return NextResponse.json({
        success: true,
        data: validated.data,
        reply: parsedData.reply
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        reply: parsedData.reply || "Não consegui extrair uma transação dessa mensagem."
      }, { status: 200 });
    }

  } catch (error: unknown) {
    console.error('OpenAI Error:', error);
    return NextResponse.json({ error: 'Erro interno ao processar IA' }, { status: 500 });
  }
}

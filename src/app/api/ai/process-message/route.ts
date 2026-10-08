import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
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
      contentArray.push({ type: "text", text: `Hoje é ${new Date().toISOString().split('T')[0]}.\nMensagem do usuário: "${message}"` });
    } else {
      contentArray.push({ type: "text", text: `Hoje é ${new Date().toISOString().split('T')[0]}.\nO usuário enviou apenas a imagem em anexo.` });
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
    const parsedData = JSON.parse(aiResponse);

    if (parsedData.transaction) {
      return NextResponse.json({
        success: true,
        data: parsedData.transaction,
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

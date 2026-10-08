import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook do WhatsApp (Meta) verificado com sucesso!");
      return new NextResponse(challenge, { status: 200 });
    } else {
      return NextResponse.json({ error: "Token de verificação inválido" }, { status: 403 });
    }
  } catch (error) {
    console.error("WhatsApp Verify Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

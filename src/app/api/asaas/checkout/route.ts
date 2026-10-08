import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, cpfCnpj, whatsapp_number } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Email e Nome são obrigatórios' }, { status: 400 });
    }

    const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
    if (!ASAAS_API_KEY) {
      return NextResponse.json({ error: 'Configuração do Asaas ausente no servidor' }, { status: 500 });
    }

    // 1. Tentar encontrar ou criar cliente no Asaas
    let customerId = '';
    
    // Busca cliente por email
    const searchRes = await fetch(`https://sandbox.asaas.com/api/v3/customers?email=${email}`, {
      headers: { 'access_token': ASAAS_API_KEY }
    });
    const searchData = await searchRes.json();

    if (searchData.data && searchData.data.length > 0) {
      customerId = searchData.data[0].id;
    } else {
      // Cria novo cliente
      const createCustomerRes = await fetch('https://sandbox.asaas.com/api/v3/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_API_KEY
        },
        body: JSON.stringify({
          name: name,
          email: email,
          cpfCnpj: cpfCnpj,
          mobilePhone: whatsapp_number
        })
      });
      const newCustomer = await createCustomerRes.json();
      if (newCustomer.errors) {
        return NextResponse.json({ error: newCustomer.errors[0].description }, { status: 400 });
      }
      customerId = newCustomer.id;
    }

    // 2. Criar a assinatura (R$ 19,90)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 7); // 7 dias de trial

    const subscriptionRes = await fetch('https://sandbox.asaas.com/api/v3/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: "UNDEFINED", // Deixa o usuário escolher (Cartão, Pix, Boleto)
        value: 19.90,
        nextDueDate: nextDueDate.toISOString().split('T')[0],
        cycle: "MONTHLY",
        description: "Assinatura Grana Smart - Plano Zap"
      })
    });

    const subscriptionData = await subscriptionRes.json();
    if (subscriptionData.errors) {
      return NextResponse.json({ error: subscriptionData.errors[0].description }, { status: 400 });
    }

    // Retorna a URL de pagamento ou invoiceUrl (no Asaas, invoiceUrl da primeira cobrança)
    // O Asaas não retorna a URL do checkout da assinatura diretamente, 
    // mas retorna o ID. Você precisa redirecionar o usuário para gerenciar ou pagar a primeira fatura.
    // Em produção real, você usa invoiceUrl ou redireciona pro checkout configurado.
    
    // Aqui enviamos a URL para onde a interface deverá redirecionar.
    // Caso seja gerado um link de fatura avulso ou link da assinatura.
    const paymentLink = `https://sandbox.asaas.com/c/${subscriptionData.id}`;

    return NextResponse.json({ 
      success: true, 
      subscriptionId: subscriptionData.id,
      paymentUrl: paymentLink 
    });

  } catch (error: unknown) {
    console.error('Asaas Checkout Error:', error);
    return NextResponse.json({ error: 'Erro interno ao processar assinatura.' }, { status: 500 });
  }
}

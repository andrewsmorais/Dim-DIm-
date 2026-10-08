# 🚀 Guia de Teste da Inteligência Artificial (OpenAI)

Este documento explica como testar o cérebro financeiro do Grana Smart sem precisar plugar o WhatsApp imediatamente.

## 1. Configuração de Ambiente
Certifique-se de que o arquivo `.env.local` na raiz do projeto contenha a sua chave da OpenAI válida e com saldo ativo ($5.00):
```env
OPENAI_API_KEY=sk-sua-chave-aqui
```

## 2. Iniciar o Projeto
Abra o terminal na pasta do projeto e rode:
```bash
npm run dev
```
Isso iniciará a aplicação Next.js no `http://localhost:3000`.

## 3. Testar via Interface Visual (Recomendado)
Foi criado um componente incrível chamado `<AITestInterface />`. 
Você pode importar e renderizar esse componente em qualquer página temporária (por exemplo, dentro do `src/app/page.tsx` durante o desenvolvimento) ou acessar uma rota de testes.

Nesta interface você verá:
- Um campo para digitar "Gastei 50 no mercadão de madureira hoje".
- Um campo opcional para colocar a URL de uma foto de comprovante (para testar o Vision).
- Ao clicar em "Enviar para IA", você verá a mágica:
  - O **JSON estruturado** (que vai pro Supabase: `{ amount: 50.0, description: "Mercado", category: "Alimentação", type: "expense" }`).
  - A **Mensagem do Zap** (a resposta amigável: "Lançado! 🛒 R$ 50,00 registrado com sucesso em Alimentação").

## 4. Testar via API (Postman / cURL)
Você também pode bater direto na rota usando POST:
**URL:** `http://localhost:3000/api/ai/process-message`
**Method:** POST
**Body (JSON):**
```json
{
  "message": "Recebi 1500 de salário hoje cedo"
}
```

## 5. Como o Supabase Recebe a Transação?
Quando estiver rodando o fluxo completo pelo WhatsApp, a rota `/api/whatsapp/webhook` intercepta a mensagem da Meta, chama esta nossa API interna de IA (`/api/ai/process-message`), e então utiliza a biblioteca `@supabase/supabase-js` com a `SUPABASE_SERVICE_ROLE_KEY` para injetar os dados diretamente na tabela `transactions`. 

Tudo funciona 100% de forma autônoma e assíncrona.

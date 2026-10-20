# WhatsApp (Meta Cloud API) — como colocar o assistente no ar

## Modelo
Um único número oficial (o "assistente"). O usuário gera um código no painel
(Configurações → Integração WhatsApp) e manda `conectar ABC123` para esse número.
Isso vincula o WhatsApp dele à conta, sem OTP pago e sem risco de alguém usar o número de outra pessoa.

## Variáveis de ambiente (Vercel)
- `WHATSAPP_BOT_NUMBER` — número do assistente, só dígitos com DDI (ex.: 5511999998888). Usado no link "Abrir o WhatsApp".
- `WHATSAPP_ACCESS_TOKEN` — token de **usuário do sistema** (longa duração), com `whatsapp_business_messaging` e `whatsapp_business_management`.
- `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `META_APP_SECRET`
- `WORKER_SECRET` — o mesmo valor guardado no Vault do Supabase (`WORKER_SECRET`).
- `NEXT_PUBLIC_SITE_URL` — https://www.jakash.app

## Passo a passo na Meta (produção)
1. Verificar a empresa em Meta Business (Configurações do negócio → Central de segurança).
2. Registrar um número **dedicado** na WABA (não pode estar em uso no app WhatsApp comum).
3. Nome de exibição aprovado.
4. Webhook: em Meta for Developers › app Jakash › Casos de uso › Conectar no WhatsApp › Webhooks, na aba **Whatsapp Business Account** (não na aba "User", que é do Facebook em geral): URL `https://www.jakash.app/api/whatsapp/webhook`, token = `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, e o campo `messages` com a assinatura ligada.
5. `POST /{WABA_ID}/subscribed_apps` para o app receber mensagens de números reais. Para conferir antes, `GET /{WABA_ID}/subscribed_apps` no Graph API Explorer (a lista vazia significa que falta inscrever).
6. Gerar o token de usuário do sistema e colocar na Vercel (`WHATSAPP_ACCESS_TOKEN`). Depois de mudar variável na Vercel, faça um novo deploy.

Obs.: o número de teste da Meta só conversa com até 5 destinatários cadastrados.

## Mensagem real não chega? Confira nesta ordem
1. `messages` assinado na aba **Whatsapp Business Account** (passo 4).
2. `GET /{WABA_ID}/subscribed_apps` mostra o app Jakash (passo 5).
3. `WHATSAPP_PHONE_NUMBER_ID` na Vercel é o ID do número (não o número de telefone nem o ID da conta).
4. Mande "oi" do celular para o número oficial e olhe os logs da Vercel em `/api/whatsapp/webhook`:
   - nenhum POST: falta o passo 1 ou 2;
   - POST com 401: `META_APP_SECRET` diferente do app que envia;
   - POST 200 e nada em `whatsapp_inbox`: a mensagem veio sem `messages[]` (confira se é um status).
5. A resposta não chega, mas a fila mostra `completed`: veja `reply_status` em `whatsapp_inbox` (a Meta avisa `failed` com o código do erro; 131047 = passou de 24 h, precisa de modelo aprovado).

A versão da Graph API vem de `WHATSAPP_GRAPH_VERSION` (padrão v26.0) e vale para respostas e lembretes.

## Custos
Respostas de texto livre dentro de 24h após a mensagem do usuário são o caso comum. Confira a tabela
atual de preços no painel da Meta (mudou em 1º/10/2026).

## Lembretes de vencimento
Os avisos automáticos (push, e-mail e WhatsApp) e o modelo de mensagem que a Meta precisa aprovar estão em `LEMBRETES-E-IA.md`.

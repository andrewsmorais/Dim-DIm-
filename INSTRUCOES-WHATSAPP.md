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
4. Webhook: URL `https://www.jakash.app/api/whatsapp/webhook`, token = `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, campo `messages` assinado.
5. `POST /{WABA_ID}/subscribed_apps` para o app receber mensagens de números reais.
6. Gerar o token de usuário do sistema e colocar na Vercel.

Obs.: o número de teste da Meta só conversa com até 5 destinatários cadastrados.

## Custos
Respostas de texto livre dentro de 24h após a mensagem do usuário são o caso comum. Confira a tabela
atual de preços no painel da Meta (mudou em 1º/10/2026).

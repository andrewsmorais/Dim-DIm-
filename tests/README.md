# Testes

- `npm run test:ios` (= `npx tsx --tsconfig tsconfig.json tests/ios-app.test.ts`) — leitura do JWS da Apple, estado da assinatura -> perfil,
  regras de aceite da compra, planos (Pessoal e Empresarial; `familia` antigo vale como `cpf`), JWT do APNs e da App Store Server API, detecção do app pelo User-Agent e validação do `next` de `/auth/native`.
  Não usa rede nem banco.
- `npm run test:voice` (= `npx tsx --tsconfig tsconfig.json tests/voice-parse.test.ts`) — lançamento por voz: valores (vírgula, ponto, "mil", por extenso), receita x despesa,
  ontem/anteontem/dia da semana, empresa, categoria, vários itens, validação do rascunho da IA. Não usa rede nem banco.

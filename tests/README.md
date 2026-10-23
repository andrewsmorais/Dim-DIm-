# Testes

- `npm run test:ios` (= `npx tsx --tsconfig tsconfig.json tests/ios-app.test.ts`) — leitura do JWS da Apple, estado da assinatura -> perfil,
  regras de aceite da compra, JWT do APNs e da App Store Server API, detecção do app pelo User-Agent e validação do `next` de `/auth/native`.
  Não usa rede nem banco.

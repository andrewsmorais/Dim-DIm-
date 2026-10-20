# Testes do WhatsApp (Fase 2)

- `npx tsx --tsconfig tsconfig.json tests/whatsapp-fase2.test.ts` — formatação, botões, leitura da IA, mensagens,
  cérebro com IA de mentira, isolamento por casa e perguntas calculadas em código. Não usa rede nem banco.
- `tests/whatsapp-sql/` — roda a migration `20261020060000` num Postgres local (PGlite) com tabelas de mentira.
  Precisa de `npm i --no-save @electric-sql/pglite` (não é dependência do projeto) e depois `node tests/whatsapp-sql/run.mjs`.

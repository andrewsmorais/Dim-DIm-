# Plano Jakash — versão única

**Data:** 20/10/2026
**Fontes juntadas:** auditoria do código feita pelo Claude (repositório lido arquivo por arquivo), relatório "Jakash: avaliação crítica e plano de evolução" e "Guia para Claude: conectar o Jakash à API oficial WhatsApp" (ambos da Manus, que **não** viu o código), e os pedidos do fundador.
**Para quem é:** o agente que vai executar (Sonnet 5.5, esforço alto) e o fundador.

---

## 0. Regras para o agente que vai executar

1. Trabalhe **na ordem das fases**. Não comece uma fase sem a anterior cumprir o critério de pronto, exceto onde a fase disser que pode correr em paralelo.
2. **Um commit por item numerado** (ex.: `1.2`), com mensagem dizendo o item. Ao fim de cada fase: `npm run build` e `npx tsc --noEmit` sem erro.
3. **Migrations:** sempre em `supabase/migrations/AAAAMMDDHHMMSS_nome.sql` com o arquivo `_down.sql` correspondente (padrão já usado no repo). Toda tabela nova tem RLS do dono **e** a política da casa usando `public.household_user_ids()` (modelo: `20261015020000_shared_policies_balances.sql`). **Não aplique migration no banco de produção** (projeto Supabase `sogeaffujqmrrzuhrtao`) sem mostrar o SQL ao fundador e ele aprovar.
4. **Não mexa no painel da Meta**, nem em variáveis da Vercel. Quando precisar, escreva o passo para o fundador fazer.
5. **Segredos:** nunca imprima token, App Secret ou verify token em log, resposta ou commit. Nada secreto com prefixo `NEXT_PUBLIC_`.
6. **Reaproveite os nomes de variável que já existem** (não crie os nomes sugeridos pela Manus): `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `META_APP_SECRET`, `WHATSAPP_GRAPH_VERSION`, `WHATSAPP_BOT_NUMBER`, `WHATSAPP_REMINDER_TEMPLATE`, `WHATSAPP_REMINDER_LANG`, `WORKER_SECRET`, `NEXT_PUBLIC_SITE_URL`.
7. **Não apague rotas/telas.** Simplificar = mudar menu, nomes e agrupar em abas. Rota antiga continua abrindo.
8. Textos de tela em português do Brasil, frases curtas. Nunca prometer "limpar o nome", rendimento ou aprovação de crédito.
9. Ao terminar cada fase, atualize a seção **13. Status** no fim deste arquivo.

---

## 1. Onde o Jakash está hoje (verificado no código)

A Manus marcou vários itens como "não comprovados" porque não teve acesso ao repositório. Esta tabela é a referência correta:

| Item | Situação | Evidência |
|---|---|---|
| Webhook GET (verificação) e POST com assinatura HMAC no corpo bruto | ✅ existe | `src/app/api/whatsapp/webhook/route.ts` (usa `crypto.timingSafeEqual`) |
| Fila + worker + varredura a cada minuto | ✅ existe | tabela `whatsapp_inbox`, RPC `acquire_whatsapp_task`, `src/app/api/whatsapp/worker/route.ts`, pg_cron ativo |
| Mensagem repetida da Meta não duplica | ✅ existe | `wamid UNIQUE` em `whatsapp_inbox` + índice único `(source_wamid, source_index)` em `transactions` |
| Vínculo seguro número ↔ conta | ✅ existe | código de uso único com validade (`20261014010000_whatsapp_link_codes.sql`), mensagem `conectar ABC123`, RPC `link_whatsapp_number` |
| Bloqueio antes da IA (número desconhecido, plano inativo, limite diário) | ✅ existe | `src/lib/whatsappGate.ts` |
| Cobrança recorrente e direitos por plano | ✅ existe | Asaas (`src/app/api/asaas/*`, token no webhook), `src/lib/entitlements.ts`, `src/lib/plans.ts` |
| Separação pessoal × empresa (MEI) | ✅ existe | `is_business` em contas, cartões e lançamentos; Pacote MEI em `/mei` |
| Gestão compartilhada (casa) | ✅ existe | `partnerships`, `household_user_ids()`, políticas "Casal acessa…" |
| Exportar CSV e excluir conta | ✅ existe | `/configuracoes/dados`, `src/app/api/account/delete/route.ts` |
| Lembretes de vencimento (push, e-mail, WhatsApp) | ✅ existe | `src/app/api/cron/reminders`, `src/lib/reminders.ts` (0, 1, 3 ou 7 dias antes) |
| Valores em dinheiro no banco | ✅ ok | `DECIMAL(12,2)` |
| **Mensagem real chegando do WhatsApp** | ❌ **bloqueio nº 1** | o "Teste" da Meta chega (POST 200), mensagem real não |
| Confirmar / desfazer lançamento pelo WhatsApp | ❌ falta | o worker grava direto via `commit_financial_transactions` |
| Perguntar pelo WhatsApp ("quanto gastei no mês?") | ❌ falta | a IA do WhatsApp só extrai **um** lançamento (`prompts/financial-agent-system.md`) |
| Categorias do próprio usuário no WhatsApp | ❌ falta | lista fixa no prompt; o Chat IA do app já usa as categorias reais |
| Foto e áudio pelo WhatsApp | ❌ falso hoje | o worker manda só o texto "[FOTO RECEBIDA]" e `imageUrl: undefined` (linhas 64–68 e 105) |
| Versão da Graph API centralizada | ❌ falta | worker usa `v17.0` fixo (linha 232); lembretes usam `WHATSAPP_GRAPH_VERSION` (padrão v21.0); painel da Meta já está na v26.0 |
| Prazo de guarda das mensagens | ❌ falta | `raw_payload` (telefone, nome e texto) fica guardado para sempre |
| Nome da assistente | ❌ inconsistente | os prompts dizem "Jakash"; a assistente se chama **Jaki** |
| Modelo de IA | ⚠️ atenção | o código usa `gpt-4o-mini` (não GPT-4o, como dizem os documentos) — está certo para custo, só registrar |
| Sobras | ⚠️ limpar | `next.config.mjs` vazio (o `.js` é o usado); `prompts/financial-agent.md` não é lido por nenhum código |

---

## 2. Mercado e posicionamento

**O que os documentos mostram (fontes no fim):**
- WhatsApp com IA **não é diferencial sozinho**. Segundo a Manus, o Mobills PRO já registra por texto e áudio no WhatsApp, e ZapGastos, Jota e Meu Assessor fazem propostas parecidas. O Porquim IA faz texto, áudio, foto e alerta de limite.
- Segundo a Manus, os **Termos do Mobills excluem uso por empresa e fluxo de caixa de negócio**. Isso abre espaço para o MEI, mas só se o Jakash separar de verdade pessoa e empresa (o código já separa).
- Preços: Organizze R$ 35 por mês no Manual e R$ 45 no Conectado; Minhas Economias R$ 24,90 por mês. No Mobills, o blog dele cita R$ 19,90 por mês, mas a Manus achou esse valor como **parcela do plano anual** (12× R$ 19,90), e o preço do PRO não está público. Antes de decidir preço, confira no site de cada um e compare sempre mensal com mensal.
- Nenhum dos concorrentes pesquisados mostra **lista de compras** nem **plano para sair das dívidas**.

**Posicionamento proposto (junta Manus + fundador):**
> "A Jaki cuida do seu dinheiro pelo WhatsApp: anota o gasto, avisa a conta, monta sua lista de mercado e te ajuda a sair das dívidas. E, se você é MEI, separa o dinheiro da empresa do seu."

**Onde a Manus e o fundador discordam, e a decisão:**
- A Manus pede um único público. O fundador quer cidadão comum **e** empreendedor. **Decisão:** um app só, com dois modos que já existem no código (`usage_type`: pessoal / empresarial / ambos). Cada modo tem um início e um menu próprios. Campanhas e métricas medem cada público **separado**, como pede a Manus.
- A Manus diz "não acrescente funções grandes agora". O fundador quer **Comprar** e **Sair do vermelho**. **Decisão:** as duas entram, mas **depois** das Fases 1 e 2 (WhatsApp funcionando e confiável). São médias e reaproveitam tabelas existentes.
- A Manus deixa para depois Pix, pagamentos, crédito, Open Finance e nota fiscal. **Concordo, e fica fora deste plano.** "Sair do vermelho" é organizar as próprias dívidas, não oferecer crédito nem cobrar ninguém.

---

## 3. Decisões do fundador (responder antes ou durante a Fase 1)

| # | Decisão | Recomendação |
|---|---|---|
| D1 | Público da primeira campanha | Escolha um por vez (cidadão comum com dívidas **ou** MEI) e meça separado. O produto atende os dois. |
| D2 | Dívidas e plano para sair delas no **Essencial** (R$ 19,90)? Hoje `/dividas` é só do Família (`FAMILY_ONLY_PATHS` em `src/lib/plans.ts`). | **Sim.** É a dor nº 1 de quem tem nome sujo, e esse público compra o plano mais barato. |
| D3 | WhatsApp: grava direto + botão "Desfazer", ou pede confirmação sempre? | **Grava direto quando a mensagem está clara** e responde com os botões "Desfazer" e "Trocar categoria". **Pergunta antes** quando falta valor, o tipo é ambíguo ou o valor passa de R$ 1.000. |
| D4 | Modelo de mensagem do WhatsApp para lembretes (é pago por mensagem) | Criar o `lembrete_vencimento` (categoria Utilidade). Corpo em `LEMBRETES-E-IA.md`. |
| D5 | Nome da assistente | **Jaki** em todo lugar (prompts, respostas, telas). |
| D6 | Comprar no plano Essencial? | **Sim, em todos os planos.** É o que faz a pessoa abrir o app toda semana. |

---

## 4. Fase 0 — Tarefas do fundador (sem código)

Modelo/esforço: nenhum agente. Se quiser ajuda guiada, use **Sonnet 5.5, esforço médio**.

0.1 **Trocar o token de acesso.** O token do usuário do sistema foi colado no chat várias vezes. Gere um novo (Business Manager › Usuários do sistema › Gerar token, com as mesmas 5 permissões), coloque em `WHATSAPP_ACCESS_TOKEN` na Vercel e **faça um novo deploy**. Depois, revogue o antigo.

0.2 **Destravar a mensagem real (bloqueio nº 1).** Já confirmado: o token é válido, de usuário do sistema, sem expiração e com os escopos certos. O app está Publicado, o número Conectado e a URL do webhook configurada na aba **Whatsapp Business Account** (o Teste deu 200). Falta conferir, nesta ordem:
- a) Em developers.facebook.com › app Jakash › Casos de uso › Conectar no WhatsApp › Webhooks, na aba **Whatsapp Business Account** (não na aba "User"), o campo **`messages`** precisa estar com a assinatura ligada.
- b) Conferir se o app está inscrito na conta do WhatsApp. Abra o **Graph API Explorer** (developers.facebook.com/tools/explorer), escolha o app Jakash e cole o token novo no campo de token. Faça `GET 2342365759923700/subscribed_apps`. Se a lista vier vazia, mude para `POST` no mesmo caminho e envie.
- c) Na Vercel, conferir se `WHATSAPP_PHONE_NUMBER_ID` termina em `4207689`.
- d) Mandar "oi" do seu celular para +55 12 99184-2793 e olhar os logs da Vercel. **Nenhum POST** indica problema no item a ou b. **POST com 401** indica `META_APP_SECRET` errado. **POST 200, mas nada no Supabase** indica erro de leitura da mensagem.

0.3 Responder às decisões D1 a D6.

0.4 Criar o modelo `lembrete_vencimento` no Gerenciador do WhatsApp (D4).

**Pronto quando:** uma mensagem real aparece em `whatsapp_inbox` com o seu número.

---

## 5. Fase 1 — WhatsApp funcionando de ponta a ponta

Modelo/esforço: **Sonnet 5.5, alto** (código de produção, dinheiro e segurança).
Pode começar em paralelo com o item 0.2; o teste final depende dele.

1.1 **Cliente único da Graph API.** Criar `src/lib/whatsappApi.ts` com `graphUrl(path)`, usando `WHATSAPP_GRAPH_VERSION` com padrão `v26.0`, e `sendText(to, body)`. Trocar o `fetch` fixo em `v17.0` do worker (linha 232) e o de `src/lib/whatsappSend.ts` por esse cliente. Os erros da Meta vão para o log **sem** token e sem o texto da mensagem.

1.2 **Registrar o envio.** Guardar o `wamid` da resposta enviada (coluna nova `reply_wamid` em `whatsapp_inbox`). O webhook passa a reconhecer `value.statuses[]` (entregue/lido/falhou) e atualizar só esse registro. Status de entrega **nunca** vira lançamento.

1.3 **Foto e áudio: resposta honesta até a Fase 6.** No worker, quando `type` for `image`, `audio`, `video`, `document` ou `sticker`, não chamar a IA. Responder: "Por enquanto eu só entendo texto. Me manda assim: *gastei 35 no almoço*. Foto e áudio estão chegando!" e marcar `skipDb`.

1.4 **Nome Jaki.** Trocar "Jakash" por "Jaki" como nome da assistente em `prompts/financial-agent-system.md` e `src/lib/chatPrompt.ts`. O app continua se chamando Jakash. Tirar gírias como "Mano" do tom.

1.5 **Prazo de guarda (LGPD).** Migration com um job pg_cron diário que limpa `raw_payload` de registros `completed` ou `failed` com mais de 30 dias. Guardar só o tipo da mensagem e o resultado. Atualizar `/politica-de-privacidade` com esse prazo.

1.6 **Limpeza.** Apagar `next.config.mjs` (vazio) e `prompts/financial-agent.md` (não usado). Atualizar `INSTRUCOES-WHATSAPP.md` com o checklist da Fase 0.

**Testes de aceitação** (adaptados da seção 7 do guia da Manus):
- GET com verify token errado responde 403; com o certo, devolve o `hub.challenge` puro.
- POST com assinatura inválida responde 401 e não grava nada.
- O mesmo POST enviado duas vezes gera **um** registro.
- Mensagem real → registro em `whatsapp_inbox` → resposta chega no WhatsApp → `reply_wamid` preenchido → status "delivered" registrado.
- Número não vinculado recebe o link de cadastro; `conectar CODIGO` vincula a conta.
- Foto recebe a resposta honesta, sem chamar a IA.
- `grep -rn "v17.0" src` não encontra nada.

**Pronto quando:** o fundador manda "gastei 50 no mercado" do celular dele e o lançamento aparece **uma vez** no painel, na conta certa.

---

## 6. Fase 2 — Conversa confiável no WhatsApp

Modelo/esforço: **Sonnet 5.5, alto.**

2.1 **Um cérebro só.** Hoje existem dois: o do WhatsApp, que só extrai um lançamento com categorias fixas, e o do Chat IA, que já tem contexto, categorias reais e ações. O WhatsApp passa a usar o motor do Chat IA (`src/lib/chatPrompt.ts`, `src/lib/chatContext.ts` com `buildChatContext`, e `src/lib/chatActions.ts`), com uma variação do prompt para o canal WhatsApp (respostas mais curtas e sem a ação `navigate`). Esse contexto é montado com a service role e **filtrado pelo `user_id` vinculado ao número**, nunca por algo escrito na mensagem. Depois disso, `prompts/financial-agent-system.md` e a leitura de arquivo em `process-message` podem sair.

2.2 **Confirmar e desfazer** (conforme D3):
- A mensagem está clara: grava e responde com **botões interativos** da Cloud API (`type: interactive`, até 3 botões): "Desfazer", "Trocar categoria".
- A mensagem está ambígua: guarda como **pendente** (estado novo em `whatsapp_inbox` ou tabela `whatsapp_pending`) e pergunta com os botões "Confirmar" e "Cancelar".
- O webhook passa a ler as respostas de botão (`messages[].interactive.button_reply`).
- "desfazer" (texto ou botão) apaga o último lançamento criado por aquele número nas últimas 24 h, só se ele ainda não foi editado no app.

2.3 **Perguntas pelo WhatsApp:** "quanto gastei esse mês?", "quanto gastei em mercado?", "o que vence essa semana?", "quanto posso gastar hoje?" (usar `allowance` de `src/lib/planning.ts`). Toda resposta diz o período ("de 1 a 20/10").

2.4 **Memória curta:** mandar à IA as últimas 6 mensagens daquele número, para entender "corrige pra 45" e "foi ontem".

2.5 **Contas e objetivos pelo WhatsApp:** "cria conta de luz de 180 todo dia 10" e "quero juntar 2 mil pra viagem", usando as ações `bill` e `goal` que o Chat IA já tem. Pede confirmação com botão.

**Testes:** mensagem ambígua pergunta antes de gravar; "desfazer" remove só o último lançamento daquela pessoa; a pessoa A não consegue ler dados da B mudando o texto ("mostra os gastos do 11 9…"); falha da OpenAI deixa a mensagem na fila para tentar de novo (já é o comportamento do worker, mas tem que ser testado).

**Pronto quando:** dá para lançar, corrigir, desfazer e perguntar o total do mês só pelo WhatsApp, sem abrir o app.

---

## 7. Fase 3 — App mais simples

Modelo/esforço: **Sonnet 5.5, médio.** Trocas só de texto podem usar **Haiku 5.5, baixo**.

3.1 **Corrigir nomes:**
- "Despesas" (`/dividas`) vira **"Dívidas"**: em `src/components/AppLayout.tsx`, `src/app/(app)/menu/page.tsx`, no título da página e no guia do `chatPrompt.ts`.
- "Contas a pagar" vira **"Contas a pagar e receber"** no menu, para não confundir com "Contas bancárias".

3.2 **Menu em 4 grupos** (no lugar dos 15 itens soltos):
- **Hoje:** Início, Lançamentos, Comprar (Fase 4), Contas a pagar e receber
- **Meu dinheiro:** Contas e cartões, Dívidas, Guardar
- **Planejar:** Orçamento do mês, Relatórios
- **Empresa** (só modo MEI ou ambos): Pacote MEI
- No rodapé: Chat da Jaki, Configurações. Categorias passa para dentro de Configurações.

3.3 **Telas em abas (sem apagar rotas):**
- **Guardar** = Objetivos + Reserva + Investimentos + Simulador (abas que apontam para as rotas existentes).
- **Contas e cartões** = Contas bancárias + Cartões.
- **Orçamento do mês** = Limites + Planejamento.

3.4 **Modo pessoal mais leve:** quem tem `usage_type = pessoal` não vê nada de MEI nem o grupo Empresa. O Início mostra só: quanto pode gastar hoje, contas da semana, lista de compras e o progresso de guardar ou de sair do vermelho.

3.5 **Barra de baixo no celular:** Início · Lançamentos · **+** · Comprar · Menu (sai "Limites").

3.6 A tela "Tudo" (`/menu`) passa a usar a **mesma lista** do menu lateral (uma fonte de dados só, por exemplo `src/lib/nav.ts`), para as duas não ficarem diferentes de novo.

3.7 Aplicar D2: tirar `/dividas` de `FAMILY_ONLY_PATHS` e atualizar a lista do plano Essencial na página de vendas (`src/app/page.tsx`).

**Pronto quando:** no celular, todo destino fica a no máximo 2 toques do Início, e nenhum nome do menu aparece duas vezes com sentidos diferentes.

---

## 8. Fase 4 — Comprar (lista de compras)

Modelo/esforço: **Sonnet 5.5, médio.**

**Banco** (migration nova + down):
```sql
shopping_lists (id uuid pk, user_id uuid fk, name text default 'Mercado',
                is_business boolean default false, status text check in ('open','done') default 'open',
                transaction_id uuid null fk transactions, created_at, finished_at)
shopping_items (id uuid pk, list_id uuid fk on delete cascade, created_by uuid fk,
                name text not null, quantity numeric(10,3) default 1, unit text null,
                est_price numeric(12,2) null, checked boolean default false, checked_at timestamptz,
                position int, created_at)
```
RLS do dono e política da casa ("Casal acessa listas de compras" e "Casal acessa itens"), seguindo o modelo de `goal_contributions`.

**Tela `/comprar`:**
- Campo para adicionar rápido. Aceita várias coisas de uma vez: "2 leite, pão, 1kg arroz".
- Sugestões dos itens que a pessoa mais compra (a partir das listas antigas, sem tabela nova).
- Tocar no item marca como "no carrinho". Mostra **total estimado × total do carrinho** ao vivo.
- Mostra **"Você ainda pode gastar R$ X em Alimentação este mês"**, a partir dos limites que já existem (`budgets`).
- **Finalizar compra:** a pessoa informa o valor pago (já vem preenchido com o total do carrinho) e escolhe conta ou cartão. Para isso, o QuickAdd ganha os campos `amount`, `description` e `category` no `QuickAddPreset` (`src/components/QuickAdd.tsx`), e a compra vira **um** lançamento de despesa. A lista fica `done` com o `transaction_id`. O que não foi marcado passa para uma lista nova ("ficou faltando").
- No modo MEI, a opção "Lista da empresa" (`is_business`) gera lançamento da empresa.
- Funciona com sinal fraco: a marcação aparece na hora e é salva em seguida, tentando de novo se falhar.

**Jaki (WhatsApp e Chat):** nova ação `shopping_add` (itens) e as perguntas "o que falta comprar?" e "me manda a lista". Exemplo: "põe leite e pão na lista" responde "Anotei: leite, pão. Sua lista tem 7 itens."

**Testes:** a lista compartilhada aparece para as duas pessoas da casa; finalizar gera um lançamento só (clique duplo não duplica); a pessoa de fora da casa não vê a lista.

**Pronto quando:** dá para montar a lista pelo WhatsApp, marcar no mercado pelo celular e finalizar, e o gasto aparece no Início e nos limites.

---

## 9. Fase 5 — Sair do vermelho + incentivo a guardar

Modelo/esforço: **Sonnet 5.5, alto** (contas de dinheiro e textos sensíveis).

### 9.1 Dívidas completas (migration aditiva em `debts`)
Novos campos: `creditor` (credor), `original_amount`, `status` (`em_dia`, `atrasada`, `negativada`, `negociada`, `quitada`), `overdue_since` (desde quando está atrasada), `essential` (água, luz, gás, aluguel), `cash_offer` (proposta à vista), `agreement_installments`, `agreement_amount`, `agreement_first_due`. O `kind` ganha `conta_consumo` e `loja`.

### 9.2 Alerta das parcelas
- Quando a pessoa registra um acordo, as parcelas viram contas a pagar mensais (coluna nova `bills.debt_id`).
- O cron de lembretes que já existe passa a avisar essas parcelas sem nenhuma mudança.
- Ao dar baixa (`mark_bill_paid`), a parcela também abate da dívida (`register_debt_payment`) **na mesma transação** do banco.

### 9.3 Plano da Jaki para pagar as dívidas
- Rota nova `POST /api/debts/plan`.
- **As contas são feitas em código, não pela IA.** Usar `projectPayoff` (avalanche e bola de neve, em `src/lib/planner.ts`), a renda média e os compromissos de `src/lib/planning.ts` e os gastos essenciais do mês.
- A IA (`gpt-4o-mini`) **só escreve a explicação** com os números já calculados, e não pode inventar valor.
- A resposta traz:
  - ordem de pagamento, com as dívidas essenciais (água, luz, aluguel) primeiro e depois os juros mais altos;
  - quanto separar por mês e em quantos meses quita;
  - à vista com desconto × parcelado (juros totais e quanto sobra por mês em cada caso);
  - um **roteiro de negociação** (o que perguntar ao credor: valor total, desconto à vista, número de parcelas, se o acordo inclui a retirada da negativação, pedir tudo por escrito).
- Botão "Atualizar plano" a cada mês e também quando a pessoa pagar algo.

**Limites obrigatórios:**
- A Jaki não indica banco, empréstimo, portabilidade nem produto de crédito (é a regra atual do `chatPrompt.ts`).
- Nenhum texto promete "limpar o nome".
- Informação legal (por exemplo, o prazo máximo de permanência da negativação) **só entra depois de o fundador conferir em fonte oficial**, e com o link da fonte na tela.
- Nunca pedir CPF.
- Os dados de dívida aparecem na política de privacidade como finalidade nova.

### 9.4 Incentivo a guardar
- **Mini-reserva primeiro:** quem tem dívida recebe a sugestão de um objetivo pequeno, "Reserva inicial" (meta = 1 mês de gastos essenciais, calculado pelo app), para não voltar ao cartão numa emergência. Usa `goals` e `goal_contributions`, que já existem.
- **Marcos:** primeiros R$ 100 guardados, 25%, 50% e 100% de um objetivo, e cada dívida quitada. A comemoração aparece no app e, dentro da janela de 24 h, no WhatsApp.
- **Sequência:** "3 meses seguidos guardando", calculada pelos aportes em `goal_contributions`.
- **Fim do mês:** no resumo mensal que já existe (`src/app/api/cron/insights`, todo dia 1º), incluir "Sobrou R$ X no mês passado. Quer mandar para [objetivo]?" com um botão que cria o aporte.
- Tudo é sugestão: nada movimenta dinheiro sozinho.

**Testes:** o plano bate com a conta feita à mão para 3 dívidas de exemplo; a dívida quitada some do plano e dispara a comemoração; a parcela do acordo gera lembrete; a pessoa de outra casa não vê as dívidas.

**Pronto quando:** quem está com o nome sujo cadastra as dívidas em menos de 5 minutos, recebe o plano com a ordem e o valor do mês, e é avisado de cada parcela.

---

## 10. Fase 6 — Foto e áudio de verdade no WhatsApp

Modelo/esforço: **Sonnet 5.5, alto.**

6.1 **Baixar a mídia.** Pegar o `media_id` da mensagem, chamar `GET /{media_id}` para obter a URL temporária e baixar com o Bearer token, pelo cliente da Fase 1. Limite de tamanho: 5 MB para imagem e 16 MB para áudio.
6.2 **Foto** (comprovante ou nota): mandar à IA como data URL em base64. A rota `process-message` já aceita `imageUrl`.
6.3 **Áudio:** transcrever com o modelo de transcrição da OpenAI e seguir o fluxo de texto da Fase 2. Responder mostrando o que entendeu ("Entendi: *gastei 40 de gasolina*").
6.4 **Privacidade e custo:** não guardar a mídia (só o texto extraído); contar foto e áudio no limite diário de mensagens; colocar um teto por plano.
6.5 Tirar o "Em breve" de `src/app/bem-vindo/page.tsx` e atualizar a página de vendas.

**Pronto quando:** a foto de um cupom e um áudio de 10 s geram o lançamento certo com confirmação, e nada da mídia fica salvo.

---

## 11. Fase 7 — Piloto, métricas e preço

- Métricas: **Sonnet 5.5, médio**.
- Análise de preço: **Opus 5.5, alto**.

7.1 **Funil no painel do dono (`/admin`):** criou conta, vinculou o WhatsApp, primeiro lançamento, ativo 7 e 30 dias depois, mensagens recebidas × gravadas, taxa de "desfazer" e correção, custo de IA e de mensagens da Meta por conta ativa, cancelamentos e motivo. Tudo separado por modo (pessoal / MEI / ambos).
7.2 **Piloto:** 20 a 30 pessoas de cada público, com entrevista curta antes e depois (roteiro na seção "Fase 4" do relatório da Manus).
7.3 **Matriz de planos:** pessoas, WhatsApp, limites diários, Dívidas, Comprar, MEI, relatórios e suporte. Estimar o custo variável por conta: OpenAI, modelos de mensagem da Meta (conferir a tabela de preços do Brasil no painel), Vercel, Supabase e Asaas.
7.4 Decidir o preço com dados do piloto, e não antes.

---

## 12. Fora deste plano (de propósito)

Pix e pagamentos, crédito ou indicação de empréstimo, cobrança de terceiros, Open Finance, emissão de nota fiscal, recomendação de investimento e Embedded Signup (cada cliente conectar o próprio número). Cada um muda risco e custo, e precisa de avaliação jurídica antes.

---

## 13. Status (o agente atualiza ao fim de cada fase)

| Fase | Estado | Data | Observações |
|---|---|---|---|
| 0 — Fundador | pendente | | |
| 1 — WhatsApp ponta a ponta | código pronto (1.1 a 1.6), falta validar com mensagem real | 20/10/2026 | `tsc` e `npm run build` sem erro. Webhook testado com assinatura: GET errado 403, GET certo devolve o challenge, POST sem/ com assinatura inválida 401, status de entrega 200 sem virar lançamento. **Não testado:** envio real à Meta e o worker contra o banco (dependem do item 0.2 e das migrations). Pendências abaixo. |
| 2 — Conversa confiável | pendente | | |
| 3 — App mais simples | pendente | | |
| 4 — Comprar | pendente | | |
| 5 — Sair do vermelho + guardar | pendente | | |
| 6 — Foto e áudio | pendente | | |
| 7 — Piloto e preço | pendente | | |

### Pendências da Fase 1 (dependem do fundador)

1. **Migrations aguardando aprovação** (nenhuma foi aplicada no banco de produção; o código funciona com ou sem elas):
   - `20261020010000_whatsapp_reply_status.sql`: 3 colunas e 1 índice em `whatsapp_inbox` (aditiva, sem risco).
   - `20261020020000_whatsapp_retention.sql`: função de limpeza + job diário às 03:17 (Brasília). **Atenção:** assim que rodar, o conteúdo bruto de mensagens com mais de 30 dias é apagado e não volta. Rodar `SELECT public.purge_whatsapp_inbox_payloads(30);` à mão só depois de conferir que nenhuma mensagem dessa idade ainda é necessária.
2. **Texto da política de privacidade (item 1.5), a publicar junto com a migration acima.** Em `src/app/politica-de-privacidade/page.tsx`, na seção "5. Por quanto tempo guardamos", acrescentar:
   > *Mensagens do WhatsApp:* o conteúdo bruto (texto e dados enviados pela Meta) fica na fila de processamento por até 30 dias. Depois disso, guardamos só um registro técnico, sem o texto, ligado ao seu número (tipo da mensagem, data e resultado), até você excluir a conta. Os lançamentos que você confirmou continuam na sua conta.

   Não publicar esse parágrafo antes de a migration estar aplicada, porque ele descreveria algo que ainda não acontece.
3. **Item 0.2** (mensagem real chegar): é o que falta para provar a Fase 1 de ponta a ponta.
4. **Depois de 0.2**, rodar os testes de aceitação da seção 5 com o celular: mensagem real, resposta no WhatsApp, `reply_status` preenchido (após a primeira migration), foto recebendo a resposta honesta e `conectar CODIGO`.

---

## Fontes

- Manus — "Jakash: avaliação crítica e plano de evolução" (20/10/2026). As referências citadas nele incluem: [Mobills PRO](https://mobills.zendesk.com/hc/pt-br/articles/39727734628251-Tudo-sobre-o-Mobills-PRO), [Termos do Mobills](https://www.mobills.com.br/privacidade-e-termos/termos-de-uso/), [Organizze, preços](https://ajuda.organizze.com.br/hc/pt-br/articles/5661263190035-Conhe%C3%A7a-nossos-pre%C3%A7os-e-assinaturas), [Minhas Economias](https://faq.minhaseconomias.com.br/hc/pt-br/articles/35615401810715-Qual-o-valor-e-forma-de-pagamento-da-assinatura-Meu-Clube), [ZapGastos](https://zapgastos.com/), [Jota](https://jota.ai/), [Meu Assessor](https://meuassessor.com/), [IBGE, MEIs em 2022](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/41046-em-2022-brasil-tinha-14-6-milhoes-de-microempreendedores-individuais), [ANPD, direitos dos titulares](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares)
- Manus — "Guia para Claude: conectar o Jakash à API oficial WhatsApp" (20/10/2026): [Webhooks da Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview), [Criar o endpoint do webhook](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint), [Mensagens e janela de 24 h](https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages), [Preços da plataforma](https://whatsappbusiness.com/products/platform-pricing/)
- Pesquisa do Claude: [Mobills — 11 apps de controle financeiro para 2026](https://www.mobills.com.br/blog/apps-de-controle-financeiro/), [Data Hackers — Porquim IA](https://www.datahackers.news/p/porquim-ia-a-intelig-ncia-artificial-que-organiza-suas-finan-as-no-whatsapp)

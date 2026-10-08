# Como pegar as chaves do WhatsApp no Meta Developers

1. No painel do app "Grana Smart", clique em "Configurações do app" (engrenagem no menu lateral)
2. Role até "Adicionar produto" e clique em "Configurar" ao lado de "WhatsApp"
3. Você cairá na tela "Visão geral da API do WhatsApp"
4. Copie estas 3 informações:
   - **ID do número de telefone** (Etapa 1, campo "Phone number ID")
   - **Token de acesso** (Etapa 2, clique em "Gerar token de acesso" e copie)
   - **ID da conta comercial** (Etapa 4, campo "Business Account ID")
5. Na Etapa 3, adicione seu número pessoal (ex: 5511999998888) e envie uma mensagem de teste
6. Cole as 3 chaves no arquivo `.env.local` do projeto

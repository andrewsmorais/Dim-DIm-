# Jakash - Plataforma de Finanças Pessoais e MEI

Jakash é uma plataforma brasileira de gestão financeira para pessoas físicas (CPF) e microempreendedores (MEI), com suporte para planejamento, investimentos, análise de gastos e gestão compartilhada.

## Stack Tecnológico

- **Frontend**: Next.js 15.5.28 com React 19 (App Router)
- **Backend**: Supabase (PostgreSQL + RLS)
- **Autenticação**: Supabase Auth com OAuth (Google, Apple) e email/senha
- **UI**: Tailwind CSS + Lucide React
- **Design**: Impeccable Design System v4.5.2

## Features

✅ Autenticação com Google OAuth, Apple Sign-In, e email/senha  
✅ Gestão de contas bancárias e cartões  
✅ Lançamentos de transações (receitas/despesas)  
✅ Planejamento de gastos com limites por categoria  
✅ Acompanhamento de investimentos  
✅ Metas financeiras com tipos customizáveis  
✅ Gestão de dívidas com taxa de juros  
✅ Reserva de emergência  
✅ Relatórios e análise de categorias  
✅ Gestão compartilhada (casal, parceiros)  
✅ Chat com IA (Claude)  
✅ Planos de assinatura (CPF/MEI)  

## Começando

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Variáveis de ambiente
cp .env.local.example .env.local
# Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# Rodar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### Banco de Dados (Supabase Local)

```bash
# Iniciar stack local
supabase start

# Executar migrações
supabase db push
```

## Autenticação Google OAuth

A plataforma suporta login/cadastro via Google OAuth. Para configurar:

1. **Setup Simples (Teste)**: Use `LOGIN_BYPASS=true` em `.env.local`
2. **Setup Produção**: Veja [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)

Fluxo:
- Usuário clica "Continuar com Google"
- Autentica no Google
- Supabase cria `auth.users` + `profiles`
- Redirecionado a `/dashboard`

## Estrutura do Projeto

```
src/
├── app/                  # Páginas (Next.js App Router)
│   ├── login/           # Login com OAuth
│   ├── cadastro/        # Cadastro com OAuth
│   ├── auth/callback/   # PKCE callback handler
│   └── (app)/           # Rotas autenticadas
├── components/          # Componentes React
│   └── auth/            # Componentes de autenticação
├── lib/                 # Utilidades
│   ├── supabase/        # Cliente Supabase
│   └── authUtil.ts      # Helpers de autenticação
├── contexts/            # Context API (SettingsContext, etc)
└── styles/              # Tailwind config

supabase/
├── migrations/          # Migrações SQL
│   └── 20261015120000_oauth_profile_trigger.sql  # Trigger para criar perfil
└── schema.sql           # Snapshot atual do schema
```

## Deploy

### Vercel

```bash
git push origin main
```

Vercel detecta Next.js e faz deploy automático.

### Variáveis de Produção

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_REQUIRE_LOGIN=1
```

## Documentação

- [Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md) - Configurar autenticação Google
- [Supabase Docs](https://supabase.com/docs) - Backend
- [Next.js Docs](https://nextjs.org/docs) - Frontend

## Contribuindo

1. Crie branch: `git checkout -b feature/sua-feature`
2. Commit com mensagem: `git commit -m "Add: sua feature"`
3. Push: `git push origin feature/sua-feature`
4. Abra PR

## Licença

MIT

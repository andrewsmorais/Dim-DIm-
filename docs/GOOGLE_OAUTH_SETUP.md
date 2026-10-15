# Configuração Google OAuth no Jakash

Este documento descreve como configurar a autenticação Google OAuth no Jakash usando Supabase Auth.

## Status Atual

✅ **Implementado:** A plataforma Jakash já possui suporte completo para Google OAuth:
- Botões "Continuar com Google" nas páginas de login e cadastro
- Fluxo PKCE implementado para segurança
- Trigger automático para criação de perfil de usuário
- Suporte para metadados do OAuth (full_name, email, etc.)

## Arquitetura da Solução

### 1. **Frontend (Next.js)**
- **Login Page** (`src/app/login/page.tsx`): Botão Google OAuth com `signInWithOAuth()`
- **Signup Page** (`src/app/cadastro/page.tsx`): Botão Google OAuth integrado
- **Auth Shell** (`src/components/auth/AuthShell.tsx`): Componente GoogleButton com SVG oficial
- **Auth Callback** (`src/app/auth/callback/route.ts`): Handler PKCE que troca `code` por sessão

### 2. **Backend (Supabase)**
- **Auth Provider**: Google OAuth 2.0 via Supabase Auth
- **User Profile Trigger**: `handle_new_user()` cria `profiles` automaticamente
- **RLS Policies**: Proteção de dados por usuário

## Fluxo de Autenticação Google

```
1. Usuário clica "Continuar com Google"
   ↓
2. signInWithOAuth({ provider: "google", redirectTo: "/auth/callback?next=/dashboard" })
   ↓
3. Redireciona para Google Accounts
   ↓
4. Usuário autentica com Google
   ↓
5. Google redireciona de volta com `?code=...`
   ↓
6. /auth/callback troca code por sessão (PKCE)
   ↓
7. createClient().auth.exchangeCodeForSession(code)
   ↓
8. Trigger `on_auth_user_created` cria perfil em `profiles`
   ↓
9. Redireciona para `next` param (padrão: /dashboard)
```

## Configuração em Producão

### Passo 1: Criar Projeto Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto (ex: "Jakash")
3. Ative a API **Google+ API** (deprecated, mas ainda funciona) ou **Identity and Access Management (IAM) API**

### Passo 2: Criar OAuth 2.0 Credentials

1. Vá para **Credentials** no menu lateral
2. Clique **Create Credentials** → **OAuth client ID**
3. Escolha **Web application**
4. Configure:
   - **Name**: "Jakash Web App"
   - **Authorized JavaScript origins**: 
     - `https://your-supabase-project.supabase.co`
     - Seu domínio de produção (ex: `https://app.jakash.com`)
   - **Authorized redirect URIs**: 
     - `https://your-supabase-project.supabase.co/auth/v1/callback`

5. Copie **Client ID** e **Client Secret**

### Passo 3: Configurar no Supabase

1. Vá para [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto **Jakash**
3. Menu: **Authentication** → **Providers** → **Google**
4. Ative **Enabled**
5. Cole:
   - **Client ID**: (do Google Cloud)
   - **Client Secret**: (do Google Cloud)
6. **Save**

### Passo 4: Testar Fluxo

#### Em Desenvolvimento (LOGIN_BYPASS = true)
```bash
# Com LOGIN_BYPASS ativo, você pode testar sem credenciais reais
# Abra http://localhost:3000/login
# Clique "Continuar com Google"
# Você será redirecionado para Google (teste com conta pessoal)
```

#### Em Produção (LOGIN_BYPASS = false)
1. Deploy com `NEXT_PUBLIC_REQUIRE_LOGIN=1`
2. Acesse `https://seu-dominio/login`
3. Clique "Continuar com Google"
4. Autentique com sua conta Google
5. Você deve ser redirecionado a `/dashboard` com perfil criado

## Campos de Perfil Preenchidos

Quando um usuário se registra via Google OAuth, os seguintes campos são preenchidos automaticamente:

```sql
-- profiles table
- id: (UUID do usuario Supabase)
- full_name: (extraído de Google via raw_user_meta_data)
- email: (sempre disponível via auth.users)
- created_at: (timestamp automático)
```

## Fluxo de Signup via Google

1. **Novo usuário** clica "Continuar com Google" na página de cadastro
2. Autentica com Google
3. Supabase cria `auth.users` com:
   - email (do Google)
   - raw_user_meta_data.full_name (do Google)
   - email_confirmed_at = now() (Google já confirmou)
4. Trigger `on_auth_user_created` dispara
5. Cria registro em `profiles` com full_name
6. Usuário é redirecionado a `/dashboard`

## Variáveis de Ambiente

Nenhuma variável de ambiente adicional é necessária! A configuração é feita inteiramente via Supabase Console.

## Troubleshooting

### Problema: "Callback URL mismatch"
**Causa**: URL configurada no Google Cloud não corresponde ao Supabase
**Solução**: Verifique em **Google Cloud → Credentials** que os URIs estão corretos

### Problema: "Invalid client"
**Causa**: Client ID ou Client Secret incorretos
**Solução**: Recrie as credentials no Google Cloud e atualize no Supabase

### Problema: Usuário autenticado mas sem perfil
**Causa**: Trigger não foi criado
**Solução**: Execute a migration `20261015120000_oauth_profile_trigger.sql`

### Problema: full_name vem vazio
**Causa**: Google não devolveu full_name ou metadata não foi extraído
**Solução**: Verifique `handle_new_user()` em `20261014020000_planning_tables.sql`

## Segurança

- ✅ PKCE flow: Protege contra CSRF attacks
- ✅ Email verificado automaticamente: Google já confirmou identidade
- ✅ RLS: Usuários só veem seus próprios dados
- ✅ Client Secret nunca exposto: Fica seguro no servidor Supabase
- ✅ No token armazenado no localStorage: Supabase gerencia httpOnly cookies

## Próximas Melhorias (Opcional)

- [ ] Support para Apple OAuth (já tem botão, só precisa configurar provider)
- [ ] GitHub OAuth para desenvolvedores
- [ ] Microsoft/Office 365 OAuth
- [ ] Profile picture do Google armazenada no perfil
- [ ] Sync de updates de Google (ex: foto atualizada)

## Referências

- [Supabase Auth Google Provider Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase PKCE Flow](https://supabase.com/docs/guides/auth/redirect-urls)

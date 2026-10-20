-- Esquema mínimo que imita o banco real (só o que a migration da Fase 2 toca).
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid $$;

CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');
CREATE TYPE public.transaction_origin AS ENUM ('manual', 'whatsapp', 'import');
CREATE TYPE public.queue_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name text NOT NULL DEFAULT '', whatsapp_number text, mei_activity text DEFAULT 'servicos');
CREATE FUNCTION public.on_auth_user_created() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN INSERT INTO public.profiles (id) VALUES (NEW.id); RETURN NEW; END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.on_auth_user_created();

CREATE TABLE public.categories (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, user_id uuid, is_default boolean DEFAULT false);
CREATE TABLE public.partnerships (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid, partner_id uuid, status text, invite_code text);

CREATE FUNCTION public.household_user_ids() RETURNS SETOF uuid LANGUAGE sql STABLE AS $$
    WITH me AS (SELECT auth.uid() AS id),
    root AS (
        SELECT COALESCE(
            (SELECT p.owner_id FROM public.partnerships p, me WHERE p.partner_id = me.id AND p.status = 'accepted' LIMIT 1),
            (SELECT id FROM me)) AS id
    )
    SELECT id FROM me
    UNION
    SELECT id FROM root
    UNION
    SELECT p.partner_id FROM public.partnerships p, root
     WHERE p.owner_id = root.id AND p.status = 'accepted' AND p.partner_id IS NOT NULL;
$$;

CREATE TABLE public.accounts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, name text NOT NULL, kind text NOT NULL DEFAULT 'corrente', initial_balance numeric NOT NULL DEFAULT 0, archived boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id uuid, amount numeric NOT NULL, description text NOT NULL, type public.transaction_type NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE, origin public.transaction_origin DEFAULT 'manual',
    created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
    source_wamid text, source_index integer, account_id uuid, card_id uuid, invoice_month date);
CREATE UNIQUE INDEX unique_whatsapp_source ON public.transactions (source_wamid, source_index) WHERE source_wamid IS NOT NULL;
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bills (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, description text NOT NULL, amount numeric NOT NULL, due_date date NOT NULL, type public.transaction_type NOT NULL DEFAULT 'expense', recurrence text NOT NULL DEFAULT 'none', status text NOT NULL DEFAULT 'pending', paid_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.goals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, name text NOT NULL, target_amount numeric NOT NULL, current_amount numeric DEFAULT 0, deadline date, status text DEFAULT 'in_progress', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), type text NOT NULL DEFAULT 'custom');
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TABLE public.goal_contributions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE, amount numeric);
CREATE TABLE public.chat_history (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, message_role text NOT NULL, content text NOT NULL, media_url text, created_at timestamptz DEFAULT now());

CREATE TABLE public.whatsapp_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), wamid TEXT UNIQUE NOT NULL, phone_number TEXT NOT NULL, raw_payload JSONB NOT NULL,
    status public.queue_status NOT NULL DEFAULT 'pending', worker_id UUID, locked_until TIMESTAMPTZ, ai_response JSONB,
    db_synced BOOLEAN NOT NULL DEFAULT false, wa_replied BOOLEAN NOT NULL DEFAULT false, retry_count INT NOT NULL DEFAULT 0,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_error TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

-- cópia das funções reais (account_balances / card_invoice_summary), com as tabelas auxiliares mínimas
CREATE TABLE public.card_invoice_payments (user_id uuid, account_id uuid, card_id uuid, invoice_month date, amount numeric);
CREATE TABLE public.investment_movements (user_id uuid, account_id uuid, kind text, amount numeric);
CREATE FUNCTION public.account_balances() RETURNS TABLE(id uuid, name text, kind text, balance numeric) LANGUAGE sql STABLE SET search_path TO 'public' AS $$
    WITH acc AS (
        SELECT a.id, a.user_id, a.name, a.kind, a.initial_balance, a.created_at,
               row_number() OVER (PARTITION BY a.user_id ORDER BY a.created_at, a.id) AS rn
          FROM public.accounts a
         WHERE a.user_id IN (SELECT public.household_user_ids()) AND NOT a.archived
    ),
    tx AS (
        SELECT t.user_id, t.account_id, SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END) AS n
          FROM public.transactions t
         WHERE t.user_id IN (SELECT public.household_user_ids()) AND t.card_id IS NULL
         GROUP BY t.user_id, t.account_id
    ),
    pay AS (SELECT p.account_id, SUM(p.amount) AS n FROM public.card_invoice_payments p WHERE p.user_id IN (SELECT public.household_user_ids()) AND p.account_id IS NOT NULL GROUP BY p.account_id),
    inv AS (SELECT m.account_id, SUM(CASE WHEN m.kind = 'resgate' THEN m.amount ELSE -m.amount END) AS n FROM public.investment_movements m WHERE m.user_id IN (SELECT public.household_user_ids()) AND m.account_id IS NOT NULL AND m.kind IN ('aporte', 'resgate') GROUP BY m.account_id)
    SELECT acc.id, acc.name, acc.kind,
           acc.initial_balance
             + COALESCE((SELECT tx.n FROM tx WHERE tx.user_id = acc.user_id AND tx.account_id = acc.id), 0)
             + CASE WHEN acc.rn = 1 THEN COALESCE((SELECT tx.n FROM tx WHERE tx.user_id = acc.user_id AND tx.account_id IS NULL), 0) ELSE 0 END
             - COALESCE((SELECT pay.n FROM pay WHERE pay.account_id = acc.id), 0)
             + COALESCE((SELECT inv.n FROM inv WHERE inv.account_id = acc.id), 0)
      FROM acc ORDER BY acc.created_at, acc.id;
$$;
CREATE FUNCTION public.card_invoice_summary() RETURNS TABLE(card_id uuid, invoice_month date, total numeric, paid numeric) LANGUAGE sql STABLE SET search_path TO 'public' AS $$
    WITH t AS (
        SELECT x.card_id, x.invoice_month, SUM(CASE WHEN x.type = 'expense' THEN x.amount ELSE -x.amount END) AS total
          FROM public.transactions x
         WHERE x.card_id IS NOT NULL AND x.invoice_month IS NOT NULL AND x.user_id IN (SELECT public.household_user_ids())
         GROUP BY x.card_id, x.invoice_month
    ), p AS (
        SELECT y.card_id, y.invoice_month, SUM(y.amount) AS paid FROM public.card_invoice_payments y WHERE y.user_id IN (SELECT public.household_user_ids()) GROUP BY y.card_id, y.invoice_month
    )
    SELECT COALESCE(t.card_id, p.card_id), COALESCE(t.invoice_month, p.invoice_month), COALESCE(t.total, 0), COALESCE(p.paid, 0)
      FROM t FULL OUTER JOIN p ON p.card_id = t.card_id AND p.invoice_month = t.invoice_month;
$$;

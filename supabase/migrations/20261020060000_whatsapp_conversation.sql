-- Fase 2 — Conversa confiável no WhatsApp.
-- Aditiva: só cria tabelas e funções novas. Nada existente é alterado ou apagado.
-- NÃO aplicar em produção sem aprovação do fundador (ver PLANO-JAKASH.md, regra 3).
--
-- O que entra:
--   1. whatsapp_actions  : registro de tudo que a Jaki criou (idempotência + "desfazer").
--   2. whatsapp_pending  : lançamentos/contas/objetivos que esperam o "Confirmar" da pessoa.
--   3. whatsapp_* (leitura): versões das funções do contexto que valem para UM usuário informado,
--                            porque o worker usa a chave de serviço (sem sessão de usuário).
--   4. whatsapp_run_op   : única porta de escrita do worker (grava, confirma, cancela, desfaz, corrige),
--                          protegida pelo fencing token da fila e idempotente.

-- ---------------------------------------------------------------------------
-- 1. Registro do que a Jaki criou
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_actions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    wamid       TEXT NOT NULL,                 -- mensagem original que gerou o item (agrupa itens da mesma mensagem)
    idx         INTEGER NOT NULL,              -- posição do item dentro da mensagem
    kind        TEXT NOT NULL CHECK (kind IN ('transaction', 'bill', 'goal')),
    ref_id      UUID NOT NULL,                 -- id do lançamento / conta / objetivo criado
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    edited_at   TIMESTAMPTZ,                   -- última correção feita pelo próprio WhatsApp
    undone_at   TIMESTAMPTZ,
    UNIQUE (wamid, idx)
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_actions_user_recent
    ON public.whatsapp_actions (user_id, created_at DESC) WHERE undone_at IS NULL;

-- Tabela interna do worker (chave de serviço): RLS ligado e nenhuma política = ninguém mais lê nem escreve.
-- Mesmo modelo de whatsapp_inbox. Apaga junto com a conta (ON DELETE CASCADE).
ALTER TABLE public.whatsapp_actions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. Itens esperando confirmação
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.whatsapp_pending (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    source_wamid TEXT NOT NULL UNIQUE,         -- a mesma mensagem nunca cria dois pendentes
    actions      JSONB NOT NULL,               -- já validado e com category_id resolvido
    status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'confirmed', 'cancelled')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at   TIMESTAMPTZ NOT NULL DEFAULT now() + interval '24 hours',
    resolved_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_pending_user_open
    ON public.whatsapp_pending (user_id, created_at DESC) WHERE status = 'open';
ALTER TABLE public.whatsapp_pending ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. Leitura "como se fosse" um usuário (só service_role)
--    As funções do app (account_balances etc.) usam auth.uid(). O worker não tem sessão, então estas
--    versões fixam o usuário DENTRO da própria transação (set_config local) e chamam as originais.
--    O usuário vem do número vinculado, nunca do texto da mensagem.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._wa_as_user(p_user UUID)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    IF p_user IS NULL THEN RAISE EXCEPTION 'user required'; END IF;
    PERFORM set_config('request.jwt.claim.sub', p_user::text, true);
    PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', p_user::text, 'role', 'authenticated')::text, true);
END
$$;

CREATE OR REPLACE FUNCTION public.whatsapp_household_ids(p_user UUID)
RETURNS SETOF UUID
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    PERFORM public._wa_as_user(p_user);
    RETURN QUERY SELECT public.household_user_ids();
END
$$;

CREATE OR REPLACE FUNCTION public.whatsapp_account_balances(p_user UUID)
RETURNS TABLE(id UUID, name TEXT, kind TEXT, balance NUMERIC)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    PERFORM public._wa_as_user(p_user);
    RETURN QUERY SELECT * FROM public.account_balances();
END
$$;

CREATE OR REPLACE FUNCTION public.whatsapp_card_invoice_summary(p_user UUID)
RETURNS TABLE(card_id UUID, invoice_month DATE, total NUMERIC, paid NUMERIC)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    PERFORM public._wa_as_user(p_user);
    RETURN QUERY SELECT * FROM public.card_invoice_summary();
END
$$;

CREATE OR REPLACE FUNCTION public.whatsapp_mei_year_summary(p_user UUID, p_year INTEGER)
RETURNS TABLE(rev_comercio NUMERIC, rev_industria NUMERIC, rev_servicos NUMERIC, expenses NUMERIC, draws NUMERIC, das_paid NUMERIC)
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    PERFORM public._wa_as_user(p_user);
    RETURN QUERY SELECT * FROM public.mei_year_summary(p_year);
END
$$;

-- ---------------------------------------------------------------------------
-- 4. Porta única de escrita do worker
--    p_op->>'t' :
--      chat        só guarda a conversa (perguntas e respostas sem lançamento)
--      apply       grava os itens agora
--      pending     guarda os itens esperando "Confirmar"
--      confirm     grava os itens do pendente p_op->>'pending_id'
--      cancel      descarta o pendente
--      undo        apaga o grupo p_op->>'group' (ou o mais recente das últimas 24 h)
--      update_last corrige o último lançamento (ou o do grupo p_op->>'group')
--    Tudo na mesma transação, com o mesmo fencing token de commit_financial_transactions.
--    O resultado fica em whatsapp_inbox.ai_response->'result' e é a base da resposta ao usuário.
-- ---------------------------------------------------------------------------

-- Grava uma lista de itens ({kind: transaction|bill|goal, ...}) de forma idempotente por (wamid, idx).
CREATE OR REPLACE FUNCTION public._wa_write_items(p_user UUID, p_phone TEXT, p_wamid TEXT, p_items JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_item JSONB;
    v_i INTEGER := 0;
    v_id UUID;
    v_new INTEGER;
    v_out JSONB := '[]'::jsonb;
    v_kind TEXT;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_kind := v_item->>'kind';
        v_id := gen_random_uuid();

        INSERT INTO public.whatsapp_actions (user_id, phone_number, wamid, idx, kind, ref_id)
        VALUES (p_user, p_phone, p_wamid, v_i, v_kind, v_id)
        ON CONFLICT (wamid, idx) DO NOTHING;
        GET DIAGNOSTICS v_new = ROW_COUNT;

        IF v_new = 1 THEN
            IF v_kind = 'transaction' THEN
                INSERT INTO public.transactions (id, user_id, amount, description, category_id, type, date, origin, source_wamid, source_index)
                VALUES (v_id, p_user, (v_item->>'amount')::NUMERIC, v_item->>'description',
                        NULLIF(v_item->>'category_id', '')::UUID, (v_item->>'flow')::public.transaction_type,
                        (v_item->>'date')::DATE, 'whatsapp'::public.transaction_origin, p_wamid, v_i);
            ELSIF v_kind = 'bill' THEN
                INSERT INTO public.bills (id, user_id, description, amount, due_date, type, recurrence)
                VALUES (v_id, p_user, v_item->>'description', (v_item->>'amount')::NUMERIC, (v_item->>'due_date')::DATE,
                        COALESCE(v_item->>'bill_kind', 'expense')::public.transaction_type, COALESCE(v_item->>'recurrence', 'none'));
            ELSIF v_kind = 'goal' THEN
                INSERT INTO public.goals (id, user_id, name, type, target_amount, current_amount, deadline)
                VALUES (v_id, p_user, v_item->>'name', 'custom', (v_item->>'target_amount')::NUMERIC, 0, NULLIF(v_item->>'deadline', '')::DATE);
            ELSE
                RAISE EXCEPTION 'Tipo de item inválido: %', v_kind;
            END IF;
            v_out := v_out || jsonb_build_array(jsonb_build_object('idx', v_i, 'kind', v_kind, 'ref_id', v_id));
        ELSE
            -- Repetição do mesmo item (nova tentativa do worker): devolve o que já existe, sem gravar de novo.
            v_out := v_out || jsonb_build_array(jsonb_build_object(
                'idx', v_i, 'kind', v_kind,
                'ref_id', (SELECT ref_id FROM public.whatsapp_actions WHERE wamid = p_wamid AND idx = v_i),
                'repeat', true));
        END IF;
        v_i := v_i + 1;
    END LOOP;
    RETURN v_out;
END
$$;

-- O item ainda está como a Jaki criou? (nada mexido no app depois)
CREATE OR REPLACE FUNCTION public._wa_item_untouched(a public.whatsapp_actions)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_ok BOOLEAN := false;
    v_since TIMESTAMPTZ := GREATEST(a.created_at, COALESCE(a.edited_at, a.created_at));
BEGIN
    IF a.kind = 'transaction' THEN
        SELECT (t.updated_at <= v_since + interval '2 seconds') INTO v_ok FROM public.transactions t WHERE t.id = a.ref_id;
    ELSIF a.kind = 'bill' THEN
        -- contas não têm "atualizado em": vale se ainda está pendente (não foi paga nem baixada)
        SELECT (b.status = 'pending') INTO v_ok FROM public.bills b WHERE b.id = a.ref_id;
    ELSIF a.kind = 'goal' THEN
        SELECT (g.updated_at <= v_since + interval '2 seconds'
                AND NOT EXISTS (SELECT 1 FROM public.goal_contributions c WHERE c.goal_id = g.id)) INTO v_ok
          FROM public.goals g WHERE g.id = a.ref_id;
    END IF;
    RETURN COALESCE(v_ok, false);
END
$$;

CREATE OR REPLACE FUNCTION public.whatsapp_run_op(
    p_task_id UUID,
    p_worker_id UUID,
    p_user_id UUID,
    p_op JSONB,
    p_user_message TEXT,
    p_reply_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    v_task public.whatsapp_inbox%ROWTYPE;
    v_op TEXT := p_op->>'t';
    v_result JSONB := '{}'::jsonb;
    v_pending public.whatsapp_pending%ROWTYPE;
    v_group TEXT;
    v_rows public.whatsapp_actions[];
    v_a public.whatsapp_actions;
    v_items JSONB;
    v_summary JSONB := '[]'::jsonb;
    v_before JSONB;
    v_after JSONB;
    v_tx public.transactions%ROWTYPE;
    v_patch JSONB := p_op->'patch';
    v_n INTEGER;
BEGIN
    -- Trava a linha da fila primeiro (evita execução concorrente da mesma mensagem).
    SELECT * INTO v_task FROM public.whatsapp_inbox WHERE id = p_task_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Task not found'; END IF;

    -- Repetição de uma tentativa que já gravou: devolve o mesmo resultado.
    IF v_task.db_synced THEN
        RETURN COALESCE(v_task.ai_response->'result', '{}'::jsonb);
    END IF;

    -- Fencing token e validade do lease.
    IF v_task.status <> 'processing' OR v_task.worker_id IS NULL OR v_task.worker_id <> p_worker_id
       OR v_task.locked_until IS NULL OR v_task.locked_until <= now() THEN
        RAISE EXCEPTION 'Invalid task state, fencing token mismatch, or lease expired';
    END IF;

    -- O usuário tem que ser o dono do número da mensagem.
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND whatsapp_number = v_task.phone_number) THEN
        RAISE EXCEPTION 'Security violation: user_id does not match the phone number of the task';
    END IF;

    IF v_op = 'chat' THEN
        v_result := jsonb_build_object('status', 'ok');

    ELSIF v_op = 'apply' THEN
        v_items := public._wa_write_items(p_user_id, v_task.phone_number, v_task.wamid, p_op->'items');
        v_result := jsonb_build_object('status', 'ok', 'group', v_task.wamid, 'created', v_items);

    ELSIF v_op = 'pending' THEN
        INSERT INTO public.whatsapp_pending (user_id, phone_number, source_wamid, actions)
        VALUES (p_user_id, v_task.phone_number, v_task.wamid, p_op->'items')
        ON CONFLICT (source_wamid) DO NOTHING;
        SELECT * INTO v_pending FROM public.whatsapp_pending WHERE source_wamid = v_task.wamid;
        v_result := jsonb_build_object('status', 'ok', 'pending_id', v_pending.id);

    ELSIF v_op = 'confirm' THEN
        SELECT * INTO v_pending FROM public.whatsapp_pending
         WHERE id = (p_op->>'pending_id')::UUID AND user_id = p_user_id FOR UPDATE;
        IF NOT FOUND THEN
            v_result := jsonb_build_object('status', 'gone');
        ELSIF v_pending.status = 'confirmed' THEN
            v_result := jsonb_build_object('status', 'already', 'group', v_pending.source_wamid);
        ELSIF v_pending.status = 'cancelled' THEN
            v_result := jsonb_build_object('status', 'cancelled');
        ELSIF v_pending.expires_at <= now() THEN
            v_result := jsonb_build_object('status', 'expired');
        ELSE
            v_items := public._wa_write_items(p_user_id, v_pending.phone_number, v_pending.source_wamid, v_pending.actions);
            UPDATE public.whatsapp_pending SET status = 'confirmed', resolved_at = now() WHERE id = v_pending.id;
            v_result := jsonb_build_object('status', 'ok', 'group', v_pending.source_wamid, 'created', v_items);
        END IF;

    ELSIF v_op = 'cancel' THEN
        SELECT * INTO v_pending FROM public.whatsapp_pending
         WHERE id = (p_op->>'pending_id')::UUID AND user_id = p_user_id FOR UPDATE;
        IF NOT FOUND THEN
            v_result := jsonb_build_object('status', 'gone');
        ELSIF v_pending.status = 'confirmed' THEN
            v_result := jsonb_build_object('status', 'already_confirmed', 'group', v_pending.source_wamid);
        ELSE
            UPDATE public.whatsapp_pending SET status = 'cancelled', resolved_at = COALESCE(resolved_at, now()) WHERE id = v_pending.id;
            v_result := jsonb_build_object('status', 'ok');
        END IF;

    ELSIF v_op = 'undo' THEN
        v_group := NULLIF(p_op->>'group', '');
        IF v_group IS NULL THEN
            -- Texto "desfazer": o grupo mais recente (últimas 24 h) que ainda não foi desfeito.
            SELECT wamid INTO v_group FROM public.whatsapp_actions
             WHERE user_id = p_user_id AND undone_at IS NULL AND created_at > now() - interval '24 hours'
             ORDER BY created_at DESC, idx DESC LIMIT 1;
        END IF;
        IF v_group IS NULL THEN
            v_result := jsonb_build_object('status', 'none');
        ELSE
            -- Trava os itens do grupo (clique duplo em "Desfazer" não apaga duas vezes) e só depois junta.
            PERFORM 1 FROM public.whatsapp_actions a
             WHERE a.user_id = p_user_id AND a.wamid = v_group AND a.undone_at IS NULL AND a.created_at > now() - interval '24 hours'
               FOR UPDATE;
            SELECT array_agg(a ORDER BY a.idx) INTO v_rows FROM public.whatsapp_actions a
             WHERE a.user_id = p_user_id AND a.wamid = v_group AND a.undone_at IS NULL AND a.created_at > now() - interval '24 hours';
            IF v_rows IS NULL THEN
                v_result := jsonb_build_object('status', 'none');
            ELSE
                -- Tudo ou nada: se qualquer item já foi mexido no app, não desfaz nenhum.
                FOREACH v_a IN ARRAY v_rows LOOP
                    IF NOT public._wa_item_untouched(v_a) THEN
                        v_result := jsonb_build_object('status', 'edited');
                    END IF;
                END LOOP;
                IF v_result = '{}'::jsonb THEN
                    FOREACH v_a IN ARRAY v_rows LOOP
                        v_before := NULL;
                        IF v_a.kind = 'transaction' THEN
                            SELECT jsonb_build_object('kind', 'transaction', 'description', description, 'amount', amount) INTO v_before FROM public.transactions WHERE id = v_a.ref_id;
                            DELETE FROM public.transactions WHERE id = v_a.ref_id AND user_id = p_user_id;
                        ELSIF v_a.kind = 'bill' THEN
                            SELECT jsonb_build_object('kind', 'bill', 'description', description, 'amount', amount) INTO v_before FROM public.bills WHERE id = v_a.ref_id;
                            DELETE FROM public.bills WHERE id = v_a.ref_id AND user_id = p_user_id;
                        ELSE
                            SELECT jsonb_build_object('kind', 'goal', 'description', name, 'amount', target_amount) INTO v_before FROM public.goals WHERE id = v_a.ref_id;
                            DELETE FROM public.goals WHERE id = v_a.ref_id AND user_id = p_user_id;
                        END IF;
                        UPDATE public.whatsapp_actions SET undone_at = now() WHERE id = v_a.id;
                        IF v_before IS NOT NULL THEN v_summary := v_summary || jsonb_build_array(v_before); END IF;
                    END LOOP;
                    v_result := jsonb_build_object('status', 'ok', 'removed', v_summary);
                END IF;
            END IF;
        END IF;

    ELSIF v_op = 'update_last' THEN
        v_group := NULLIF(p_op->>'group', '');
        -- Alvo: o lançamento (não desfeito, últimas 24 h) do grupo informado ou o mais recente.
        SELECT a.* INTO v_a FROM public.whatsapp_actions a
         WHERE a.user_id = p_user_id AND a.kind = 'transaction' AND a.undone_at IS NULL
           AND a.created_at > now() - interval '24 hours'
           AND (v_group IS NULL OR a.wamid = v_group)
         ORDER BY a.created_at DESC, a.idx DESC LIMIT 1 FOR UPDATE;
        IF NOT FOUND THEN
            v_result := jsonb_build_object('status', 'none');
        ELSIF NOT public._wa_item_untouched(v_a) THEN
            v_result := jsonb_build_object('status', 'edited');
        ELSE
            SELECT * INTO v_tx FROM public.transactions WHERE id = v_a.ref_id AND user_id = p_user_id;
            IF NOT FOUND THEN
                v_result := jsonb_build_object('status', 'none');
            ELSE
                v_before := jsonb_build_object('description', v_tx.description, 'amount', v_tx.amount, 'date', v_tx.date,
                                               'category_id', v_tx.category_id,
                                               'category', (SELECT c.name FROM public.categories c WHERE c.id = v_tx.category_id));
                UPDATE public.transactions SET
                    amount      = COALESCE((v_patch->>'amount')::NUMERIC, amount),
                    description = COALESCE(NULLIF(v_patch->>'description', ''), description),
                    date        = COALESCE((v_patch->>'date')::DATE, date),
                    category_id = CASE WHEN v_patch ? 'category_id' THEN NULLIF(v_patch->>'category_id', '')::UUID ELSE category_id END
                 WHERE id = v_tx.id;
                UPDATE public.whatsapp_actions SET edited_at = now() WHERE id = v_a.id;
                SELECT jsonb_build_object('description', t.description, 'amount', t.amount, 'date', t.date, 'category_id', t.category_id,
                                          'category', (SELECT c.name FROM public.categories c WHERE c.id = t.category_id))
                  INTO v_after FROM public.transactions t WHERE t.id = v_tx.id;
                v_result := jsonb_build_object('status', 'ok', 'group', v_a.wamid, 'before', v_before, 'after', v_after);
            END IF;
        END IF;

    ELSE
        RAISE EXCEPTION 'Operação inválida: %', v_op;
    END IF;

    -- Conversa guardada uma vez só (a repetição sai no início, pelo db_synced).
    IF p_user_message IS NOT NULL AND p_user_message <> '' THEN
        INSERT INTO public.chat_history (user_id, message_role, content)
        VALUES (p_user_id, 'user', left(p_user_message, 2000)), (p_user_id, 'assistant', left(COALESCE(p_reply_text, ''), 2000));
    END IF;

    UPDATE public.whatsapp_inbox
       SET db_synced = true,
           ai_response = COALESCE(ai_response, '{}'::jsonb) || jsonb_build_object('result', v_result),
           updated_at = now()
     WHERE id = p_task_id AND worker_id = p_worker_id;

    RETURN v_result;
END
$$;

-- Só o worker (chave de serviço) executa estas funções.
REVOKE EXECUTE ON FUNCTION public._wa_as_user(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.whatsapp_household_ids(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.whatsapp_account_balances(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.whatsapp_card_invoice_summary(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.whatsapp_mei_year_summary(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public._wa_write_items(UUID, TEXT, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public._wa_item_untouched(public.whatsapp_actions) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.whatsapp_run_op(UUID, UUID, UUID, JSONB, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._wa_as_user(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.whatsapp_household_ids(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.whatsapp_account_balances(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.whatsapp_card_invoice_summary(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.whatsapp_mei_year_summary(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public._wa_write_items(UUID, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public._wa_item_untouched(public.whatsapp_actions) TO service_role;
GRANT EXECUTE ON FUNCTION public.whatsapp_run_op(UUID, UUID, UUID, JSONB, TEXT, TEXT) TO service_role;

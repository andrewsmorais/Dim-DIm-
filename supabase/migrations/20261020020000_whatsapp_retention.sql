-- Prazo de guarda das mensagens do WhatsApp (LGPD: guardar só o necessário, pelo tempo necessário).
-- Depois de 30 dias, a fila deixa de guardar o conteúdo bruto (texto, nome do perfil, payload da Meta)
-- e a resposta da IA. Ficam só os metadados técnicos: wamid, número, tipo da mensagem, datas e status.
-- Os lançamentos já gravados em `transactions` NÃO são tocados. O número fica na linha técnica para que
-- a exclusão de conta (src/app/api/account/delete) continue apagando tudo do usuário.
-- A Meta reenvia um evento por até 7 dias, então 30 dias não reabre a janela de duplicidade.

CREATE OR REPLACE FUNCTION public.purge_whatsapp_inbox_payloads(p_days INT DEFAULT 30)
RETURNS INT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_count INT;
BEGIN
    IF p_days < 7 THEN
        RAISE EXCEPTION 'p_days deve ser >= 7 (a Meta reenvia eventos por até 7 dias)';
    END IF;

    UPDATE whatsapp_inbox
    SET raw_payload = jsonb_build_object(
            'purged', true,
            'type', raw_payload #>> '{entry,0,changes,0,value,messages,0,type}'
        ),
        ai_response = NULL,
        updated_at = NOW()
    WHERE status IN ('completed', 'failed')
      AND created_at < NOW() - make_interval(days => p_days)
      AND COALESCE((raw_payload ->> 'purged')::boolean, false) = false;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.purge_whatsapp_inbox_payloads(INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purge_whatsapp_inbox_payloads(INT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.purge_whatsapp_inbox_payloads(INT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.purge_whatsapp_inbox_payloads(INT) TO service_role;

-- Agenda todo dia às 03:17 (horário de Brasília = 06:17 UTC), só se o pg_cron estiver ligado.
-- cron.schedule com o mesmo nome atualiza o job, então rodar de novo não duplica.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule('whatsapp_inbox_purge', '17 6 * * *', 'SELECT public.purge_whatsapp_inbox_payloads(30)');
    END IF;
END $$;

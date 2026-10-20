-- Remove o agendamento e a função. O conteúdo já apagado NÃO volta.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
       AND EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'whatsapp_inbox_purge') THEN
        PERFORM cron.unschedule('whatsapp_inbox_purge');
    END IF;
END $$;

DROP FUNCTION IF EXISTS public.purge_whatsapp_inbox_payloads(INT);

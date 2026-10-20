-- Desfaz 20261020060000_whatsapp_conversation.sql.
-- Atenção: apagar whatsapp_actions faz o "desfazer" esquecer o que a Jaki criou antes (os lançamentos em si continuam).
DROP FUNCTION IF EXISTS public.whatsapp_run_op(UUID, UUID, UUID, JSONB, TEXT, TEXT);
DROP FUNCTION IF EXISTS public._wa_item_untouched(public.whatsapp_actions);
DROP FUNCTION IF EXISTS public._wa_write_items(UUID, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.whatsapp_mei_year_summary(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.whatsapp_card_invoice_summary(UUID);
DROP FUNCTION IF EXISTS public.whatsapp_account_balances(UUID);
DROP FUNCTION IF EXISTS public.whatsapp_household_ids(UUID);
DROP FUNCTION IF EXISTS public._wa_as_user(UUID);
DROP TABLE IF EXISTS public.whatsapp_pending;
DROP TABLE IF EXISTS public.whatsapp_actions;

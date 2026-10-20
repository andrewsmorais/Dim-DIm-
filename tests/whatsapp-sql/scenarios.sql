CREATE FUNCTION pg_temp.age(p_wamid text, p_by interval) RETURNS void LANGUAGE plpgsql AS $f$
BEGIN
  ALTER TABLE public.transactions DISABLE TRIGGER update_transactions_updated_at;
  ALTER TABLE public.goals DISABLE TRIGGER update_goals_updated_at;
  UPDATE public.transactions SET created_at = created_at - p_by, updated_at = updated_at - p_by WHERE source_wamid = p_wamid;
  UPDATE public.goals SET created_at = created_at - p_by, updated_at = updated_at - p_by WHERE id IN (SELECT ref_id FROM public.whatsapp_actions WHERE wamid = p_wamid AND kind = 'goal');
  ALTER TABLE public.transactions ENABLE TRIGGER update_transactions_updated_at;
  ALTER TABLE public.goals ENABLE TRIGGER update_goals_updated_at;
  UPDATE public.whatsapp_actions SET created_at = created_at - p_by WHERE wamid = p_wamid;
END $f$;

CREATE FUNCTION pg_temp.mk_task(p_phone text, p_wamid text, p_worker uuid) RETURNS uuid LANGUAGE plpgsql AS $f$
DECLARE v uuid;
BEGIN
  INSERT INTO public.whatsapp_inbox (wamid, phone_number, raw_payload, status, worker_id, locked_until, ai_response)
  VALUES (p_wamid, p_phone, '{}'::jsonb, 'processing', p_worker, now() + interval '1 hour', '{"v":2}'::jsonb) RETURNING id INTO v;
  RETURN v;
END $f$;

DO $test$
DECLARE
  ua uuid := gen_random_uuid(); ub uuid := gen_random_uuid(); uc uuid := gen_random_uuid();
  w uuid := gen_random_uuid();
  t uuid; r jsonb; out jsonb := '{}'::jsonb; n int; pid uuid; bal jsonb;
  items jsonb;
BEGIN
  INSERT INTO auth.users (id, email) VALUES (ua,'a@test.invalid'),(ub,'b@test.invalid'),(uc,'c@test.invalid');
  UPDATE public.profiles SET whatsapp_number='5511900000001' WHERE id=ua;
  UPDATE public.profiles SET whatsapp_number='5511900000002' WHERE id=ub;
  UPDATE public.profiles SET whatsapp_number='5511900000003' WHERE id=uc;

  items := '[{"kind":"transaction","flow":"expense","amount":45.5,"description":"Mercado","date":"2026-10-20"},{"kind":"transaction","flow":"expense","amount":20,"description":"Uber","date":"2026-10-20"}]';
  t := pg_temp.mk_task('5511900000001','wamid.T1',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','apply','items',items), 'gastei 45,50 no mercado e 20 de uber', 'Anotei');
  SELECT count(*) INTO n FROM public.transactions WHERE user_id=ua AND source_wamid='wamid.T1';
  out := out || jsonb_build_object('T1_status', r->>'status', 'T1_created', jsonb_array_length(r->'created'), 'T1_tx', n);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','apply','items',items), 'gastei 45,50 no mercado e 20 de uber', 'Anotei');
  SELECT count(*) INTO n FROM public.transactions WHERE user_id=ua AND source_wamid='wamid.T1';
  out := out || jsonb_build_object('T1_retry_tx', n, 'T1_chat_rows', (SELECT count(*) FROM public.chat_history WHERE user_id=ua));
  r := public._wa_write_items(ua,'5511900000001','wamid.T1',items);
  SELECT count(*) INTO n FROM public.transactions WHERE user_id=ua AND source_wamid='wamid.T1';
  out := out || jsonb_build_object('T1_direct_repeat_tx', n, 'T1_direct_repeat_flag', r->0->>'repeat');

  items := '[{"kind":"bill","description":"Luz","amount":180,"due_date":"2026-11-10","bill_kind":"expense","recurrence":"monthly"},{"kind":"goal","name":"Viagem","target_amount":2000,"deadline":"2027-06-30"},{"kind":"transaction","flow":"expense","amount":1500,"description":"Geladeira","date":"2026-10-20"}]';
  t := pg_temp.mk_task('5511900000001','wamid.T2',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','pending','items',items), 'cria luz 180 todo dia 10', 'Confirma?');
  pid := (r->>'pending_id')::uuid;
  out := out || jsonb_build_object('T2_pending_id_ok', pid IS NOT NULL, 'T2_open_pending', (SELECT count(*) FROM public.whatsapp_pending WHERE user_id=ua AND status='open'));
  t := pg_temp.mk_task('5511900000001','wamid.T3',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','confirm','pending_id',pid), 'Confirmar', 'Pronto');
  out := out || jsonb_build_object('T3_status', r->>'status', 'T3_created', jsonb_array_length(r->'created'),
     'T3_bill', (SELECT count(*) FROM public.bills WHERE user_id=ua AND description='Luz' AND recurrence='monthly'),
     'T3_goal', (SELECT count(*) FROM public.goals WHERE user_id=ua AND name='Viagem'),
     'T3_tx_origin', (SELECT origin::text FROM public.transactions WHERE user_id=ua AND description='Geladeira'));
  t := pg_temp.mk_task('5511900000001','wamid.T4',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','confirm','pending_id',pid), 'Confirmar', 'Pronto');
  out := out || jsonb_build_object('T4_second_confirm', r->>'status', 'T4_bills_still_1', (SELECT count(*) FROM public.bills WHERE user_id=ua AND description='Luz'));
  t := pg_temp.mk_task('5511900000001','wamid.T4b',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','cancel','pending_id',pid), 'Cancelar', 'x');
  out := out || jsonb_build_object('T4_cancel_after_confirm', r->>'status');

  t := pg_temp.mk_task('5511900000001','wamid.T5',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','pending','items','[{"kind":"goal","name":"Moto","target_amount":9000}]'::jsonb), 'quero moto', 'Confirma?');
  pid := (r->>'pending_id')::uuid;
  t := pg_temp.mk_task('5511900000001','wamid.T6',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','cancel','pending_id',pid), 'Cancelar', 'ok');
  out := out || jsonb_build_object('T5_cancel', r->>'status');
  t := pg_temp.mk_task('5511900000001','wamid.T7',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','confirm','pending_id',pid), 'Confirmar', 'x');
  out := out || jsonb_build_object('T5_confirm_after_cancel', r->>'status', 'T5_moto_goals', (SELECT count(*) FROM public.goals WHERE user_id=ua AND name='Moto'));
  t := pg_temp.mk_task('5511900000001','wamid.T8',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','pending','items','[{"kind":"goal","name":"Casa","target_amount":50000}]'::jsonb), 'quero casa', 'Confirma?');
  pid := (r->>'pending_id')::uuid;
  UPDATE public.whatsapp_pending SET expires_at = now() - interval '1 minute' WHERE id = pid;
  t := pg_temp.mk_task('5511900000001','wamid.T9',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','confirm','pending_id',pid), 'Confirmar', 'x');
  out := out || jsonb_build_object('T5_expired', r->>'status');
  t := pg_temp.mk_task('5511900000002','wamid.T9b',w);
  r := public.whatsapp_run_op(t, w, ub, jsonb_build_object('t','confirm','pending_id',pid), 'Confirmar', 'x');
  out := out || jsonb_build_object('T5_other_user_confirm', r->>'status');

  PERFORM pg_temp.age('wamid.T1', interval '30 minutes');
  PERFORM pg_temp.age('wamid.T2', interval '20 minutes');
  t := pg_temp.mk_task('5511900000001','wamid.T10',w);
  r := public.whatsapp_run_op(t, w, ua, '{"t":"undo","group":"wamid.T1"}'::jsonb, 'desfazer', 'x');
  out := out || jsonb_build_object('T6_undo_status', r->>'status', 'T6_removed', jsonb_array_length(r->'removed'),
     'T6_tx_left', (SELECT count(*) FROM public.transactions WHERE user_id=ua AND source_wamid='wamid.T1'));
  t := pg_temp.mk_task('5511900000001','wamid.T11',w);
  r := public.whatsapp_run_op(t, w, ua, '{"t":"undo","group":"wamid.T1"}'::jsonb, 'desfazer', 'x');
  out := out || jsonb_build_object('T6_undo_again', r->>'status');
  t := pg_temp.mk_task('5511900000001','wamid.T12',w);
  r := public.whatsapp_run_op(t, w, ua, '{"t":"undo"}'::jsonb, 'desfazer', 'x');
  out := out || jsonb_build_object('T6_text_undo_status', r->>'status', 'T6_text_undo_removed', jsonb_array_length(r->'removed'),
     'T6_bill_left', (SELECT count(*) FROM public.bills WHERE user_id=ua AND description='Luz'),
     'T6_goal_left', (SELECT count(*) FROM public.goals WHERE user_id=ua AND name='Viagem'),
     'T6_geladeira_left', (SELECT count(*) FROM public.transactions WHERE user_id=ua AND description='Geladeira'));
  t := pg_temp.mk_task('5511900000001','wamid.T13',w);
  r := public.whatsapp_run_op(t, w, ua, '{"t":"undo"}'::jsonb, 'desfazer', 'x');
  out := out || jsonb_build_object('T6_nothing_left', r->>'status');

  t := pg_temp.mk_task('5511900000001','wamid.T14',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','apply','items','[{"kind":"transaction","flow":"expense","amount":30,"description":"Padaria","date":"2026-10-20"}]'::jsonb), 'padaria 30', 'Anotei');
  UPDATE public.whatsapp_actions SET created_at = now() - interval '10 minutes' WHERE wamid='wamid.T14';
  UPDATE public.transactions SET description='Padaria (editado no app)' WHERE source_wamid='wamid.T14';
  t := pg_temp.mk_task('5511900000001','wamid.T15',w);
  r := public.whatsapp_run_op(t, w, ua, '{"t":"undo","group":"wamid.T14"}'::jsonb, 'desfazer', 'x');
  out := out || jsonb_build_object('T7_undo_edited', r->>'status', 'T7_tx_still', (SELECT count(*) FROM public.transactions WHERE source_wamid='wamid.T14'));
  t := pg_temp.mk_task('5511900000001','wamid.T16',w);
  r := public.whatsapp_run_op(t, w, ua, '{"t":"update_last","group":"wamid.T14","patch":{"amount":35}}'::jsonb, 'corrige pra 35', 'x');
  out := out || jsonb_build_object('T7_update_edited', r->>'status');

  t := pg_temp.mk_task('5511900000001','wamid.T17',w);
  r := public.whatsapp_run_op(t, w, ua, jsonb_build_object('t','apply','items','[{"kind":"transaction","flow":"expense","amount":40,"description":"Mercado","date":"2026-10-20"}]'::jsonb), 'mercado 40', 'Anotei');
  t := pg_temp.mk_task('5511900000001','wamid.T18',w);
  r := public.whatsapp_run_op(t, w, ua, '{"t":"update_last","patch":{"amount":45,"date":"2026-10-19"}}'::jsonb, 'corrige pra 45, foi ontem', 'x');
  out := out || jsonb_build_object('T8_update', r->>'status', 'T8_before_amount', r->'before'->>'amount', 'T8_after_amount', r->'after'->>'amount', 'T8_after_date', r->'after'->>'date');
  t := pg_temp.mk_task('5511900000001','wamid.T19',w);
  r := public.whatsapp_run_op(t, w, ua, '{"t":"undo","group":"wamid.T17"}'::jsonb, 'desfazer', 'x');
  out := out || jsonb_build_object('T8_undo_after_update', r->>'status', 'T8_gone', (SELECT count(*) FROM public.transactions WHERE source_wamid='wamid.T17'));

  t := pg_temp.mk_task('5511900000001','wamid.T20',w);
  BEGIN
    PERFORM public.whatsapp_run_op(t, w, ub, '{"t":"chat"}'::jsonb, 'oi', 'oi');
    out := out || jsonb_build_object('T9_cross_user', 'NAO_BLOQUEOU');
  EXCEPTION WHEN OTHERS THEN out := out || jsonb_build_object('T9_cross_user', 'bloqueado: ' || SQLERRM); END;
  BEGIN
    PERFORM public.whatsapp_run_op(t, gen_random_uuid(), ua, '{"t":"chat"}'::jsonb, 'oi', 'oi');
    out := out || jsonb_build_object('T9_wrong_worker', 'NAO_BLOQUEOU');
  EXCEPTION WHEN OTHERS THEN out := out || jsonb_build_object('T9_wrong_worker', 'bloqueado: ' || SQLERRM); END;
  UPDATE public.whatsapp_inbox SET locked_until = now() - interval '1 minute' WHERE id = t;
  BEGIN
    PERFORM public.whatsapp_run_op(t, w, ua, '{"t":"chat"}'::jsonb, 'oi', 'oi');
    out := out || jsonb_build_object('T9_lease', 'NAO_BLOQUEOU');
  EXCEPTION WHEN OTHERS THEN out := out || jsonb_build_object('T9_lease', 'bloqueado: ' || SQLERRM); END;
  t := pg_temp.mk_task('5511900000001','wamid.T21',w);
  BEGIN
    PERFORM public.whatsapp_run_op(t, w, ua, '{"t":"drop_table"}'::jsonb, 'oi', 'oi');
    out := out || jsonb_build_object('T9_bad_op', 'NAO_BLOQUEOU');
  EXCEPTION WHEN OTHERS THEN out := out || jsonb_build_object('T9_bad_op', 'bloqueado: ' || SQLERRM); END;

  INSERT INTO public.accounts (user_id, name, initial_balance) VALUES (ua,'Conta A',100),(ub,'Conta B',200),(uc,'Conta C',999);
  INSERT INTO public.partnerships (owner_id, partner_id, status, invite_code) VALUES (ua, ub, 'accepted', 'TESTXX01');
  SELECT jsonb_agg(name ORDER BY name) INTO bal FROM public.whatsapp_account_balances(ua);
  out := out || jsonb_build_object('T10_balances_A', bal);
  SELECT jsonb_agg(name ORDER BY name) INTO bal FROM public.whatsapp_account_balances(ub);
  out := out || jsonb_build_object('T10_balances_B', bal);
  SELECT jsonb_agg(name ORDER BY name) INTO bal FROM public.whatsapp_account_balances(uc);
  out := out || jsonb_build_object('T10_balances_C', bal);
  out := out || jsonb_build_object('T10_household_A_has_B_not_C',
      ARRAY(SELECT x FROM public.whatsapp_household_ids(ua) x) @> ARRAY[ua,ub] AND NOT (uc = ANY(ARRAY(SELECT x FROM public.whatsapp_household_ids(ua) x))));
  out := out || jsonb_build_object('T10_household_C_only_C', ARRAY(SELECT x FROM public.whatsapp_household_ids(uc) x) = ARRAY[uc]);

  RAISE EXCEPTION 'RESULT %', out::text;
END
$test$;

-- Trigger para criar perfil automaticamente quando um novo usuário se registra (via password ou OAuth)
-- O trigger extrai full_name do raw_user_meta_data (preenchido pelo Supabase Auth com dados do OAuth)

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

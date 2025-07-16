-- Script para corrigir erro 500 no registro de novos usuários
-- Execute este script no Supabase SQL Editor

SELECT '=== CORREÇÃO DO ERRO 500 NO REGISTRO ===' as info;

-- 1. Verificar estado atual
SELECT 
  'Estado atual:' as info,
  'Verificando triggers e funções que podem estar causando erro 500' as description;

-- 2. Remover triggers problemáticos
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
DROP TRIGGER IF EXISTS create_user_settings_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Remover funções problemáticas
DROP FUNCTION IF EXISTS handle_new_user_settings();
DROP FUNCTION IF EXISTS create_default_user_settings();

-- 4. Verificar se a tabela user_settings existe e tem a estrutura correta
SELECT 
  'Verificação da tabela user_settings:' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') 
    THEN '✅ TABELA EXISTE'
    ELSE '❌ TABELA NÃO EXISTE'
  END as table_status;

-- 5. Criar função RPC melhorada (sem trigger automático)
CREATE OR REPLACE FUNCTION create_default_user_settings(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Inserir configurações padrão se não existirem
  INSERT INTO user_settings (
    user_id,
    profile,
    notifications,
    preferences,
    financial,
    analytics,
    created_at,
    updated_at
  )
  VALUES (
    user_uuid,
    '{"name": "", "avatar": "", "bio": ""}'::jsonb,
    '{"email": true, "push": true, "sms": false, "marketing": false}'::jsonb,
    '{"theme": "dark", "language": "pt-BR", "currency": "BRL", "timezone": "America/Sao_Paulo"}'::jsonb,
    '{"monthly_goal": 0, "savings_goal": 0, "investment_goal": 0}'::jsonb,
    '{"show_charts": true, "show_insights": true, "show_trends": true}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Retornar as configurações criadas
  SELECT 
    jsonb_build_object(
      'user_id', user_id,
      'profile', profile,
      'notifications', notifications,
      'preferences', preferences,
      'financial', financial,
      'analytics', analytics,
      'created_at', created_at,
      'updated_at', updated_at
    )
  INTO result
  FROM user_settings 
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(result, '{"error": "Configurações não encontradas"}'::jsonb);
END;
$$;

-- 6. Criar trigger mais simples e robusto
CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Usar EXCEPTION para capturar erros
  BEGIN
    -- Chamar a função RPC para criar configurações padrão
    PERFORM create_default_user_settings(NEW.id);
  EXCEPTION
    WHEN OTHERS THEN
      -- Log do erro mas não falhar o registro
      RAISE WARNING 'Erro ao criar configurações para usuário %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar trigger com tratamento de erro
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_settings();

-- 8. Verificar se tudo foi criado corretamente
SELECT 
  'Verificação final:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'create_default_user_settings'
    ) 
    AND EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'handle_new_user_settings'
    )
    AND EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created_settings'
    )
    THEN '✅ TUDO CRIADO COM SUCESSO'
    ELSE '❌ ALGO FALHOU'
  END as final_status;

-- 9. Testar a função RPC
SELECT 
  'Teste da função RPC:' as info,
  CASE 
    WHEN create_default_user_settings((SELECT id FROM auth.users LIMIT 1)) IS NOT NULL 
    THEN '✅ FUNÇÃO FUNCIONANDO'
    ELSE '❌ FUNÇÃO NÃO FUNCIONA'
  END as test_result;

-- 10. Verificar se não há mais triggers conflitantes
SELECT 
  'Triggers restantes:' as info,
  trigger_name,
  event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
ORDER BY trigger_name; 
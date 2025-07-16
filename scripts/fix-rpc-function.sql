-- Script para corrigir a função RPC create_default_user_settings
-- Execute este script no Supabase SQL Editor

SELECT '=== CORREÇÃO DA FUNÇÃO RPC ===' as info;

-- 1. Verificar se a função existe
SELECT 
  'Verificação inicial:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'create_default_user_settings'
    ) THEN '✅ FUNÇÃO EXISTE'
    ELSE '❌ FUNÇÃO NÃO EXISTE'
  END as function_status;

-- 2. Remover trigger que depende da função (se houver)
DROP TRIGGER IF EXISTS create_user_settings_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Remover função existente (agora sem dependências)
DROP FUNCTION IF EXISTS create_default_user_settings(UUID);
DROP FUNCTION IF EXISTS create_default_user_settings();

-- 4. Criar função RPC correta
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

-- 5. Recriar trigger para novos usuários
CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Chamar a função RPC para criar configurações padrão
  PERFORM create_default_user_settings(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_settings();

-- 6. Verificar se a função foi criada
SELECT 
  'Verificação após criação:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'create_default_user_settings'
    ) THEN '✅ FUNÇÃO CRIADA COM SUCESSO'
    ELSE '❌ FALHA NA CRIAÇÃO DA FUNÇÃO'
  END as function_status;

-- 7. Testar a função
SELECT 
  'Teste da função:' as info,
  CASE 
    WHEN create_default_user_settings((SELECT id FROM auth.users LIMIT 1)) IS NOT NULL 
    THEN '✅ FUNÇÃO FUNCIONANDO'
    ELSE '❌ FUNÇÃO NÃO FUNCIONA'
  END as test_result;

-- 8. Verificar detalhes da função
SELECT 
  'Detalhes da função:' as info,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'create_default_user_settings';

-- 9. Verificação final
SELECT 
  'VERIFICAÇÃO FINAL:' as info,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_settings) 
    AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_settings') >= 4
    AND (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'create_default_user_settings') = 1
    THEN '✅ CORREÇÃO COMPLETA - TODAS AS CONDIÇÕES ATENDIDAS'
    ELSE '❌ CORREÇÃO INCOMPLETA - Verificar problemas acima'
  END as final_status; 
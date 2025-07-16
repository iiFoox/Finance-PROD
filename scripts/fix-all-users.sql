-- Script para corrigir todos os usuários e garantir configurações padrão
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar o estado atual
SELECT '=== VERIFICAÇÃO INICIAL ===' as info;

SELECT 
  'Total de usuários no sistema:' as info,
  COUNT(*) as total_users
FROM auth.users;

SELECT 
  'Total de configurações no sistema:' as info,
  COUNT(*) as total_settings
FROM user_settings;

SELECT 
  'Usuários sem configurações:' as info,
  COUNT(*) as users_without_settings
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE us.user_id IS NULL;

-- 2. Criar função RPC melhorada para criar configurações padrão
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

-- 3. Criar configurações para todos os usuários que não têm
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
SELECT 
  u.id,
  '{"name": "", "avatar": "", "bio": ""}'::jsonb,
  '{"email": true, "push": true, "sms": false, "marketing": false}'::jsonb,
  '{"theme": "dark", "language": "pt-BR", "currency": "BRL", "timezone": "America/Sao_Paulo"}'::jsonb,
  '{"monthly_goal": 0, "savings_goal": 0, "investment_goal": 0}'::jsonb,
  '{"show_charts": true, "show_insights": true, "show_trends": true}'::jsonb,
  NOW(),
  NOW()
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE us.user_id IS NULL;

-- 4. Criar trigger para novos usuários
CREATE OR REPLACE FUNCTION handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Chamar a função RPC para criar configurações padrão
  PERFORM create_default_user_settings(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_settings();

-- 5. Verificação final
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
  'Total de usuários no sistema:' as info,
  COUNT(*) as total_users
FROM auth.users;

SELECT 
  'Total de configurações no sistema:' as info,
  COUNT(*) as total_settings
FROM user_settings;

SELECT 
  'Usuários sem configurações (deve ser 0):' as info,
  COUNT(*) as users_without_settings
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE us.user_id IS NULL;

SELECT 
  'Políticas RLS ativas:' as info,
  COUNT(*) as active_policies
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 6. Teste da função RPC
SELECT 
  'Teste da função RPC:' as info,
  create_default_user_settings((SELECT id FROM auth.users LIMIT 1)) as test_result; 
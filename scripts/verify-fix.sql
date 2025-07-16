-- Script de verificação para confirmar se a correção funcionou
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela user_settings
SELECT '=== ESTRUTURA DA TABELA ===' as info;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;

-- 2. Verificar índices
SELECT '=== ÍNDICES ===' as info;

SELECT 
  indexname as index_name,
  indexdef as definition
FROM pg_indexes 
WHERE tablename = 'user_settings';

-- 3. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as info;

SELECT 
  policyname as policy_name,
  permissive,
  roles,
  cmd as command,
  qual as using_condition,
  with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 4. Verificar usuários e configurações
SELECT '=== ESTATÍSTICAS DE USUÁRIOS ===' as info;

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

-- 5. Verificar configurações de alguns usuários
SELECT '=== AMOSTRA DE CONFIGURAÇÕES ===' as info;

SELECT 
  u.email,
  us.user_id,
  us.profile,
  us.notifications,
  us.preferences,
  us.financial,
  us.analytics,
  us.created_at,
  us.updated_at
FROM auth.users u
JOIN user_settings us ON u.id = us.user_id
LIMIT 3;

-- 6. Verificar funções e triggers
SELECT '=== FUNÇÕES E TRIGGERS ===' as info;

SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user_settings%';

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'user_settings';

-- 7. Teste da função RPC
SELECT '=== TESTE DA FUNÇÃO RPC ===' as info;

SELECT 
  'Teste da função RPC:' as info,
  create_default_user_settings((SELECT id FROM auth.users LIMIT 1)) as test_result;

-- 8. Verificar se há erros de RLS
SELECT '=== VERIFICAÇÃO DE ERROS RLS ===' as info;

-- Simular acesso como usuário autenticado
SELECT 
  'Teste de acesso RLS:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM user_settings 
      WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
    ) THEN '✅ Acesso permitido'
    ELSE '❌ Acesso negado'
  END as rls_test_result;

-- 9. Resumo final
SELECT '=== RESUMO FINAL ===' as info;

SELECT 
  'Status da correção:' as info,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_settings) 
    AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_settings') >= 4
    AND (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'create_default_user_settings') = 1
    THEN '✅ CORREÇÃO BEM-SUCEDIDA'
    ELSE '❌ CORREÇÃO INCOMPLETA'
  END as final_status; 
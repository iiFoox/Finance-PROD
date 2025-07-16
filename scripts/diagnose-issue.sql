-- Script de diagnóstico para identificar qual condição está falhando
-- Execute este script no Supabase SQL Editor

SELECT '=== DIAGNÓSTICO DETALHADO ===' as info;

-- 1. Verificar condição 1: Total de usuários vs configurações
SELECT 
  'CONDIÇÃO 1 - Usuários vs Configurações:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM user_settings) as total_settings,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_settings) 
    THEN '✅ IGUAL' 
    ELSE '❌ DIFERENTE' 
  END as status;

-- 2. Verificar condição 2: Políticas RLS
SELECT 
  'CONDIÇÃO 2 - Políticas RLS:' as info,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_settings') as total_policies,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_settings') >= 4 
    THEN '✅ SUFICIENTES' 
    ELSE '❌ INSUFICIENTES' 
  END as status;

-- 3. Verificar condição 3: Função RPC
SELECT 
  'CONDIÇÃO 3 - Função RPC:' as info,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'create_default_user_settings') as function_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'create_default_user_settings') = 1 
    THEN '✅ EXISTE' 
    ELSE '❌ NÃO EXISTE' 
  END as status;

-- 4. Listar todas as políticas RLS para user_settings
SELECT 
  'POLÍTICAS RLS DETALHADAS:' as info,
  policyname as policy_name,
  cmd as operation,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'user_settings'
ORDER BY policyname;

-- 5. Verificar funções relacionadas
SELECT 
  'FUNÇÕES RELACIONADAS:' as info,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user_settings%'
ORDER BY routine_name;

-- 6. Verificar triggers
SELECT 
  'TRIGGERS:' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'user_settings';

-- 7. Verificar se há usuários sem configurações
SELECT 
  'USUÁRIOS SEM CONFIGURAÇÕES:' as info,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ NENHUM' 
    ELSE '❌ ' || COUNT(*) || ' USUÁRIOS' 
  END as status
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE us.user_id IS NULL;

-- 8. Resumo final com detalhes
SELECT 
  'RESUMO FINAL:' as info,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_settings) 
    AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_settings') >= 4
    AND (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'create_default_user_settings') = 1
    THEN '✅ TODAS AS CONDIÇÕES ATENDIDAS'
    ELSE '❌ ALGUMA CONDIÇÃO FALHOU - Verificar detalhes acima'
  END as final_status; 
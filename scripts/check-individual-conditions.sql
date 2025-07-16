-- Script para verificar cada condição individualmente
-- Execute este script no Supabase SQL Editor

SELECT '=== VERIFICAÇÃO INDIVIDUAL DAS CONDIÇÕES ===' as info;

-- CONDIÇÃO 1: Usuários vs Configurações
SELECT '=== CONDIÇÃO 1: USUÁRIOS VS CONFIGURAÇÕES ===' as info;

SELECT 
  'Detalhes:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM user_settings) as total_settings,
  (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM user_settings) as difference;

-- Verificar usuários sem configurações
SELECT 
  'Usuários sem configurações:' as info,
  u.email,
  u.id
FROM auth.users u
LEFT JOIN user_settings us ON u.id = us.user_id
WHERE us.user_id IS NULL
LIMIT 5;

-- CONDIÇÃO 2: Políticas RLS
SELECT '=== CONDIÇÃO 2: POLÍTICAS RLS ===' as info;

SELECT 
  'Total de políticas:' as info,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_settings';

-- Listar políticas existentes
SELECT 
  'Políticas existentes:' as info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'user_settings'
ORDER BY policyname;

-- CONDIÇÃO 3: Função RPC
SELECT '=== CONDIÇÃO 3: FUNÇÃO RPC ===' as info;

SELECT 
  'Funções encontradas:' as info,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user_settings%';

-- Testar função RPC
SELECT 
  'Teste da função RPC:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'create_default_user_settings'
    ) THEN '✅ FUNÇÃO EXISTE'
    ELSE '❌ FUNÇÃO NÃO EXISTE'
  END as function_status;

-- RESUMO FINAL
SELECT '=== RESUMO FINAL ===' as info;

SELECT 
  'Status de cada condição:' as info,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_settings) 
    THEN '✅ CONDIÇÃO 1: OK'
    ELSE '❌ CONDIÇÃO 1: FALHOU'
  END as condicao_1,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_settings') >= 4 
    THEN '✅ CONDIÇÃO 2: OK'
    ELSE '❌ CONDIÇÃO 2: FALHOU'
  END as condicao_2,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'create_default_user_settings') = 1 
    THEN '✅ CONDIÇÃO 3: OK'
    ELSE '❌ CONDIÇÃO 3: FALHOU'
  END as condicao_3; 
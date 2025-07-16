-- Script para verificar problemas com triggers que podem estar causando erro 500
-- Execute este script no Supabase SQL Editor

SELECT '=== VERIFICAÇÃO DE TRIGGERS ===' as info;

-- 1. Verificar triggers existentes
SELECT 
  'Triggers ativos:' as info,
  trigger_name,
  event_manipulation,
  action_statement,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table = 'users'
ORDER BY trigger_name;

-- 2. Verificar triggers no auth.users
SELECT 
  'Triggers no auth.users:' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
ORDER BY trigger_name;

-- 3. Verificar se há conflitos de triggers
SELECT 
  'Verificação de conflitos:' as info,
  COUNT(*) as total_triggers_on_auth_users
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users';

-- 4. Verificar funções de trigger
SELECT 
  'Funções de trigger:' as info,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- 5. Testar se o trigger está funcionando
SELECT 
  'Teste do trigger:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_schema = 'auth' 
      AND event_object_table = 'users'
      AND trigger_name = 'on_auth_user_created_settings'
    ) THEN '✅ TRIGGER EXISTE'
    ELSE '❌ TRIGGER NÃO EXISTE'
  END as trigger_status;

-- 6. Verificar se há erros na função do trigger
SELECT 
  'Verificação da função handle_new_user_settings:' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'handle_new_user_settings'
    ) THEN '✅ FUNÇÃO EXISTE'
    ELSE '❌ FUNÇÃO NÃO EXISTE'
  END as function_status;

-- 7. Verificar estrutura da tabela user_settings
SELECT 
  'Estrutura da tabela user_settings:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
ORDER BY ordinal_position;

-- 8. Verificar se há constraints que podem estar causando problemas
SELECT 
  'Constraints da tabela user_settings:' as info,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_settings';

-- 9. Verificar se há índices únicos que podem estar causando conflitos
SELECT 
  'Índices únicos:' as info,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'user_settings' 
AND indexdef LIKE '%UNIQUE%'; 
-- Script para corrigir as políticas RLS da tabela user_settings
-- Execute este script no Supabase SQL Editor

SELECT '=== CORREÇÃO DE POLÍTICAS RLS ===' as info;

-- 1. Verificar estado atual das políticas
SELECT 
  'Políticas RLS atuais:' as info,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON user_settings;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON user_settings;

-- 3. Garantir que RLS está habilitado
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS corretas
-- Política para SELECT (visualizar)
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para INSERT (inserir)
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE (atualizar)
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para DELETE (deletar)
CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Verificar se as políticas foram criadas
SELECT 
  'Políticas RLS após correção:' as info,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 6. Listar todas as políticas criadas
SELECT 
  'Detalhes das políticas:' as info,
  policyname as policy_name,
  cmd as operation,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'user_settings'
ORDER BY policyname;

-- 7. Testar se as políticas funcionam
SELECT 
  'Teste das políticas:' as info,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_settings') >= 4 
    THEN '✅ POLÍTICAS CRIADAS COM SUCESSO'
    ELSE '❌ FALHA NA CRIAÇÃO DAS POLÍTICAS'
  END as status;

-- 8. Verificação final
SELECT 
  'VERIFICAÇÃO FINAL:' as info,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_settings) 
    AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'user_settings') >= 4
    AND (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name = 'create_default_user_settings') = 1
    THEN '✅ CORREÇÃO COMPLETA - TODAS AS CONDIÇÕES ATENDIDAS'
    ELSE '❌ CORREÇÃO INCOMPLETA - Verificar problemas acima'
  END as final_status; 
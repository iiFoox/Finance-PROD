-- Script para corrigir configurações de usuário específico
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o usuário existe
SELECT 
  'Verificando usuário:' as info,
  id,
  email,
  created_at
FROM auth.users 
WHERE id = '57c18305-0a3a-4839-b0d5-51554148c4fb';

-- 2. Verificar se o usuário tem configurações
SELECT 
  'Configurações existentes:' as info,
  COUNT(*) as total_settings
FROM user_settings 
WHERE user_id = '57c18305-0a3a-4839-b0d5-51554148c4fb';

-- 3. Criar configurações para o usuário específico (se não existir)
INSERT INTO user_settings (
  user_id,
  profile,
  notifications,
  preferences,
  financial,
  analytics
) VALUES (
  '57c18305-0a3a-4839-b0d5-51554148c4fb',
  '{"avatar_url": "", "name": ""}'::jsonb,
  '{
    "dueBills": true,
    "lowBalance": true,
    "budgetAlerts": true,
    "monthlyReport": true,
    "transactionReminders": true,
    "goalAchievements": true,
    "weeklyDigest": false,
    "investmentUpdates": true
  }'::jsonb,
  '{
    "defaultBank": "",
    "defaultView": "month",
    "currency": "BRL",
    "dateFormat": "dd/MM/yyyy"
  }'::jsonb,
  '{
    "primaryCurrency": "BRL",
    "secondaryCurrency": "USD",
    "roundingMethod": "normal",
    "dailySpendingLimit": "200",
    "weeklySpendingLimit": "1000",
    "monthlySpendingLimit": "5000",
    "enableSpendingLimits": false
  }'::jsonb,
  '{
    "backupFrequency": "weekly",
    "defaultChartType": "line",
    "analysisPeriodia": "6months",
    "smartAlerts": true,
    "predictiveInsights": true,
    "categoryTracking": true,
    "goalTracking": true
  }'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Verificar se foi criado com sucesso
SELECT 
  'Configurações após correção:' as info,
  COUNT(*) as total_settings
FROM user_settings 
WHERE user_id = '57c18305-0a3a-4839-b0d5-51554148c4fb';

-- 5. Verificar políticas RLS
SELECT 
  'Políticas RLS para user_settings:' as info,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_settings';

-- 6. Testar acesso com função RPC
SELECT create_default_user_settings('57c18305-0a3a-4839-b0d5-51554148c4fb') as result; 
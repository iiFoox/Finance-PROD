-- Script rápido para corrigir o problema do usuário
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para corrigir o problema
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;

-- 2. Criar configurações para o usuário específico
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
ON CONFLICT (user_id) DO UPDATE SET
  profile = EXCLUDED.profile,
  notifications = EXCLUDED.notifications,
  preferences = EXCLUDED.preferences,
  financial = EXCLUDED.financial,
  analytics = EXCLUDED.analytics,
  updated_at = NOW();

-- 3. Reabilitar RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se foi criado
SELECT 
  'Configurações criadas/atualizadas para o usuário:' as info,
  COUNT(*) as total_settings
FROM user_settings 
WHERE user_id = '57c18305-0a3a-4839-b0d5-51554148c4fb';

-- 5. Verificar todas as configurações
SELECT 
  'Total de configurações no sistema:' as info,
  COUNT(*) as total_settings
FROM user_settings; 
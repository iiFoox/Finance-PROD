-- Migração para corrigir políticas RLS da tabela user_settings
-- Data: 2025-07-06

-- 1. Verificar se a tabela user_settings existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
    -- Criar tabela user_settings se não existir
    CREATE TABLE user_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
      profile JSONB DEFAULT '{"avatar_url": "", "name": ""}'::jsonb,
      notifications JSONB DEFAULT '{
        "dueBills": true,
        "lowBalance": true,
        "budgetAlerts": true,
        "monthlyReport": true,
        "transactionReminders": true,
        "goalAchievements": true,
        "weeklyDigest": false,
        "investmentUpdates": true
      }'::jsonb,
      preferences JSONB DEFAULT '{
        "defaultBank": "",
        "defaultView": "month",
        "currency": "BRL",
        "dateFormat": "dd/MM/yyyy"
      }'::jsonb,
      financial JSONB DEFAULT '{
        "primaryCurrency": "BRL",
        "secondaryCurrency": "USD",
        "roundingMethod": "normal",
        "dailySpendingLimit": "200",
        "weeklySpendingLimit": "1000",
        "monthlySpendingLimit": "5000",
        "enableSpendingLimits": false
      }'::jsonb,
      analytics JSONB DEFAULT '{
        "backupFrequency": "weekly",
        "defaultChartType": "line",
        "analysisPeriodia": "6months",
        "smartAlerts": true,
        "predictiveInsights": true,
        "categoryTracking": true,
        "goalTracking": true
      }'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- 2. Habilitar RLS na tabela user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;

-- 4. Criar novas políticas de segurança
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_settings_updated_at_trigger ON user_settings;
CREATE TRIGGER update_user_settings_updated_at_trigger
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- 6. Criar função para inserir configurações padrão quando usuário é criado
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar trigger para criar configurações padrão
DROP TRIGGER IF EXISTS create_user_settings_trigger ON auth.users;
CREATE TRIGGER create_user_settings_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_updated_at ON user_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_settings_profile ON user_settings USING GIN (profile);

-- 9. Comentários para documentação
COMMENT ON TABLE user_settings IS 'Configurações personalizadas dos usuários';
COMMENT ON COLUMN user_settings.profile IS 'Configurações do perfil do usuário (avatar_url, name)';
COMMENT ON COLUMN user_settings.notifications IS 'Configurações de notificações em formato JSON';
COMMENT ON COLUMN user_settings.preferences IS 'Preferências gerais em formato JSON';
COMMENT ON COLUMN user_settings.financial IS 'Configurações financeiras em formato JSON';
COMMENT ON COLUMN user_settings.analytics IS 'Configurações de relatórios e análises em formato JSON';

-- 10. Verificar e corrigir registros existentes
-- Se existem usuários sem configurações, criar configurações padrão
INSERT INTO user_settings (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_settings)
ON CONFLICT (user_id) DO NOTHING;

-- 11. Criar função RPC para criar configurações padrão
CREATE OR REPLACE FUNCTION create_default_user_settings(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_settings JSONB;
BEGIN
  -- Inserir configurações padrão
  INSERT INTO user_settings (
    user_id,
    profile,
    notifications,
    preferences,
    financial,
    analytics
  ) VALUES (
    user_uuid,
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
  ON CONFLICT (user_id) DO NOTHING
  RETURNING to_jsonb(user_settings.*) INTO new_settings;
  
  RETURN new_settings;
END;
$$; 
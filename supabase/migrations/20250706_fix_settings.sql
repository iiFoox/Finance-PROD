-- Migração para corrigir problemas da página de configurações
-- Data: 2025-07-06

-- 1. Criar tabela para configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  notifications JSONB DEFAULT '{
    "dueBills": true,
    "lowBalance": true,
    "budgetAlerts": true,
    "monthlyReport": true,
    "transactionReminders": true,
    "goalAchievements": true,
    "weeklyDigest": false,
    "investmentUpdates": true
  }',
  preferences JSONB DEFAULT '{
    "defaultBank": "",
    "defaultView": "month",
    "currency": "BRL",
    "dateFormat": "dd/MM/yyyy"
  }',
  financial JSONB DEFAULT '{
    "primaryCurrency": "BRL",
    "secondaryCurrency": "USD",
    "roundingMethod": "normal",
    "dailySpendingLimit": "200",
    "weeklySpendingLimit": "1000",
    "monthlySpendingLimit": "5000",
    "enableSpendingLimits": false
  }',
  analytics JSONB DEFAULT '{
    "backupFrequency": "weekly",
    "defaultChartType": "line",
    "analysisPeriodia": "6months",
    "smartAlerts": true,
    "predictiveInsights": true,
    "categoryTracking": true,
    "goalTracking": true
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at_trigger
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- 3. Criar função para inserir configurações padrão quando usuário é criado
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para criar configurações padrão
CREATE TRIGGER create_user_settings_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- 5. Habilitar RLS na tabela user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_updated_at ON user_settings(updated_at);

-- 8. Comentários para documentação
COMMENT ON TABLE user_settings IS 'Configurações personalizadas dos usuários';
COMMENT ON COLUMN user_settings.notifications IS 'Configurações de notificações em formato JSON';
COMMENT ON COLUMN user_settings.preferences IS 'Preferências gerais em formato JSON';
COMMENT ON COLUMN user_settings.financial IS 'Configurações financeiras em formato JSON';
COMMENT ON COLUMN user_settings.analytics IS 'Configurações de relatórios e análises em formato JSON'; 
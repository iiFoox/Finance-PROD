-- Adicionar coluna profile à tabela user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{"avatar_url": "", "name": ""}'::jsonb;

-- Atualizar registros existentes com valores padrão para profile
UPDATE user_settings 
SET profile = '{"avatar_url": "", "name": ""}'::jsonb 
WHERE profile IS NULL;

-- Adicionar índice para melhorar performance de consultas por profile
CREATE INDEX IF NOT EXISTS idx_user_settings_profile ON user_settings USING GIN (profile);

-- Comentário na coluna
COMMENT ON COLUMN user_settings.profile IS 'Configurações do perfil do usuário (avatar_url, name)'; 
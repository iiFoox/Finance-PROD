-- Migração para corrigir o campo date da tabela transactions
-- Alterar de 'date' para 'timestamptz' para suportar data e hora

-- Primeiro, vamos criar uma coluna temporária
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS date_temp timestamptz;

-- Converter os dados existentes (adicionar 21:00 como horário padrão para transações existentes)
UPDATE transactions 
SET date_temp = date::date + INTERVAL '21 hours'
WHERE date_temp IS NULL;

-- Remover a coluna antiga
ALTER TABLE transactions DROP COLUMN date;

-- Renomear a nova coluna
ALTER TABLE transactions RENAME COLUMN date_temp TO date;

-- Adicionar NOT NULL constraint
ALTER TABLE transactions ALTER COLUMN date SET NOT NULL;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC); 
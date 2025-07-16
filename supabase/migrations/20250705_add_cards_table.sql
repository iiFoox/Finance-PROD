-- Migração para adicionar tabela de cartões
-- Cada banco pode ter múltiplos cartões com os 4 últimos dígitos

-- Criar tabela de cartões
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id uuid NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_four_digits text NOT NULL CHECK (length(last_four_digits) = 4),
  card_type text NOT NULL DEFAULT 'credit' CHECK (card_type IN ('credit', 'debit')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Garantir que não há cartões duplicados para o mesmo banco
  UNIQUE(bank_id, last_four_digits)
);

-- Habilitar RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cards
CREATE POLICY "Cards select policy"
  ON cards
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Cards insert policy"
  ON cards
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cards update policy"
  ON cards
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Cards delete policy"
  ON cards
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Adicionar coluna card_id na tabela transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS card_id uuid REFERENCES cards(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cards_bank_id ON cards(bank_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_id ON transactions(card_id); 
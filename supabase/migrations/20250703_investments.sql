/*
  # Investment Tables Migration

  This migration creates all the necessary tables for investment management:

  1. New Tables
    - `investments` - Store investment records (stocks, crypto, etc.)
    - `investment_transactions` - Track buy/sell transactions
    - `crypto_prices` - Cache crypto prices from CoinGecko
    - `portfolio_snapshots` - Historical portfolio value snapshots

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for authenticated users
*/

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL, -- BTC, ETH, AAPL, etc.
  name text NOT NULL, -- Bitcoin, Ethereum, Apple Inc., etc.
  type text NOT NULL DEFAULT 'crypto', -- crypto, stock, fund, etc.
  quantity numeric(20,8) DEFAULT 0,
  average_price numeric(12,2) DEFAULT 0,
  total_invested numeric(12,2) DEFAULT 0,
  current_price numeric(12,2) DEFAULT 0,
  current_value numeric(12,2) DEFAULT 0,
  profit_loss numeric(12,2) DEFAULT 0,
  profit_loss_percentage numeric(5,2) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT investments_type_check CHECK (type IN ('crypto', 'stock', 'fund', 'bond', 'commodity'))
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investments select policy"
  ON investments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Investments insert policy"
  ON investments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Investments update policy"
  ON investments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Investments delete policy"
  ON investments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create investment_transactions table
CREATE TABLE IF NOT EXISTS investment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  investment_id uuid NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  transaction_type text NOT NULL, -- buy, sell
  quantity numeric(20,8) NOT NULL,
  price numeric(12,2) NOT NULL,
  total_amount numeric(12,2) NOT NULL,
  fees numeric(12,2) DEFAULT 0,
  notes text,
  transaction_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT investment_transactions_type_check CHECK (transaction_type IN ('buy', 'sell'))
);

ALTER TABLE investment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investment transactions select policy"
  ON investment_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Investment transactions insert policy"
  ON investment_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Investment transactions update policy"
  ON investment_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Investment transactions delete policy"
  ON investment_transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create crypto_prices table for caching CoinGecko data
CREATE TABLE IF NOT EXISTS crypto_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  current_price numeric(12,2) NOT NULL,
  market_cap numeric(15,2),
  price_change_24h numeric(12,2),
  price_change_percentage_24h numeric(5,2),
  volume_24h numeric(15,2),
  circulating_supply numeric(20,2),
  total_supply numeric(20,2),
  max_supply numeric(20,2),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(symbol)
);

-- No RLS needed for crypto_prices as it's public data
-- But we'll add an index for performance
CREATE INDEX IF NOT EXISTS idx_crypto_prices_symbol ON crypto_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_last_updated ON crypto_prices(last_updated);

-- Create portfolio_snapshots table for historical tracking
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_value numeric(12,2) NOT NULL,
  total_invested numeric(12,2) NOT NULL,
  profit_loss numeric(12,2) NOT NULL,
  profit_loss_percentage numeric(5,2) NOT NULL,
  snapshot_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snapshot_date)
);

ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Portfolio snapshots select policy"
  ON portfolio_snapshots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Portfolio snapshots insert policy"
  ON portfolio_snapshots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Portfolio snapshots update policy"
  ON portfolio_snapshots
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Portfolio snapshots delete policy"
  ON portfolio_snapshots
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_symbol ON investments(symbol);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_user_id ON investment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_investment_id ON investment_transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_snapshots(snapshot_date);

-- Add foreign key constraint for investment_transactions
ALTER TABLE investment_transactions 
ADD CONSTRAINT fk_investment_transactions_investment 
FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE;

-- Create function to update investment totals
CREATE OR REPLACE FUNCTION update_investment_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the investment totals when a transaction is added/updated/deleted
  UPDATE investments 
  SET 
    quantity = COALESCE((
      SELECT SUM(
        CASE 
          WHEN transaction_type = 'buy' THEN quantity 
          WHEN transaction_type = 'sell' THEN -quantity 
        END
      )
      FROM investment_transactions 
      WHERE investment_id = COALESCE(NEW.investment_id, OLD.investment_id)
    ), 0),
    total_invested = COALESCE((
      SELECT SUM(
        CASE 
          WHEN transaction_type = 'buy' THEN total_amount + fees
          WHEN transaction_type = 'sell' THEN -(total_amount - fees)
        END
      )
      FROM investment_transactions 
      WHERE investment_id = COALESCE(NEW.investment_id, OLD.investment_id)
    ), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.investment_id, OLD.investment_id);

  -- Calculate average price
  UPDATE investments 
  SET average_price = CASE 
    WHEN quantity > 0 THEN total_invested / quantity 
    ELSE 0 
  END
  WHERE id = COALESCE(NEW.investment_id, OLD.investment_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic calculation
CREATE TRIGGER trigger_update_investment_totals
  AFTER INSERT OR UPDATE OR DELETE ON investment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_investment_totals();

-- Insert some sample crypto data
INSERT INTO crypto_prices (symbol, name, current_price, price_change_percentage_24h) 
VALUES 
  ('BTC', 'Bitcoin', 45000.00, 2.5),
  ('ETH', 'Ethereum', 3000.00, 1.8),
  ('AVAX', 'Avalanche', 35.00, 0.8),
  ('SOL', 'Solana', 100.00, 3.2),
  ('ADA', 'Cardano', 0.50, -1.2)
ON CONFLICT (symbol) DO NOTHING; 
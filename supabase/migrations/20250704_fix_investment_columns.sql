-- Alter column names in the investments table for alignment with frontend code

-- First, drop the dependent trigger and function to allow column rename
DROP TRIGGER IF EXISTS trigger_update_investment_totals ON investment_transactions;
DROP FUNCTION IF EXISTS update_investment_totals();

-- Rename the columns in the investments table
ALTER TABLE public.investments RENAME COLUMN total_invested TO amount;
ALTER TABLE public.investments RENAME COLUMN average_price TO buy_price;
ALTER TABLE public.investments RENAME COLUMN symbol TO crypto_id;

-- Recreate the function with the correct column names
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
    amount = COALESCE((
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
  SET buy_price = CASE 
    WHEN quantity > 0 THEN amount / quantity 
    ELSE 0 
  END
  WHERE id = COALESCE(NEW.investment_id, OLD.investment_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_update_investment_totals
  AFTER INSERT OR UPDATE OR DELETE ON investment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_investment_totals(); 
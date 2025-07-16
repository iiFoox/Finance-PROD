-- Add recurring transaction columns to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'is_recurring'
  ) THEN
    ALTER TABLE transactions ADD COLUMN is_recurring boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'recurring_details'
  ) THEN
    ALTER TABLE transactions ADD COLUMN recurring_details jsonb;
  END IF;
END $$; 
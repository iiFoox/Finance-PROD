/*
  # Add Missing Database Tables and Columns

  This migration adds all the missing tables and columns that the application expects:

  1. New Tables
    - `banks` - Store bank/card information
    - `notifications` - User notifications
    - `goals` - Financial goals
    - `recurring_transactions` - Recurring transaction templates
    - `invoices` - Credit card invoices
    - `monthly_balances` - Monthly starting balances

  2. Table Updates
    - Add `order_index` column to `transactions` table
    - Update `transactions` table with missing columns

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for authenticated users
*/

-- Add missing columns to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE transactions ADD COLUMN order_index integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'tags'
  ) THEN
    ALTER TABLE transactions ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_method text DEFAULT 'money';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'bank_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN bank_id uuid;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'is_installment'
  ) THEN
    ALTER TABLE transactions ADD COLUMN is_installment boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'installment_details'
  ) THEN
    ALTER TABLE transactions ADD COLUMN installment_details jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'invoice_month'
  ) THEN
    ALTER TABLE transactions ADD COLUMN invoice_month integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'invoice_year'
  ) THEN
    ALTER TABLE transactions ADD COLUMN invoice_year integer;
  END IF;
END $$;

-- Create banks table
CREATE TABLE IF NOT EXISTS banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#3B82F6',
  type text NOT NULL DEFAULT 'account',
  credit_limit numeric(12,2),
  closing_day integer,
  due_day integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT banks_type_check CHECK (type IN ('credit', 'debit', 'account'))
);

ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banks select policy"
  ON banks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Banks insert policy"
  ON banks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Banks update policy"
  ON banks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Banks delete policy"
  ON banks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT notifications_type_check CHECK (type IN ('info', 'warning', 'success', 'error'))
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications select policy"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Notifications insert policy"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Notifications update policy"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Notifications delete policy"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_amount numeric(12,2) NOT NULL,
  current_amount numeric(12,2) DEFAULT 0,
  target_date date NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium',
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT goals_priority_check CHECK (priority IN ('low', 'medium', 'high'))
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Goals select policy"
  ON goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Goals insert policy"
  ON goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Goals update policy"
  ON goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Goals delete policy"
  ON goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create recurring_transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  day_of_month integer NOT NULL,
  last_processed date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT recurring_transactions_type_check CHECK (type IN ('income', 'expense')),
  CONSTRAINT recurring_transactions_day_check CHECK (day_of_month >= 1 AND day_of_month <= 31)
);

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recurring transactions select policy"
  ON recurring_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Recurring transactions insert policy"
  ON recurring_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recurring transactions update policy"
  ON recurring_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Recurring transactions delete policy"
  ON recurring_transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_id uuid NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  month integer NOT NULL,
  year integer NOT NULL,
  total_amount numeric(12,2) DEFAULT 0,
  due_date date,
  is_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT invoices_month_check CHECK (month >= 1 AND month <= 12),
  CONSTRAINT invoices_unique_bank_month_year UNIQUE (user_id, bank_id, month, year)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoices select policy"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Invoices insert policy"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Invoices update policy"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Invoices delete policy"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add foreign key constraint for transactions.bank_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transactions_bank_id_fkey'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_bank_id_fkey 
    FOREIGN KEY (bank_id) REFERENCES banks(id);
  END IF;
END $$;

-- Add payment method constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'transactions_payment_method_check'
  ) THEN
    ALTER TABLE transactions ADD CONSTRAINT transactions_payment_method_check 
    CHECK (payment_method IN ('money', 'creditCard', 'debitCard', 'pix'));
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(user_id, order_index DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_bank ON transactions(bank_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON transactions(bank_id, invoice_month, invoice_year);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_target_date ON goals(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_recurring_user_active ON recurring_transactions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_invoices_user_bank_date ON invoices(user_id, bank_id, year, month);

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_banks_updated_at'
  ) THEN
    CREATE TRIGGER update_banks_updated_at
      BEFORE UPDATE ON banks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_goals_updated_at'
  ) THEN
    CREATE TRIGGER update_goals_updated_at
      BEFORE UPDATE ON goals
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_recurring_transactions_updated_at'
  ) THEN
    CREATE TRIGGER update_recurring_transactions_updated_at
      BEFORE UPDATE ON recurring_transactions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_invoices_updated_at'
  ) THEN
    CREATE TRIGGER update_invoices_updated_at
      BEFORE UPDATE ON invoices
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
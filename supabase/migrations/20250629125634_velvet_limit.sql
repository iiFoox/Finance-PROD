/*
  # Configuração completa do banco de dados para aplicação financeira

  1. Novas Tabelas
    - `profiles` - Perfis dos usuários
    - `categories` - Categorias de transações
    - `transactions` - Transações financeiras
    - `budgets` - Orçamentos mensais
    - `monthly_balances` - Saldos mensais
    - `financial_goals` - Metas financeiras
    - `chat_conversations` - Conversas do chat
    - `chat_messages` - Mensagens do chat

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para acesso apenas aos próprios dados
    - Triggers automáticos para perfis e categorias

  3. Funcionalidades
    - Criação automática de perfil e categorias padrão
    - Triggers para updated_at
    - Índices para performance
*/

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis dos usuários
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  icon text,
  color text DEFAULT '#3B82F6',
  type text CHECK (type IN ('receita', 'despesa')) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  type text CHECK (type IN ('receita', 'despesa')) NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  target_amount decimal(12,2) NOT NULL CHECK (target_amount > 0),
  month text NOT NULL, -- formato YYYY-MM
  alert_threshold integer DEFAULT 80 CHECK (alert_threshold >= 1 AND alert_threshold <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, month)
);

-- Tabela de saldos mensais
CREATE TABLE IF NOT EXISTS monthly_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  initial_balance decimal(12,2) DEFAULT 0,
  final_balance decimal(12,2) DEFAULT 0,
  total_income decimal(12,2) DEFAULT 0,
  total_expenses decimal(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Tabela de metas financeiras
CREATE TABLE IF NOT EXISTS financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target_amount decimal(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount decimal(12,2) DEFAULT 0 CHECK (current_amount >= 0),
  target_date date,
  status text DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'cancelado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de conversas do chat
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text DEFAULT 'Nova Conversa',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('user', 'assistant')) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can create their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

DROP POLICY IF EXISTS "Users can view their own monthly balances" ON monthly_balances;
DROP POLICY IF EXISTS "Users can create their own monthly balances" ON monthly_balances;
DROP POLICY IF EXISTS "Users can update their own monthly balances" ON monthly_balances;
DROP POLICY IF EXISTS "Users can delete their own monthly balances" ON monthly_balances;

DROP POLICY IF EXISTS "Users can view their own financial goals" ON financial_goals;
DROP POLICY IF EXISTS "Users can create their own financial goals" ON financial_goals;
DROP POLICY IF EXISTS "Users can update their own financial goals" ON financial_goals;
DROP POLICY IF EXISTS "Users can delete their own financial goals" ON financial_goals;

DROP POLICY IF EXISTS "Users can view their own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON chat_conversations;

DROP POLICY IF EXISTS "Users can view messages from their conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON chat_messages;

-- Políticas RLS para profiles
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para categories
CREATE POLICY "categories_select_policy"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_policy"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_policy"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "categories_delete_policy"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "transactions_select_policy"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_policy"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_policy"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_delete_policy"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para budgets
CREATE POLICY "budgets_select_policy"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "budgets_insert_policy"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "budgets_update_policy"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "budgets_delete_policy"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para monthly_balances
CREATE POLICY "monthly_balances_select_policy"
  ON monthly_balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "monthly_balances_insert_policy"
  ON monthly_balances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "monthly_balances_update_policy"
  ON monthly_balances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "monthly_balances_delete_policy"
  ON monthly_balances FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para financial_goals
CREATE POLICY "financial_goals_select_policy"
  ON financial_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "financial_goals_insert_policy"
  ON financial_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "financial_goals_update_policy"
  ON financial_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "financial_goals_delete_policy"
  ON financial_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para chat_conversations
CREATE POLICY "chat_conversations_select_policy"
  ON chat_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "chat_conversations_insert_policy"
  ON chat_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_conversations_update_policy"
  ON chat_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "chat_conversations_delete_policy"
  ON chat_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para chat_messages
CREATE POLICY "chat_messages_select_policy"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (conversation_id IN (
    SELECT id FROM chat_conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "chat_messages_insert_policy"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (conversation_id IN (
    SELECT id FROM chat_conversations WHERE user_id = auth.uid()
  ));

-- Triggers para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover triggers existentes se existirem
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
DROP TRIGGER IF EXISTS update_monthly_balances_updated_at ON monthly_balances;
DROP TRIGGER IF EXISTS update_financial_goals_updated_at ON financial_goals;
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;

-- Criar triggers
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at 
  BEFORE UPDATE ON budgets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_balances_updated_at 
  BEFORE UPDATE ON monthly_balances 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at 
  BEFORE UPDATE ON financial_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_conversations_updated_at 
  BEFORE UPDATE ON chat_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_target_date ON financial_goals(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuário'), 
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir categorias padrão para novos usuários
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS trigger AS $$
BEGIN
  -- Categorias de despesa
  INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (NEW.id, 'Alimentação', 'despesa', '#EF4444', 'utensils'),
    (NEW.id, 'Transporte', 'despesa', '#F97316', 'car'),
    (NEW.id, 'Moradia', 'despesa', '#8B5CF6', 'home'),
    (NEW.id, 'Lazer', 'despesa', '#EC4899', 'gamepad-2'),
    (NEW.id, 'Saúde', 'despesa', '#10B981', 'heart'),
    (NEW.id, 'Educação', 'despesa', '#3B82F6', 'book'),
    (NEW.id, 'Outros', 'despesa', '#6B7280', 'more-horizontal');
  
  -- Categorias de receita
  INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (NEW.id, 'Salário', 'receita', '#10B981', 'dollar-sign'),
    (NEW.id, 'Freelance', 'receita', '#3B82F6', 'briefcase'),
    (NEW.id, 'Investimentos', 'receita', '#8B5CF6', 'trending-up'),
    (NEW.id, 'Outros', 'receita', '#6B7280', 'more-horizontal');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar categorias padrão
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();
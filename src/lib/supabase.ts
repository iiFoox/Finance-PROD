import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      banks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          type: 'credit' | 'debit' | 'account';
          credit_limit: number | null;
          closing_day: number | null;
          due_day: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          type?: 'credit' | 'debit' | 'account';
          credit_limit?: number | null;
          closing_day?: number | null;
          due_day?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          type?: 'credit' | 'debit' | 'account';
          credit_limit?: number | null;
          closing_day?: number | null;
          due_day?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          category: string;
          description: string;
          date: string;
          tags: string[];
          payment_method: 'money' | 'creditCard' | 'debitCard' | 'pix';
          bank_id: string | null;
          is_installment: boolean;
          installment_details: any | null;
          order_index: number;
          invoice_month: number | null;
          invoice_year: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'income' | 'expense';
          amount: number;
          category: string;
          description: string;
          date: string;
          tags?: string[];
          payment_method?: 'money' | 'creditCard' | 'debitCard' | 'pix';
          bank_id?: string | null;
          is_installment?: boolean;
          installment_details?: any | null;
          order_index?: number;
          invoice_month?: number | null;
          invoice_year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'income' | 'expense';
          amount?: number;
          category?: string;
          description?: string;
          date?: string;
          tags?: string[];
          payment_method?: 'money' | 'creditCard' | 'debitCard' | 'pix';
          bank_id?: string | null;
          is_installment?: boolean;
          installment_details?: any | null;
          order_index?: number;
          invoice_month?: number | null;
          invoice_year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          target_amount: number;
          month: string;
          alert_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          target_amount: number;
          month: string;
          alert_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          target_amount?: number;
          month?: string;
          alert_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_amount: number;
          current_amount: number;
          target_date: string;
          category: string;
          priority: 'low' | 'medium' | 'high';
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_amount: number;
          current_amount?: number;
          target_date: string;
          category: string;
          priority?: 'low' | 'medium' | 'high';
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_amount?: number;
          current_amount?: number;
          target_date?: string;
          category?: string;
          priority?: 'low' | 'medium' | 'high';
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      recurring_transactions: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          category: string;
          type: 'income' | 'expense';
          day_of_month: number;
          last_processed: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          category: string;
          type: 'income' | 'expense';
          day_of_month: number;
          last_processed?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          category?: string;
          type?: 'income' | 'expense';
          day_of_month?: number;
          last_processed?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      monthly_balances: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          starting_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          starting_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          starting_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'warning' | 'success' | 'error';
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'warning' | 'success' | 'error';
          read?: boolean;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          bank_id: string;
          month: number;
          year: number;
          total_amount: number;
          due_date: string | null;
          is_paid: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bank_id: string;
          month: number;
          year: number;
          total_amount?: number;
          due_date?: string | null;
          is_paid?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bank_id?: string;
          month?: number;
          year?: number;
          total_amount?: number;
          due_date?: string | null;
          is_paid?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
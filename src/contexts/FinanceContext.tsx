import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Budget, Bank, RecurringTransaction, MonthlyBalance, Notification, Goal, Invoice } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  // Data
  transactions: Transaction[];
  budgets: Budget[];
  banks: Bank[];
  recurringTransactions: RecurringTransaction[];
  monthlyBalances: MonthlyBalance[];
  notifications: Notification[];
  goals: Goal[];
  invoices: Invoice[];
  
  // Loading states
  isLoading: boolean;
  
  // Current selection
  selectedYear: number;
  selectedMonth: number;
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  reorderTransactions: (transactions: Transaction[]) => Promise<void>;
  
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  addBank: (bank: Omit<Bank, 'id'>) => Promise<void>;
  updateBank: (id: string, bank: Partial<Bank>) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;
  
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id'>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  
  setMonthlyBalance: (month: string, balance: number) => Promise<void>;
  
  addNotification: (notification: Omit<Notification, 'id'>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  
  setSelectedDate: (year: number, month: number) => void;
  
  // Computed values
  getCurrentMonthTransactions: () => Transaction[];
  getCurrentMonthBudgets: () => Budget[];
  getCurrentMonthBalance: () => number;
  getUnreadNotificationsCount: () => number;
  getBankInvoice: (bankId: string, month: number, year: number) => Invoice;
  getGoalProgress: (goalId: string) => number;
  
  // Data loading
  loadUserData: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [monthlyBalances, setMonthlyBalances] = useState<MonthlyBalance[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitializedBanks, setHasInitializedBanks] = useState(false);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Generate a safe order index that fits in integer range
  const generateOrderIndex = () => {
    return Math.floor(Date.now() / 1000); // Convert to seconds to fit in integer range
  };

  // Função para remover bancos duplicados
  const removeDuplicateBanks = async () => {
    if (!user) return;

    try {
      const { data: allBanks, error } = await supabase
        .from('banks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar bancos:', error);
        return;
      }

      if (!allBanks || allBanks.length <= 3) return; // Se tem 3 ou menos, não há duplicatas

      // Agrupar por nome e tipo
      const bankGroups: Record<string, any[]> = {};
      allBanks.forEach(bank => {
        const key = `${bank.name}-${bank.type}`;
        if (!bankGroups[key]) {
          bankGroups[key] = [];
        }
        bankGroups[key].push(bank);
      });

      // Remover duplicatas (manter apenas o primeiro de cada grupo)
      const banksToDelete: string[] = [];
      Object.values(bankGroups).forEach(group => {
        if (group.length > 1) {
          // Manter o primeiro, remover os outros
          for (let i = 1; i < group.length; i++) {
            banksToDelete.push(group[i].id);
          }
        }
      });

      if (banksToDelete.length > 0) {
        console.log(`Removendo ${banksToDelete.length} bancos duplicados...`);
        
        for (const bankId of banksToDelete) {
          await supabase
            .from('banks')
            .delete()
            .eq('id', bankId)
            .eq('user_id', user.id);
        }

        console.log('Bancos duplicados removidos com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao remover bancos duplicados:', error);
    }
  };

  // Carregar todos os dados do usuário
  const loadUserData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Primeiro, remover bancos duplicados
      await removeDuplicateBanks();

      // Carregar transações com join para categorias
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('order_index', { ascending: false });

      if (transactionsError) {
        console.error('Erro ao carregar transações:', transactionsError);
      } else {
        // Converter dados do Supabase para o formato da aplicação
        const formattedTransactions: Transaction[] = (transactionsData || []).map(t => ({
          id: t.id,
          type: t.type === 'receita' ? 'income' : 'expense',
          amount: parseFloat(t.amount) || 0,
          category: t.categories?.name || 'Sem categoria',
          description: t.description || '',
          date: new Date(t.date),
          tags: t.tags || [],
          paymentMethod: t.payment_method as 'money' | 'creditCard' | 'debitCard' | 'pix',
          bankId: t.bank_id,
          isInstallment: t.is_installment || false,
          installmentDetails: t.installment_details,
          order: t.order_index || 0,
          invoiceMonth: t.invoice_month,
          invoiceYear: t.invoice_year,
        }));

        setTransactions(formattedTransactions);
      }

      // Carregar bancos
      const { data: banksData, error: banksError } = await supabase
        .from('banks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (banksError) {
        console.error('Erro ao carregar bancos:', banksError);
      } else {
        const formattedBanks: Bank[] = (banksData || []).map(b => ({
          id: b.id,
          name: b.name,
          color: b.color,
          type: b.type as 'credit' | 'debit' | 'account',
          creditLimit: b.credit_limit ? parseFloat(b.credit_limit) : undefined,
          closingDay: b.closing_day,
          dueDay: b.due_day,
        }));

        setBanks(formattedBanks);
        setHasInitializedBanks(true);
      }

      // Carregar orçamentos
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (budgetsError) {
        console.error('Erro ao carregar orçamentos:', budgetsError);
      } else {
        const formattedBudgets: Budget[] = (budgetsData || []).map(b => ({
          id: b.id,
          category: b.category,
          targetAmount: parseFloat(b.target_amount) || 0,
          month: b.month,
          alertThreshold: b.alert_threshold || 80,
        }));

        setBudgets(formattedBudgets);
      }

      // Carregar metas
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) {
        console.error('Erro ao carregar metas:', goalsError);
      } else {
        const formattedGoals: Goal[] = (goalsData || []).map(g => ({
          id: g.id,
          title: g.title,
          description: g.description || '',
          targetAmount: parseFloat(g.target_amount) || 0,
          currentAmount: parseFloat(g.current_amount) || 0,
          targetDate: new Date(g.target_date),
          category: g.category,
          priority: g.priority as 'low' | 'medium' | 'high',
          isCompleted: g.is_completed || false,
          createdAt: new Date(g.created_at),
        }));

        setGoals(formattedGoals);
      }

      // Carregar transações recorrentes
      const { data: recurringData, error: recurringError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', user.id);

      if (recurringError) {
        console.error('Erro ao carregar transações recorrentes:', recurringError);
      } else {
        const formattedRecurring: RecurringTransaction[] = (recurringData || []).map(r => ({
          id: r.id,
          description: r.description,
          amount: parseFloat(r.amount) || 0,
          category: r.category,
          type: r.type as 'income' | 'expense',
          dayOfMonth: r.day_of_month,
          lastProcessed: r.last_processed,
          isActive: r.is_active !== false,
        }));

        setRecurringTransactions(formattedRecurring);
      }

      // Carregar saldos mensais
      const { data: balancesData, error: balancesError } = await supabase
        .from('monthly_balances')
        .select('*')
        .eq('user_id', user.id);

      if (balancesError) {
        console.error('Erro ao carregar saldos mensais:', balancesError);
      } else {
        const formattedBalances: MonthlyBalance[] = (balancesData || []).map(b => ({
          month: `${b.year}-${String(b.month).padStart(2, '0')}`,
          startingBalance: parseFloat(b.initial_balance) || 0,
        }));

        setMonthlyBalances(formattedBalances);
      }

      // Carregar notificações
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notificationsError) {
        console.error('Erro ao carregar notificações:', notificationsError);
      } else {
        const formattedNotifications: Notification[] = (notificationsData || []).map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type as 'info' | 'warning' | 'success' | 'error',
          date: new Date(n.created_at),
          read: n.read || false,
        }));

        setNotifications(formattedNotifications);
      }

    } catch (error) {
      console.error('Erro geral ao carregar dados do usuário:', error);
      await addNotification({
        title: 'Erro',
        message: 'Erro ao carregar dados. Tente recarregar a página.',
        type: 'error',
        date: new Date(),
        read: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados quando o usuário mudar
  useEffect(() => {
    loadUserData();
  }, [user]);

  // Remover a criação automática de bancos padrão
  // (Comentado para evitar criação de duplicatas)
  /*
  useEffect(() => {
    const addDefaultBanks = async () => {
      if (user && banks.length === 0 && !isLoading && hasInitializedBanks) {
        const defaultBanks = [
          { 
            name: 'Nubank', 
            color: '#8A05BE', 
            type: 'credit' as const, 
            creditLimit: 5000,
            closingDay: 15,
            dueDay: 10
          },
          { 
            name: 'Itaú', 
            color: '#0056A0', 
            type: 'credit' as const, 
            creditLimit: 3000,
            closingDay: 20,
            dueDay: 15
          },
          { 
            name: 'Conta Corrente', 
            color: '#10B981', 
            type: 'account' as const 
          },
        ];

        for (const bank of defaultBanks) {
          try {
            await addBank(bank);
          } catch (error) {
            console.error('Erro ao adicionar banco padrão:', error);
          }
        }
      }
    };

    addDefaultBanks();
  }, [user, banks.length, isLoading, hasInitializedBanks]);
  */

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      console.log('Adicionando transação:', transaction);
      
      // Primeiro, encontrar ou criar a categoria
      let categoryId = null;
      
      if (transaction.category) {
        // Buscar categoria existente - usar limit(1) em vez de single()
        const { data: existingCategories, error: categorySearchError } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', transaction.category)
          .eq('type', transaction.type === 'income' ? 'receita' : 'despesa')
          .limit(1);

        if (categorySearchError) {
          console.error('Erro ao buscar categoria:', categorySearchError);
          throw categorySearchError;
        }

        if (existingCategories && existingCategories.length > 0) {
          categoryId = existingCategories[0].id;
        } else {
          // Criar nova categoria
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({
              user_id: user.id,
              name: transaction.category,
              type: transaction.type === 'income' ? 'receita' : 'despesa',
              color: '#3B82F6',
            })
            .select('id')
            .single();

          if (categoryError) {
            console.error('Erro ao criar categoria:', categoryError);
            throw categoryError;
          }
          categoryId = newCategory.id;
        }
      }

      const transactionData = {
        user_id: user.id,
        category_id: categoryId,
        title: transaction.category || 'Transação',
        description: transaction.description || '',
        amount: transaction.amount,
        type: transaction.type === 'income' ? 'receita' : 'despesa',
        date: transaction.date.toISOString().split('T')[0],
        tags: transaction.tags || [],
        payment_method: transaction.paymentMethod || 'money',
        bank_id: transaction.bankId,
        is_installment: transaction.isInstallment || false,
        installment_details: transaction.installmentDetails,
        order_index: transaction.order || generateOrderIndex(),
        invoice_month: transaction.invoiceMonth,
        invoice_year: transaction.invoiceYear,
      };

      console.log('Dados para inserir no Supabase:', transactionData);

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select(`
          *,
          categories (
            name
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao inserir transação no Supabase:', error);
        throw error;
      }

      console.log('Transação inserida com sucesso:', data);

      const newTransaction: Transaction = {
        id: data.id,
        type: data.type === 'receita' ? 'income' : 'expense',
        amount: parseFloat(data.amount) || 0,
        category: data.categories?.name || 'Sem categoria',
        description: data.description || '',
        date: new Date(data.date),
        tags: data.tags || [],
        paymentMethod: data.payment_method as 'money' | 'creditCard' | 'debitCard' | 'pix',
        bankId: data.bank_id,
        isInstallment: data.is_installment || false,
        installmentDetails: data.installment_details,
        order: data.order_index || 0,
        invoiceMonth: data.invoice_month,
        invoiceYear: data.invoice_year,
      };

      setTransactions(prev => [newTransaction, ...prev]);

      console.log('Transação adicionada ao estado local');

    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (updates.type) updateData.type = updates.type === 'income' ? 'receita' : 'despesa';
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.date) updateData.date = updates.date.toISOString().split('T')[0];
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.paymentMethod) updateData.payment_method = updates.paymentMethod;
      if (updates.bankId !== undefined) updateData.bank_id = updates.bankId;
      if (updates.isInstallment !== undefined) updateData.is_installment = updates.isInstallment;
      if (updates.installmentDetails) updateData.installment_details = updates.installmentDetails;
      if (updates.order !== undefined) updateData.order_index = updates.order;
      if (updates.invoiceMonth !== undefined) updateData.invoice_month = updates.invoiceMonth;
      if (updates.invoiceYear !== undefined) updateData.invoice_year = updates.invoiceYear;

      // Handle category update
      if (updates.category) {
        // Buscar categoria existente - usar limit(1) em vez de single()
        const { data: existingCategories, error: categorySearchError } = await supabase
          .from('categories')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', updates.category)
          .eq('type', updates.type === 'income' ? 'receita' : 'despesa')
          .limit(1);

        if (categorySearchError) throw categorySearchError;

        if (existingCategories && existingCategories.length > 0) {
          updateData.category_id = existingCategories[0].id;
        } else {
          // Criar nova categoria
          const { data: newCategory, error: categoryError } = await supabase
            .from('categories')
            .insert({
              user_id: user.id,
              name: updates.category,
              type: updates.type === 'income' ? 'receita' : 'despesa',
              color: '#3B82F6',
            })
            .select('id')
            .single();

          if (categoryError) throw categoryError;
          updateData.category_id = newCategory.id;
        }
      }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );

    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));

    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      throw error;
    }
  };

  const reorderTransactions = async (reorderedTransactions: Transaction[]) => {
    if (!user) return;

    try {
      const updates = reorderedTransactions.map((t, index) => ({
        id: t.id,
        order_index: reorderedTransactions.length - index
      }));

      for (const update of updates) {
        await supabase
          .from('transactions')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
          .eq('user_id', user.id);
      }

      const updatedTransactions = reorderedTransactions.map((t, index) => ({
        ...t,
        order: reorderedTransactions.length - index
      }));

      setTransactions(updatedTransactions);

    } catch (error) {
      console.error('Erro ao reordenar transações:', error);
      throw error;
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('budgets')
        .upsert({
          user_id: user.id,
          category: budget.category,
          target_amount: budget.targetAmount,
          month: budget.month,
          alert_threshold: budget.alertThreshold || 80,
        })
        .select()
        .single();

      if (error) throw error;

      const newBudget: Budget = {
        id: data.id,
        category: data.category,
        targetAmount: parseFloat(data.target_amount) || 0,
        month: data.month,
        alertThreshold: data.alert_threshold || 80,
      };

      setBudgets(prev => {
        const existing = prev.find(b => b.category === budget.category && b.month === budget.month);
        if (existing) {
          return prev.map(b => b.id === existing.id ? newBudget : b);
        }
        return [...prev, newBudget];
      });

    } catch (error) {
      console.error('Erro ao adicionar orçamento:', error);
      throw error;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (updates.category) updateData.category = updates.category;
      if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
      if (updates.month) updateData.month = updates.month;
      if (updates.alertThreshold !== undefined) updateData.alert_threshold = updates.alertThreshold;

      const { error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgets(prev => 
        prev.map(b => b.id === id ? { ...b, ...updates } : b)
      );

    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  };

  const deleteBudget = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBudgets(prev => prev.filter(b => b.id !== id));

    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      throw error;
    }
  };

  const addBank = async (bank: Omit<Bank, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('banks')
        .insert({
          user_id: user.id,
          name: bank.name,
          color: bank.color,
          type: bank.type,
          credit_limit: bank.creditLimit,
          closing_day: bank.closingDay,
          due_day: bank.dueDay,
        })
        .select()
        .single();

      if (error) throw error;

      const newBank: Bank = {
        id: data.id,
        name: data.name,
        color: data.color,
        type: data.type as 'credit' | 'debit' | 'account',
        creditLimit: data.credit_limit ? parseFloat(data.credit_limit) : undefined,
        closingDay: data.closing_day,
        dueDay: data.due_day,
      };

      setBanks(prev => [...prev, newBank]);

    } catch (error) {
      console.error('Erro ao adicionar banco:', error);
      throw error;
    }
  };

  const updateBank = async (id: string, updates: Partial<Bank>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.color) updateData.color = updates.color;
      if (updates.type) updateData.type = updates.type;
      if (updates.creditLimit !== undefined) updateData.credit_limit = updates.creditLimit;
      if (updates.closingDay !== undefined) updateData.closing_day = updates.closingDay;
      if (updates.dueDay !== undefined) updateData.due_day = updates.dueDay;

      const { error } = await supabase
        .from('banks')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBanks(prev => 
        prev.map(b => b.id === id ? { ...b, ...updates } : b)
      );

    } catch (error) {
      console.error('Erro ao atualizar banco:', error);
      throw error;
    }
  };

  const deleteBank = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('banks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setBanks(prev => prev.filter(b => b.id !== id));
      
      // Remove bank references from transactions
      setTransactions(prev => 
        prev.map(t => t.bankId === id ? { ...t, bankId: undefined } : t)
      );

    } catch (error) {
      console.error('Erro ao deletar banco:', error);
      throw error;
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          description: goal.description,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          target_date: goal.targetDate.toISOString().split('T')[0],
          category: goal.category,
          priority: goal.priority,
          is_completed: goal.isCompleted,
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal: Goal = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        targetAmount: parseFloat(data.target_amount) || 0,
        currentAmount: parseFloat(data.current_amount) || 0,
        targetDate: new Date(data.target_date),
        category: data.category,
        priority: data.priority as 'low' | 'medium' | 'high',
        isCompleted: data.is_completed || false,
        createdAt: new Date(data.created_at),
      };

      setGoals(prev => [...prev, newGoal]);

    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) updateData.current_amount = updates.currentAmount;
      if (updates.targetDate) updateData.target_date = updates.targetDate.toISOString().split('T')[0];
      if (updates.category) updateData.category = updates.category;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;

      const { error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => 
        prev.map(g => g.id === id ? { ...g, ...updates } : g)
      );

    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== id));

    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      throw error;
    }
  };

  const addRecurringTransaction = async (recurring: Omit<RecurringTransaction, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: user.id,
          description: recurring.description,
          amount: recurring.amount,
          category: recurring.category,
          type: recurring.type,
          day_of_month: recurring.dayOfMonth,
          last_processed: recurring.lastProcessed,
          is_active: recurring.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      const newRecurring: RecurringTransaction = {
        id: data.id,
        description: data.description,
        amount: parseFloat(data.amount) || 0,
        category: data.category,
        type: data.type as 'income' | 'expense',
        dayOfMonth: data.day_of_month,
        lastProcessed: data.last_processed,
        isActive: data.is_active !== false,
      };

      setRecurringTransactions(prev => [...prev, newRecurring]);

    } catch (error) {
      console.error('Erro ao adicionar transação recorrente:', error);
      throw error;
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setRecurringTransactions(prev => prev.filter(r => r.id !== id));

    } catch (error) {
      console.error('Erro ao deletar transação recorrente:', error);
      throw error;
    }
  };

  const setMonthlyBalance = async (month: string, balance: number) => {
    if (!user) return;

    try {
      const [year, monthNum] = month.split('-').map(Number);
      
      const { data, error } = await supabase
        .from('monthly_balances')
        .upsert({
          user_id: user.id,
          month: monthNum,
          year: year,
          initial_balance: balance,
        })
        .select()
        .single();

      if (error) throw error;

      setMonthlyBalances(prev => {
        const existing = prev.find(mb => mb.month === month);
        const newBalance: MonthlyBalance = { month, startingBalance: balance };
        
        if (existing) {
          return prev.map(mb => mb.month === month ? newBalance : mb);
        }
        return [...prev, newBalance];
      });

    } catch (error) {
      console.error('Erro ao definir saldo mensal:', error);
      throw error;
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: notification.read,
        })
        .select()
        .single();

      if (error) throw error;

      const newNotification: Notification = {
        id: data.id,
        title: data.title,
        message: data.message,
        type: data.type as 'info' | 'warning' | 'success' | 'error',
        date: new Date(data.created_at),
        read: data.read || false,
      };

      setNotifications(prev => [newNotification, ...prev]);

    } catch (error) {
      console.error('Erro ao adicionar notificação:', error);
      // Não propagar erro para notificações
    }
  };

  const markNotificationAsRead = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );

    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications([]);

    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  };

  const setSelectedDate = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const getCurrentMonthTransactions = () => {
    return transactions.filter(t => 
      t.date.getFullYear() === selectedYear && 
      t.date.getMonth() === selectedMonth
    );
  };

  const getCurrentMonthBudgets = () => {
    const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    return budgets.filter(b => b.month === monthKey);
  };

  const getCurrentMonthBalance = () => {
    const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    const monthlyBalance = monthlyBalances.find(mb => mb.month === monthKey);
    const startingBalance = monthlyBalance?.startingBalance || 0;
    
    const currentTransactions = getCurrentMonthTransactions();
    const income = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return startingBalance + income - expenses;
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length;
  };

  const getBankInvoice = (bankId: string, month: number, year: number): Invoice => {
    const bank = banks.find(b => b.id === bankId);
    const invoiceTransactions = transactions.filter(t => 
      t.bankId === bankId && 
      t.invoiceMonth === month && 
      t.invoiceYear === year
    );
    
    const totalAmount = invoiceTransactions.reduce((sum, t) => sum + t.amount, 0);
    const dueDate = new Date(year, month + 1, bank?.dueDay || 10);
    
    return {
      id: `${bankId}-${year}-${month}`,
      bankId,
      month,
      year,
      totalAmount,
      dueDate,
      isPaid: false,
      transactions: invoiceTransactions,
    };
  };

  const getGoalProgress = (goalId: string): number => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.targetAmount === 0) return 0;
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const value: FinanceContextType = {
    transactions,
    budgets,
    banks,
    recurringTransactions,
    monthlyBalances,
    notifications,
    goals,
    invoices,
    isLoading,
    selectedYear,
    selectedMonth,
    
    addTransaction,
    updateTransaction,
    deleteTransaction,
    reorderTransactions,
    
    addBudget,
    updateBudget,
    deleteBudget,
    
    addBank,
    updateBank,
    deleteBank,
    
    addGoal,
    updateGoal,
    deleteGoal,
    
    addRecurringTransaction,
    deleteRecurringTransaction,
    
    setMonthlyBalance,
    
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    
    setSelectedDate,
    
    getCurrentMonthTransactions,
    getCurrentMonthBudgets,
    getCurrentMonthBalance,
    getUnreadNotificationsCount,
    getBankInvoice,
    getGoalProgress,
    
    loadUserData,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
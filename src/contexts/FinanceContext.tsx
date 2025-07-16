import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Budget, Bank, Card, RecurringTransaction, MonthlyBalance, Notification, Goal, Invoice } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  // Data
  transactions: Transaction[];
  budgets: Budget[];
  banks: Bank[];
  cards: Card[];
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
  clearAllTransactions: () => Promise<void>;
  reorderTransactions: (transactions: Transaction[]) => Promise<void>;
  
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  
  addBank: (bank: Omit<Bank, 'id'>) => Promise<void>;
  updateBank: (id: string, bank: Partial<Bank>) => Promise<void>;
  deleteBank: (id: string) => Promise<void>;
  
  addCard: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCard: (id: string, card: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id'>) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  clearAllRecurringTransactions: () => Promise<void>;
  
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
  
  // New function
  forceUpdateAllCreditCardTransactions: () => Promise<void>;
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
  const [cards, setCards] = useState<Card[]>([]);
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

  const updateExistingTransactions = async () => {
    if (!user) return;

    try {
      // Buscar todas as transações que precisam ser atualizadas
      const { data: transactionsToUpdate, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('payment_method', 'creditCard')
        .is('invoice_month', null);

      if (fetchError) {
        console.error('Erro ao buscar transações para atualizar:', fetchError);
        return;
      }

      if (!transactionsToUpdate || transactionsToUpdate.length === 0) {
        console.log('Nenhuma transação precisa ser atualizada');
        return;
      }

      console.log(`Atualizando ${transactionsToUpdate.length} transações...`);

      // Atualizar cada transação
      for (const transaction of transactionsToUpdate) {
        const date = new Date(transaction.date);
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            invoice_month: date.getMonth(),
            invoice_year: date.getFullYear()
          })
          .eq('id', transaction.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Erro ao atualizar transação:', updateError);
        }
      }

      console.log('Transações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar transações:', error);
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

      // Atualizar transações existentes
      await updateExistingTransactions();

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
          subcategory: t.subcategory || '',
          description: t.description || '',
          date: new Date(t.date),
          tags: t.tags || [],
          paymentMethod: t.payment_method as 'money' | 'creditCard' | 'debitCard' | 'pix',
          bankId: t.bank_id,
          cardId: t.card_id,
          isInstallment: t.is_installment || false,
          installmentDetails: t.installment_details,
          isRecurring: t.is_recurring || false,
          recurringDetails: t.recurring_details,
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

      // Carregar cartões
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (cardsError) {
        console.error('Erro ao carregar cartões:', cardsError);
      } else {
        const formattedCards: Card[] = (cardsData || []).map(c => ({
          id: c.id,
          bankId: c.bank_id,
          lastFourDigits: c.last_four_digits,
          cardType: c.card_type as 'credit' | 'debit',
          isActive: c.is_active,
          createdAt: new Date(c.created_at),
          updatedAt: new Date(c.updated_at),
        }));

        setCards(formattedCards);
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
        date: transaction.date.toISOString(),
        tags: transaction.isRecurring ? [...(transaction.tags || []), 'Recorrente'] : (transaction.tags || []),
        payment_method: transaction.paymentMethod || 'money',
        bank_id: transaction.bankId,
        card_id: transaction.cardId,
        is_installment: transaction.isInstallment || false,
        installment_details: transaction.installmentDetails,
        is_recurring: transaction.isRecurring || false,
        recurring_details: transaction.recurringDetails,
        order_index: transaction.order || generateOrderIndex(),
        invoice_month: transaction.paymentMethod === 'creditCard' ? transaction.date.getMonth() : null,
        invoice_year: transaction.paymentMethod === 'creditCard' ? transaction.date.getFullYear() : null,
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
        subcategory: '',
        description: data.description || '',
        date: new Date(data.date),
        tags: data.tags || [],
        paymentMethod: data.payment_method as 'money' | 'creditCard' | 'debitCard' | 'pix',
        bankId: data.bank_id,
        cardId: data.card_id,
        isInstallment: data.is_installment || false,
        installmentDetails: data.installment_details,
        isRecurring: data.is_recurring || false,
        recurringDetails: data.recurring_details,
        order: data.order_index || 0,
        invoiceMonth: data.invoice_month,
        invoiceYear: data.invoice_year,
      };

      setTransactions(prev => [newTransaction, ...prev]);

      console.log('Transação adicionada ao estado local');

      // Adicionar notificação de sucesso
      await addNotification({
        title: 'Transação Adicionada',
        message: `${transaction.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transaction.amount.toFixed(2)} adicionada com sucesso.`,
        type: 'success',
        date: new Date(),
        read: false,
      });

    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      
      // Adicionar notificação de erro
      await addNotification({
        title: 'Erro ao Adicionar Transação',
        message: 'Não foi possível adicionar a transação. Tente novamente.',
        type: 'error',
        date: new Date(),
        read: false,
      });
      
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
      if (updates.date) {
        updateData.date = updates.date.toISOString();
        if (updates.paymentMethod === 'creditCard') {
          updateData.invoice_month = updates.date.getMonth();
          updateData.invoice_year = updates.date.getFullYear();
        } else {
          updateData.invoice_month = null;
          updateData.invoice_year = null;
        }
      }
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
      if (updates.bankId !== undefined) updateData.bank_id = updates.bankId;
      if (updates.cardId !== undefined) updateData.card_id = updates.cardId;
      if (updates.isInstallment !== undefined) updateData.is_installment = updates.isInstallment;
      if (updates.installmentDetails) updateData.installment_details = updates.installmentDetails;
      if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
      if (updates.recurringDetails) updateData.recurring_details = updates.recurringDetails;
      if (updates.order !== undefined) updateData.order_index = updates.order;

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
        prev.map(t => t.id === id ? { ...t, ...updates, subcategory: updates.subcategory || t.subcategory } : t)
      );

      // Adicionar notificação de sucesso
      await addNotification({
        title: 'Transação Atualizada',
        message: 'Transação atualizada com sucesso.',
        type: 'success',
        date: new Date(),
        read: false,
      });

    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      
      // Adicionar notificação de erro
      await addNotification({
        title: 'Erro ao Atualizar Transação',
        message: 'Não foi possível atualizar a transação. Tente novamente.',
        type: 'error',
        date: new Date(),
        read: false,
      });
      
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

      // Adicionar notificação de sucesso
      await addNotification({
        title: 'Transação Excluída',
        message: 'Transação excluída com sucesso.',
        type: 'success',
        date: new Date(),
        read: false,
      });

    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      
      // Adicionar notificação de erro
      await addNotification({
        title: 'Erro ao Excluir Transação',
        message: 'Não foi possível excluir a transação. Tente novamente.',
        type: 'error',
        date: new Date(),
        read: false,
      });
      
      throw error;
    }
  };

  const clearAllTransactions = async () => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setTransactions([]);

      // Adicionar notificação de sucesso
      await addNotification({
        title: 'Transações Limpas',
        message: 'Todas as transações foram removidas com sucesso.',
        type: 'success',
        date: new Date(),
        read: false,
      });

    } catch (error) {
      console.error('Erro ao limpar transações:', error);
      
      // Adicionar notificação de erro
      await addNotification({
        title: 'Erro ao Limpar Transações',
        message: 'Não foi possível limpar as transações. Tente novamente.',
        type: 'error',
        date: new Date(),
        read: false,
      });
      
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

  // Funções para gerenciar cartões
  const addCard = async (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({
          user_id: user.id,
          bank_id: card.bankId,
          last_four_digits: card.lastFourDigits,
          card_type: card.cardType,
          is_active: card.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      const newCard: Card = {
        id: data.id,
        bankId: data.bank_id,
        lastFourDigits: data.last_four_digits,
        cardType: data.card_type as 'credit' | 'debit',
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setCards(prev => [newCard, ...prev]);

    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      throw error;
    }
  };

  const updateCard = async (id: string, updates: Partial<Card>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      
      if (updates.lastFourDigits !== undefined) updateData.last_four_digits = updates.lastFourDigits;
      if (updates.cardType !== undefined) updateData.card_type = updates.cardType;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { error } = await supabase
        .from('cards')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCards(prev => 
        prev.map(c => c.id === id ? { ...c, ...updates } : c)
      );

    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      throw error;
    }
  };

  const deleteCard = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCards(prev => prev.filter(c => c.id !== id));

    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
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

  const clearAllRecurringTransactions = async () => {
    if (!user) return;

    try {
      // 1. Limpar transações recorrentes da tabela recurring_transactions
      const { error: recurringError } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('user_id', user.id);

      if (recurringError) throw recurringError;

      setRecurringTransactions([]);

      // 2. Limpar transações que foram marcadas como recorrentes (campo is_recurring = true)
      const { data: recurringTransactionsData, error: fetchError } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_recurring', true);

      if (fetchError) throw fetchError;

      if (recurringTransactionsData && recurringTransactionsData.length > 0) {
        const transactionIds = recurringTransactionsData.map(t => t.id);
        
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .in('id', transactionIds);

        if (deleteError) throw deleteError;

        // Atualizar o estado local removendo as transações deletadas
        setTransactions(prev => prev.filter(t => !transactionIds.includes(t.id)));
      }

      // Adicionar notificação de sucesso
      await addNotification({
        title: 'Transações recorrentes limpas',
        message: `Todas as transações recorrentes foram removidas com sucesso.`,
        type: 'success',
        date: new Date(),
        read: false,
      });

    } catch (error) {
      console.error('Erro ao limpar transações recorrentes:', error);
      
      // Adicionar notificação de erro
      await addNotification({
        title: 'Erro ao limpar transações recorrentes',
        message: 'Não foi possível limpar as transações recorrentes. Tente novamente.',
        type: 'error',
        date: new Date(),
        read: false,
      });
      
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
      t.paymentMethod === 'creditCard' &&
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

  const forceUpdateAllCreditCardTransactions = async () => {
    if (!user) return;

    try {
      // Buscar todas as transações com cartão de crédito
      const { data: creditCardTransactions, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('payment_method', 'creditCard');

      if (fetchError) {
        console.error('Erro ao buscar transações:', fetchError);
        return;
      }

      if (!creditCardTransactions || creditCardTransactions.length === 0) {
        console.log('Nenhuma transação com cartão de crédito encontrada');
        return;
      }

      console.log(`Atualizando ${creditCardTransactions.length} transações...`);

      // Atualizar cada transação
      for (const transaction of creditCardTransactions) {
        const date = new Date(transaction.date);
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            invoice_month: date.getMonth(),
            invoice_year: date.getFullYear()
          })
          .eq('id', transaction.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Erro ao atualizar transação:', updateError);
        }
      }

      // Recarregar os dados
      await loadUserData();

      console.log('Todas as transações foram atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar transações:', error);
    }
  };

  const value: FinanceContextType = {
    transactions,
    budgets,
    banks,
    cards,
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
    clearAllTransactions,
    reorderTransactions,
    
    addBudget,
    updateBudget,
    deleteBudget,
    
    addBank,
    updateBank,
    deleteBank,
    
    addCard,
    updateCard,
    deleteCard,
    
    addGoal,
    updateGoal,
    deleteGoal,
    
    addRecurringTransaction,
    deleteRecurringTransaction,
    clearAllRecurringTransactions,
    
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
    forceUpdateAllCreditCardTransactions,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
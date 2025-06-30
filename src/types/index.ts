export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
  tags?: string[];
  paymentMethod?: 'money' | 'creditCard' | 'debitCard' | 'pix';
  bankId?: string;
  isInstallment?: boolean;
  installmentDetails?: {
    current: number;
    total: number;
    groupId: string;
  };
  order?: number;
  invoiceMonth?: number;
  invoiceYear?: number;
}

export interface Budget {
  id: string;
  category: string;
  targetAmount: number;
  month: string; // YYYY-MM format
  spent?: number;
  alertThreshold?: number; // Percentage to trigger alert
}

export interface Bank {
  id: string;
  name: string;
  color: string;
  creditLimit?: number;
  type: 'credit' | 'debit' | 'account';
  closingDay?: number; // Day of month when invoice closes
  dueDay?: number; // Day of month when payment is due
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  dayOfMonth: number;
  lastProcessed?: string; // YYYY-MM format
  isActive: boolean;
}

export interface MonthlyBalance {
  month: string; // YYYY-MM format
  startingBalance: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: Date;
  read: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  bankId: string;
  month: number;
  year: number;
  totalAmount: number;
  dueDate: Date;
  isPaid: boolean;
  transactions: Transaction[];
}
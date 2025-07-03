import React, { useState } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import TransactionModal from '../components/TransactionModal';
import { exportTransactionsToPDF } from '../lib/pdfExport';

const TransactionsPage: React.FC = () => {
  const { 
    transactions, 
    selectedYear, 
    selectedMonth,
    getCurrentMonthTransactions,
    getCurrentMonthBalance
  } = useFinance();
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleExportPDF = () => {
    const currentTransactions = getCurrentMonthTransactions();
    const income = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0);

    exportTransactionsToPDF({
      title: 'Extrato de Transações',
      subtitle: `${startDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      transactions: currentTransactions,
      startDate,
      endDate,
      totalIncome: income,
      totalExpenses: expenses,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Transações</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* ... resto do código existente ... */}
    </div>
  );
};

export default TransactionsPage; 
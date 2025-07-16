import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Calendar, Tag, DollarSign, Trash2, RotateCcw } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import TransactionModal from '../components/TransactionModal';
import DragDropTransactions from '../components/DragDropTransactions';
import { Transaction } from '../types';

const ExpensesPage: React.FC = () => {
  const { 
    getCurrentMonthTransactions, 
    deleteTransaction, 
    clearAllRecurringTransactions,
    recurringTransactions,
    transactions,
    banks,
    selectedYear,
    selectedMonth 
  } = useFinance();
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearingRecurring, setIsClearingRecurring] = useState(false);

  const categories = [
    'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 
    'Educação', 'Salário', 'Investimentos', 'Outros'
  ];

  const currentTransactions = getCurrentMonthTransactions();
  
  const filteredTransactions = currentTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    const matchesPaymentMethod = selectedPaymentMethod === 'all' || transaction.paymentMethod === selectedPaymentMethod;
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesPaymentMethod && matchesType;
  });

  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((total, t) => total + t.amount, 0);
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((total, t) => total + t.amount, 0);
  const transactionCount = filteredTransactions.length;
  const averageDaily = totalExpenses / new Date(selectedYear, selectedMonth + 1, 0).getDate();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction(id);
    }
  };

  const handleCloseModal = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedPaymentMethod('all');
    setSelectedType('all');
  };

  const clearAllTransactions = () => {
    if (confirm('Tem certeza que deseja excluir TODAS as transações do mês? Esta ação não pode ser desfeita.')) {
      filteredTransactions.forEach(t => deleteTransaction(t.id));
    }
  };

  const clearRecurringTransactions = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmClearRecurring = async () => {
    setIsClearingRecurring(true);
    try {
      console.log('Iniciando limpeza de transações recorrentes...');
      console.log('Transações recorrentes antes da limpeza:', recurringTransactions?.length || 0);
      
      // Contar transações que serão deletadas - apenas baseado no campo isRecurring
      const transactionsToDelete = transactions.filter((t: Transaction) => 
        t.isRecurring === true
      );
      console.log('Transações que serão deletadas:', transactionsToDelete.length);
      
      await clearAllRecurringTransactions();
      console.log('Transações recorrentes limpas com sucesso!');
      // Removido o modal de sucesso - apenas as notificações do sistema serão mostradas
    } catch (error) {
      console.error('Erro ao limpar transações recorrentes:', error);
      setErrorMessage('Erro ao limpar transações recorrentes. Verifique o console para mais detalhes.');
      setShowErrorModal(true);
    } finally {
      setIsClearingRecurring(false);
      setShowConfirmModal(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor', 'Forma de Pagamento', 'Tags'];
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(t => [
          t.date.toLocaleDateString('pt-BR'),
          t.type === 'income' ? 'Receita' : 'Despesa',
          `"${t.description}"`,
          t.category,
          t.amount.toFixed(2).replace('.', ','),
          t.paymentMethod || 'money',
          `"${(t.tags || []).join(', ')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transacoes-${selectedYear}-${selectedMonth + 1}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Simular um pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      setErrorMessage('Erro ao exportar arquivo CSV. Tente novamente.');
      setShowErrorModal(true);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedPaymentMethod !== 'all' || selectedType !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Controle de Transações</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Gerencie e monitore suas transações</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={exportToCSV}
            disabled={isExporting}
            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Exportar transações para CSV"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Adicionar Transação</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Receitas</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total Despesas</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Transações</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
                {transactionCount}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Média Diária</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
                {formatCurrency(averageDaily)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Filtros
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 self-start sm:self-auto"
            >
              Limpar Filtros
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            aria-label="Filtrar por tipo de transação"
          >
            <option value="all">Todos os tipos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            aria-label="Filtrar por categoria"
          >
            <option value="all">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            aria-label="Filtrar por forma de pagamento"
          >
            <option value="all">Todas as formas</option>
            <option value="money">Dinheiro</option>
            <option value="creditCard">Cartão de Crédito</option>
            <option value="debitCard">Cartão de Débito</option>
            <option value="pix">PIX</option>
          </select>

          {/* Clear Recurring Transactions Button */}
          <button 
            onClick={clearRecurringTransactions}
            disabled={isClearingRecurring}
            className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-1 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Limpar transações recorrentes"
          >
            {isClearingRecurring ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Limpando...</span>
                <span className="sm:hidden">Limpando</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Limpar Recorrentes</span>
                <span className="sm:hidden">Recorrentes</span>
              </>
            )}
          </button>

          {/* Clear All Button */}
          <button 
            onClick={clearAllTransactions}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-1 text-xs sm:text-sm"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Limpar Tudo</span>
            <span className="sm:hidden">Tudo</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
              Transações ({filteredTransactions.length})
            </h3>
            {hasActiveFilters && (
              <span className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                Filtros ativos
              </span>
            )}
          </div>
        </div>

        <DragDropTransactions 
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <TransactionModal 
        isOpen={showTransactionModal}
        onClose={handleCloseModal}
        transaction={editingTransaction}
      />

      {/* Modal de Confirmação */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Tem certeza que deseja excluir <strong>TODAS</strong> as transações recorrentes?<br />
              <span className="text-red-600 dark:text-red-400">Esta ação não pode ser desfeita.</span>
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmClearRecurring}
                disabled={isClearingRecurring}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isClearingRecurring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Erro */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white text-center mb-2">
              Erro
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              {errorMessage}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
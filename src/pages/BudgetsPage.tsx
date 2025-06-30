import React, { useState } from 'react';
import { Plus, Target, AlertTriangle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import BudgetModal from '../components/BudgetModal';
import { Budget } from '../types';

const BudgetsPage: React.FC = () => {
  const { 
    getCurrentMonthBudgets, 
    getCurrentMonthTransactions, 
    deleteBudget,
    selectedYear,
    selectedMonth 
  } = useFinance();
  
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const budgets = getCurrentMonthBudgets();
  const transactions = getCurrentMonthTransactions();

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowBudgetModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteBudget(id);
    }
  };

  const handleCloseModal = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getBudgetStatus = (spent: number, target: number, threshold: number = 80) => {
    const percentage = (spent / target) * 100;
    
    if (percentage >= 100) {
      return { status: 'exceeded', color: 'red', icon: AlertTriangle };
    } else if (percentage >= threshold) {
      return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    } else {
      return { status: 'good', color: 'green', icon: CheckCircle };
    }
  };

  const categoryExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Orçamentos - {months[selectedMonth]} {selectedYear}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Controle seus gastos por categoria
          </p>
        </div>
        <button
          onClick={() => setShowBudgetModal(true)}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {budgets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            Nenhum orçamento definido
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Crie orçamentos para controlar melhor seus gastos por categoria
          </p>
          <button
            onClick={() => setShowBudgetModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Criar Primeiro Orçamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const spent = categoryExpenses[budget.category] || 0;
            const remaining = budget.targetAmount - spent;
            const percentage = Math.min((spent / budget.targetAmount) * 100, 100);
            const status = getBudgetStatus(spent, budget.targetAmount, budget.alertThreshold);
            const StatusIcon = status.icon;

            return (
              <div key={budget.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      status.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                      status.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                      'bg-green-100 dark:bg-green-900/20'
                    }`}>
                      <StatusIcon className={`w-5 h-5 ${
                        status.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        status.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {budget.category}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {percentage.toFixed(1)}% usado
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gasto</span>
                    <span className={`font-bold ${
                      status.color === 'red' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-800 dark:text-white'
                    }`}>
                      {formatCurrency(spent)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Orçamento</span>
                    <span className="font-bold text-gray-800 dark:text-white">
                      {formatCurrency(budget.targetAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {remaining >= 0 ? 'Restante' : 'Excedido'}
                    </span>
                    <span className={`font-bold ${
                      remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(Math.abs(remaining))}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        status.color === 'red' ? 'bg-red-500' :
                        status.color === 'yellow' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {budget.alertThreshold && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                      <span>Alerta em {budget.alertThreshold}%</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                  )}

                  {status.status === 'exceeded' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                        ⚠️ Orçamento excedido em {(percentage - 100).toFixed(1)}%
                      </p>
                    </div>
                  )}

                  {status.status === 'warning' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">
                        ⚠️ Atenção: {percentage.toFixed(1)}% do orçamento usado
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BudgetModal 
        isOpen={showBudgetModal}
        onClose={handleCloseModal}
        budget={editingBudget}
      />
    </div>
  );
};

export default BudgetsPage;
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { Budget } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget?: Budget | null;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, budget }) => {
  const { addBudget, updateBudget, selectedYear, selectedMonth } = useFinance();
  
  const [formData, setFormData] = useState({
    category: 'Alimentação',
    targetAmount: '',
    alertThreshold: '80',
  });

  const categories = [
    'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 
    'Educação', 'Investimentos', 'Outros'
  ];

  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        targetAmount: budget.targetAmount.toString(),
        alertThreshold: (budget.alertThreshold || 80).toString(),
      });
    } else {
      setFormData({
        category: 'Alimentação',
        targetAmount: '',
        alertThreshold: '80',
      });
    }
  }, [budget, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    
    const budgetData = {
      category: formData.category,
      targetAmount: parseFloat(formData.targetAmount),
      month: monthKey,
      alertThreshold: parseInt(formData.alertThreshold),
    };

    if (budget) {
      updateBudget(budget.id, budgetData);
    } else {
      addBudget(budgetData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              required
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor do Orçamento (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alerta quando atingir (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.alertThreshold}
              onChange={(e) => setFormData(prev => ({ ...prev, alertThreshold: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Você receberá uma notificação quando atingir esta porcentagem do orçamento
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              {budget ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
import React, { useState } from 'react';
import { X, Target, Calendar, DollarSign, Flag, Save } from 'lucide-react';

interface InvestmentGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

interface InvestmentGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<InvestmentGoal, 'id' | 'currentAmount'>) => void;
  editingGoal?: InvestmentGoal | null;
}

const InvestmentGoalsModal: React.FC<InvestmentGoalsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGoal
}) => {
  const [formData, setFormData] = useState({
    name: editingGoal?.name || '',
    targetAmount: editingGoal?.targetAmount || 0,
    deadline: editingGoal?.deadline || '',
    category: editingGoal?.category || '',
    priority: editingGoal?.priority || 'medium' as const,
    description: editingGoal?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      return;
    }

    onSave(formData);
    onClose();
    
    // Reset form
    setFormData({
      name: '',
      targetAmount: 0,
      deadline: '',
      category: '',
      priority: 'medium',
      description: ''
    });
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    high: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-500" />
              {editingGoal ? 'Editar Meta' : 'Nova Meta de Investimento'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome da Meta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome da Meta *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Comprar 1 Bitcoin"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-gray-800 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Valor Alvo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor Alvo (USD) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-slate-700 text-gray-800 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Data Limite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Limite *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-slate-700 text-gray-800 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: DeFi, Bitcoin, Altcoins"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-gray-800 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Prioridade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prioridade
              </label>
              <div className="flex gap-3">
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      formData.priority === priority
                        ? priorityColors[priority]
                        : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Flag className="w-4 h-4 inline mr-1" />
                    {priority === 'low' ? 'Baixa' : priority === 'medium' ? 'Média' : 'Alta'}
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição (Opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Adicione detalhes sobre sua meta..."
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-gray-800 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                         rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                         transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {editingGoal ? 'Atualizar Meta' : 'Criar Meta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvestmentGoalsModal; 
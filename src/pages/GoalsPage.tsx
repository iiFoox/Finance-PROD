import React, { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import GoalModal from '../components/GoalModal';
import { Goal } from '../types';

const GoalsPage: React.FC = () => {
  const { goals, deleteGoal, updateGoal, getGoalProgress } = useFinance();
  
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteGoal(id);
    }
  };

  const handleToggleComplete = (goal: Goal) => {
    updateGoal(goal.id, { isCompleted: !goal.isCompleted });
  };

  const handleCloseModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (date: Date) => 
    date.toLocaleDateString('pt-BR');

  const getDaysRemaining = (targetDate: Date) => {
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      default: return 'green';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      default: return 'Baixa';
    }
  };

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Metas Financeiras</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Defina e acompanhe suas metas de economia
          </p>
        </div>
        <button
          onClick={() => setShowGoalModal(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nova Meta</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            Nenhuma meta definida
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Crie metas financeiras para manter o foco nos seus objetivos
          </p>
          <button
            onClick={() => setShowGoalModal(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Criar Primeira Meta
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Metas Ativas ({activeGoals.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGoals.map((goal) => {
                  const progress = getGoalProgress(goal.id);
                  const daysRemaining = getDaysRemaining(goal.targetDate);
                  const priorityColor = getPriorityColor(goal.priority);
                  const isOverdue = daysRemaining < 0;

                  return (
                    <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            priorityColor === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                            priorityColor === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                            'bg-green-100 dark:bg-green-900/20'
                          }`}>
                            <Target className={`w-5 h-5 ${
                              priorityColor === 'red' ? 'text-red-600 dark:text-red-400' :
                              priorityColor === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-green-600 dark:text-green-400'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 dark:text-white">
                              {goal.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {goal.category} • {getPriorityLabel(goal.priority)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleComplete(goal)}
                            className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            title="Marcar como concluída"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(goal)}
                            className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(goal.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {goal.description}
                        </p>
                      )}

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Progresso</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {progress.toFixed(1)}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Atual</span>
                          <span className="font-bold text-gray-800 dark:text-white">
                            {formatCurrency(goal.currentAmount)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Meta</span>
                          <span className="font-bold text-gray-800 dark:text-white">
                            {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Faltam</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(goal.targetAmount - goal.currentAmount)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(goal.targetDate)}</span>
                          </div>
                          <span className={`text-sm font-medium ${
                            isOverdue ? 'text-red-600 dark:text-red-400' :
                            daysRemaining <= 30 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {isOverdue ? 
                              `${Math.abs(daysRemaining)} dias atrasado` :
                              `${daysRemaining} dias restantes`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Metas Concluídas ({completedGoals.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 opacity-75">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 dark:text-white line-through">
                            {goal.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Concluída em {formatDate(goal.targetDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleComplete(goal)}
                          className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Reativar meta"
                        >
                          <Target className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(goal.targetAmount)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Meta alcançada! 🎉</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <GoalModal 
        isOpen={showGoalModal}
        onClose={handleCloseModal}
        goal={editingGoal}
      />
    </div>
  );
};

export default GoalsPage;
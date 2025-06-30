import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Lightbulb
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { ExpenseLineChart, CategoryPieChart, MonthlyComparisonChart } from '../components/Charts';
import TransactionModal from '../components/TransactionModal';

const DashboardPage: React.FC = () => {
  const { 
    getCurrentMonthTransactions, 
    getCurrentMonthBalance, 
    getCurrentMonthBudgets,
    transactions,
    selectedYear,
    selectedMonth,
    addNotification
  } = useFinance();
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const currentTransactions = getCurrentMonthTransactions();
  const currentBalance = getCurrentMonthBalance();
  
  const totalIncome = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  // Previous month comparison
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const prevMonthExpenses = transactions.filter(t => 
    t.type === 'expense' &&
    t.date.getFullYear() === prevYear && 
    t.date.getMonth() === prevMonth
  ).reduce((sum, t) => sum + t.amount, 0);

  const expenseChange = prevMonthExpenses > 0 ? ((totalExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : 0;
  
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const dailyAverage = totalExpenses / daysInMonth;

  const recentTransactions = currentTransactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const budgets = getCurrentMonthBudgets();
  const categoryExpenses = currentTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const generateInsights = () => {
    setIsGeneratingInsights(true);
    
    // Simple insights based on spending patterns
    setTimeout(() => {
      const insights = [];
      
      if (totalExpenses > totalIncome) {
        insights.push('⚠️ Seus gastos estão acima da sua renda este mês.');
      }
      
      const topCategory = Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (topCategory) {
        insights.push(`💡 Sua maior categoria de gastos é ${topCategory[0]} com ${topCategory[1].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`);
      }
      
      if (expenseChange > 20) {
        insights.push('📈 Seus gastos aumentaram significativamente em relação ao mês passado.');
      } else if (expenseChange < -20) {
        insights.push('📉 Parabéns! Você reduziu seus gastos em relação ao mês passado.');
      }
      
      if (dailyAverage > 100) {
        insights.push(`💰 Sua média diária de gastos é de ${dailyAverage.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`);
      }

      setInsights(insights.join(' '));
      setIsGeneratingInsights(false);
    }, 1500);
  };

  const stats = [
    {
      label: 'Receitas do Mês',
      value: totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Gastos do Mês',
      value: totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      change: `${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}%`,
      trend: expenseChange > 0 ? 'up' : 'down',
      icon: CreditCard,
      color: 'red'
    },
    {
      label: 'Saldo Atual',
      value: currentBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      change: currentBalance > 0 ? 'Positivo' : 'Negativo',
      trend: currentBalance > 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'blue'
    },
    {
      label: 'Média Diária',
      value: dailyAverage.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      change: `${daysInMonth} dias`,
      trend: 'up',
      icon: Calendar,
      color: 'purple'
    }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl lg:rounded-2xl p-4 lg:p-6 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-2">Olá! Bem-vindo de volta 👋</h2>
            <p className="text-blue-100 text-sm lg:text-base">Aqui está um resumo das suas finanças hoje</p>
          </div>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 backdrop-blur-sm text-sm lg:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Insights Card */}
      <div className="bg-slate-800 border border-blue-800 p-4 lg:p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-lg lg:text-xl font-semibold text-white flex items-center">
            <Lightbulb className="w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 text-yellow-400" />
            Insights Financeiros
          </h3>
          <button
            onClick={generateInsights}
            disabled={isGeneratingInsights}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-500 flex items-center text-xs lg:text-sm disabled:opacity-50 transition-colors"
          >
            {isGeneratingInsights ? (
              <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Lightbulb className="w-3 h-3 lg:w-4 lg:h-4 mr-2" />
            )}
            Gerar Insight
          </button>
        </div>
        <div className="text-gray-300 min-h-[50px] flex items-center text-sm lg:text-base">
          {insights || 'Clique no botão para gerar um insight sobre suas finanças do mês.'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800 rounded-xl p-3 lg:p-6 border border-slate-700 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2 lg:mb-4">
                <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-900/20' :
                  stat.color === 'red' ? 'bg-red-900/20' :
                  stat.color === 'green' ? 'bg-green-900/20' :
                  'bg-purple-900/20'
                }`}>
                  <Icon className={`w-4 h-4 lg:w-6 lg:h-6 ${
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'red' ? 'text-red-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    'text-purple-400'
                  }`} />
                </div>
                <div className={`flex items-center text-xs lg:text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 lg:w-4 lg:h-4 mr-1" /> : <ArrowDownRight className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />}
                  <span className="hidden sm:inline">{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-lg lg:text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs lg:text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl p-4 lg:p-6 border border-slate-700">
          <h3 className="text-base lg:text-lg font-semibold text-white mb-4">Evolução de Despesas Diárias</h3>
          <div className="relative h-64 lg:h-80 xl:h-96">
            <ExpenseLineChart />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 lg:p-6 border border-slate-700">
          <h3 className="text-base lg:text-lg font-semibold text-white mb-4">Despesas por Categoria</h3>
          <div className="relative h-64 lg:h-80 xl:h-96">
            <CategoryPieChart />
          </div>
        </div>
      </div>

      {/* Monthly Comparison Chart */}
      <div className="bg-slate-800 rounded-xl p-4 lg:p-6 border border-slate-700">
        <h3 className="text-base lg:text-lg font-semibold text-white mb-4">Comparativo Mensal</h3>
        <div className="relative h-64 lg:h-80 xl:h-96">
          <MonthlyComparisonChart />
        </div>
      </div>

      {/* Recent Transactions & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Recent Transactions */}
        <div className="bg-slate-800 rounded-xl p-4 lg:p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-white">Transações Recentes</h3>
            <button className="text-xs lg:text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Ver todas
            </button>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-900/20' : 'bg-red-900/20'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-white">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs lg:text-sm font-medium ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {transaction.date.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-slate-800 rounded-xl p-4 lg:p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-white">Orçamentos</h3>
            <button className="text-xs lg:text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Gerenciar
            </button>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {budgets.slice(0, 4).map((budget) => {
              const spent = categoryExpenses[budget.category] || 0;
              const progress = Math.min((spent / budget.targetAmount) * 100, 100);
              const isOverBudget = spent > budget.targetAmount;
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs lg:text-sm font-medium text-white">
                      {budget.category}
                    </span>
                    <span className={`text-xs lg:text-sm ${isOverBudget ? 'text-red-400' : 'text-gray-400'}`}>
                      {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / {budget.targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <TransactionModal 
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
      />
    </div>
  );
};

export default DashboardPage;
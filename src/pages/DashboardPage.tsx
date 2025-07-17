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
  Maximize2,
  Minimize2
} from 'lucide-react';
import CategoryIcon from '../components/CategoryIcons';
import PixelCategoryIcon from '../components/PixelCategoryIcons';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { useAppSettings } from '../hooks/useAppSettings';
import { useNavigate } from 'react-router-dom';

import { ExpenseLineChart, CategoryPieChart, MonthlyComparisonChart } from '../components/Charts';
import TransactionModal from '../components/TransactionModal';


const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency, formatDate } = useAppSettings();
  const { 
    getCurrentMonthTransactions, 
    getCurrentMonthBalance, 
    getCurrentMonthBudgets,
    transactions,
    selectedYear,
    selectedMonth,
    addNotification,
    addTransaction
  } = useFinance();

  // Função para obter o primeiro nome do usuário
  const getFirstName = () => {
    if (!user) return '';
    
    // Tentar obter o nome dos metadados do usuário
    const name = user.user_metadata?.name || user.user_metadata?.full_name;
    if (name) {
      return name.split(' ')[0];
    }
    
    // Fallback: usar o email se não houver nome
    const email = user.email;
    if (email) {
      return email.split('@')[0];
    }
    
    return '';
  };
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [expandedChart, setExpandedChart] = useState(false);
  const [chartTransactionType, setChartTransactionType] = useState<'expense' | 'income' | 'all'>('expense');

  const currentTransactions = getCurrentMonthTransactions();
  const currentBalance = getCurrentMonthBalance();
  
  const totalIncome = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  // Detalhamento das receitas
  const salaryIncome = currentTransactions
    .filter(t => t.type === 'income' && t.category === 'Salário')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const investmentIncome = currentTransactions
    .filter(t => t.type === 'income' && t.category === 'Investimentos')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const freelanceIncome = currentTransactions
    .filter(t => t.type === 'income' && t.category === 'Freelance')
    .reduce((sum, t) => sum + t.amount, 0);
  
    const otherIncome = currentTransactions
    .filter(t => t.type === 'income' && !['Salário', 'Investimentos', 'Freelance'].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0);


  
  
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



  const stats = [
    {
      label: 'Receitas do Mês',
      value: formatCurrency(totalIncome),
      change: '+8.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Gastos do Mês',
      value: formatCurrency(totalExpenses),
      change: `${expenseChange > 0 ? '+' : ''}${expenseChange.toFixed(1)}%`,
      trend: expenseChange > 0 ? 'up' : 'down',
      icon: CreditCard,
      color: 'red'
    },
    {
      label: 'Saldo Atual',
      value: formatCurrency(currentBalance),
      change: currentBalance > 0 ? 'Positivo' : 'Negativo',
      trend: currentBalance > 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'blue'
    },
    {
      label: 'Média Diária',
      value: formatCurrency(dailyAverage),
      change: `${daysInMonth} dias`,
      trend: 'up',
      icon: Calendar,
      color: 'purple'
    }
  ];

  const incomeDetails = [
    {
      label: 'Salário',
      value: formatCurrency(salaryIncome),
      percentage: totalIncome > 0 ? ((salaryIncome / totalIncome) * 100).toFixed(1) : '0',
      color: 'green'
    },
    {
      label: 'Investimentos',
      value: formatCurrency(investmentIncome),
      percentage: totalIncome > 0 ? ((investmentIncome / totalIncome) * 100).toFixed(1) : '0',
      color: 'blue'
    },
    {
      label: 'Renda Extra',
      value: formatCurrency(freelanceIncome),
      percentage: totalIncome > 0 ? ((freelanceIncome / totalIncome) * 100).toFixed(1) : '0',
      color: 'purple'
    },
    {
      label: 'Outros Ganhos',
      value: formatCurrency(otherIncome),
      percentage: totalIncome > 0 ? ((otherIncome / totalIncome) * 100).toFixed(1) : '0',
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Olá, {getFirstName() || 'Usuário'}! Bem-vindo de volta 👋
            </h2>
            <p className="text-blue-100 text-base">Aqui está um resumo das suas finanças hoje</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowTransactionModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 backdrop-blur-sm text-base"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Transação</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800 rounded-lg p-5 border border-slate-700 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'blue' ? 'bg-blue-900/20' :
                    stat.color === 'red' ? 'bg-red-900/20' :
                    stat.color === 'green' ? 'bg-green-900/20' :
                    'bg-purple-900/20'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      stat.color === 'blue' ? 'text-blue-400' :
                      stat.color === 'red' ? 'text-red-400' :
                      stat.color === 'green' ? 'text-green-400' :
                      'text-purple-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-white truncate">{stat.value}</p>
                    <p className="text-sm text-gray-400 truncate">{stat.label}</p>
                  </div>
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  <span className="hidden sm:inline">{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Income Details */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-base font-semibold text-white mb-4">Detalhamento de Receitas</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {incomeDetails.map((income, index) => (
            <div key={index} className="bg-slate-700 rounded-md p-3 border border-slate-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PixelCategoryIcon 
                    category={income.label} 
                    size={18} 
                  />
                  <span className="text-sm font-medium text-gray-300">{income.label}</span>
                </div>
                <span className="text-sm font-bold text-white">{income.percentage}%</span>
              </div>
              <div className="text-base font-bold text-white mb-2">{income.value}</div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    income.color === 'green' ? 'bg-green-500' :
                    income.color === 'blue' ? 'bg-blue-500' :
                    income.color === 'purple' ? 'bg-purple-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${income.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Charts */}
        <div className="lg:col-span-2 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Evolução de Transações Diárias</h3>
            <div className="flex items-center space-x-2">
              {/* Filtro de tipo de transação */}
              <select
                value={chartTransactionType}
                onChange={(e) => setChartTransactionType(e.target.value as 'expense' | 'income' | 'all')}
                className="bg-slate-700 border border-slate-600 text-white text-sm rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrar por tipo de transação"
              >
                <option value="expense">Despesas</option>
                <option value="income">Receitas</option>
                <option value="all">Ambos</option>
              </select>
              
              <button
                onClick={() => setExpandedChart(!expandedChart)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md text-sm transition-colors flex items-center space-x-1"
              >
                {expandedChart ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Recolher</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Expandir</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className={`relative transition-all duration-300 ${expandedChart ? 'h-80 lg:h-96' : 'h-56 lg:h-64'}`}>
            <ExpenseLineChart expanded={expandedChart} transactionType={chartTransactionType} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-base font-semibold text-white mb-4">Despesas por Categoria</h3>
          <div className="relative h-56 lg:h-64">
            <CategoryPieChart />
          </div>
        </div>
      </div>

      {/* Monthly Comparison Chart */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <h3 className="text-base font-semibold text-white mb-4">Comparativo Mensal</h3>
        <div className="relative h-56 lg:h-64">
          <MonthlyComparisonChart />
        </div>
      </div>

      {/* Recent Transactions & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Transações Recentes</h3>
            <button 
              onClick={() => navigate('/expenses')}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Ver todas
            </button>
          </div>
          
          <div className="space-y-2">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-md h-12 transition-all duration-200 hover:bg-slate-600 cursor-pointer">
                <div className="flex items-center gap-3">
                  <PixelCategoryIcon 
                    category={transaction.category} 
                    size={20}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-medium ${
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
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Orçamentos</h3>
            <button 
              onClick={() => navigate('/budgets')}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Gerenciar
            </button>
          </div>
          
          <div className="space-y-2">
            {budgets.slice(0, 4).map((budget) => {
              const spent = categoryExpenses[budget.category] || 0;
              const progress = Math.min((spent / budget.targetAmount) * 100, 100);
              const isOverBudget = spent > budget.targetAmount;
              
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <PixelCategoryIcon 
                        category={budget.category} 
                        size={16} 
                      />
                      <span className="text-sm font-medium text-white">
                        {budget.category}
                      </span>
                    </div>
                    <span className={`text-sm ${isOverBudget ? 'text-red-400' : 'text-gray-400'}`}>
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
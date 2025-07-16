import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { useFinance } from '../contexts/FinanceContext';
import { useAppSettings } from '../hooks/useAppSettings';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.5)',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
    y: {
      ticks: {
        color: 'rgba(255, 255, 255, 0.5)',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
};

interface ExpenseLineChartProps {
  expanded?: boolean;
  transactionType?: 'expense' | 'income' | 'all';
}

export const ExpenseLineChart: React.FC<ExpenseLineChartProps> = ({ 
  expanded = false, 
  transactionType = 'expense' 
}) => {
  const { getCurrentMonthTransactions, selectedYear, selectedMonth } = useFinance();
  const { formatCurrency, formatDate } = useAppSettings();
  
  const allTransactions = getCurrentMonthTransactions();
  const transactions = transactionType === 'all' 
    ? allTransactions 
    : allTransactions.filter(t => t.type === transactionType);
  
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  

  
  const dailyAmounts = Array(daysInMonth).fill(0);
  transactions.forEach(t => {
    const day = t.date.getDate() - 1;
    dailyAmounts[day] += t.amount;
  });

  // Se expandido, mostrar cada categoria separadamente
  const categoryAmounts: Record<string, number[]> = {};
  
  if (expanded) {
    // Inicializar arrays para cada categoria
    transactions.forEach(t => {
      if (!categoryAmounts[t.category]) {
        categoryAmounts[t.category] = Array(daysInMonth).fill(0);
      }
    });
    
    // Preencher dados por categoria
    transactions.forEach(t => {
      const day = t.date.getDate() - 1;
      categoryAmounts[t.category][day] += t.amount;
    });
    

  }

  const colors = [
    '#6366f1', '#34d399', '#f97316', '#ef4444', 
    '#a78bfa', '#ec4899', '#9ca3af', '#fbbf24'
  ];

  const getChartTitle = () => {
    switch (transactionType) {
      case 'income': return 'Receitas Diárias';
      case 'expense': return 'Despesas Diárias';
      case 'all': return 'Fluxo de Caixa Diário';
      default: return 'Transações Diárias';
    }
  };

  const datasets = expanded 
    ? Object.entries(categoryAmounts).map(([category, data], index) => ({
        label: category,
        data,
        borderColor: colors[index % colors.length],
        backgroundColor: `${colors[index % colors.length]}20`,
        fill: false,
        tension: 0.4,
      }))
    : [{
        label: getChartTitle(),
        data: dailyAmounts,
        borderColor: transactionType === 'income' ? '#34d399' : transactionType === 'expense' ? '#ef4444' : '#6366f1',
        backgroundColor: transactionType === 'income' ? 'rgba(52, 211, 153, 0.2)' : transactionType === 'expense' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
        fill: true,
        tension: 0.4,
      }];



  const data = {
    labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
    datasets,
  };

  const lineOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          title: function(context: any) {
            const dayIndex = context[0].dataIndex;
            const date = new Date(selectedYear, selectedMonth, dayIndex + 1);
            return formatDate(date);
          },
          label: function(context: any) {
            const value = context.parsed.y;
            const formattedValue = formatCurrency(value);
            
            // Buscar a descrição da transação para este dia e categoria
            const dayIndex = context.dataIndex;
            const category = context.dataset.label;
            const transaction = transactions.find(t => 
              t.category === category && 
              t.date.getDate() === dayIndex + 1
            );
            
            const description = transaction ? transaction.description : '';
            
            // Se não há descrição, retorna apenas a categoria e valor
            if (!description) {
              return `${category}: ${formattedValue}`;
            }
            
            // Se há descrição, adiciona separador para melhor formatação
            return `${description} - ${category}: ${formattedValue}`;
          }
        }
      }
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  return <Line data={data} options={lineOptions} />;
};

export const CategoryPieChart: React.FC = () => {
  const { getCurrentMonthTransactions } = useFinance();
  const { formatCurrency } = useAppSettings();
  
  const expenses = getCurrentMonthTransactions().filter(t => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};
  
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#6366f1', '#34d399', '#f97316', '#ef4444', 
          '#a78bfa', '#ec4899', '#9ca3af', '#fbbf24'
        ],
        borderColor: '#1f2937',
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    ...chartOptions,
    scales: undefined,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const formattedValue = formatCurrency(value);
            return `${context.label}: ${formattedValue}`;
          }
        }
      }
    }
  };

  return <Pie data={data} options={pieOptions} />;
};

export const MonthlyComparisonChart: React.FC = () => {
  const { transactions, selectedYear, selectedMonth } = useFinance();
  const { formatCurrency } = useAppSettings();
  
  const currentMonthExpenses = transactions.filter(t => 
    t.type === 'expense' &&
    t.date.getFullYear() === selectedYear && 
    t.date.getMonth() === selectedMonth
  );
  
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  
  const prevMonthExpenses = transactions.filter(t => 
    t.type === 'expense' &&
    t.date.getFullYear() === prevYear && 
    t.date.getMonth() === prevMonth
  );

  const categories = [...new Set([
    ...currentMonthExpenses.map(t => t.category),
    ...prevMonthExpenses.map(t => t.category)
  ])];

  const currentData = categories.map(cat => 
    currentMonthExpenses.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
  );
  
  const prevData = categories.map(cat => 
    prevMonthExpenses.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0)
  );

  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Mês Anterior',
        data: prevData,
        backgroundColor: 'rgba(107, 114, 128, 0.5)',
        borderRadius: 4,
      },
      {
        label: 'Mês Atual',
        data: currentData,
        backgroundColor: '#6366f1',
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const formattedValue = formatCurrency(value);
            return `${context.dataset.label}: ${formattedValue}`;
          }
        }
      }
    },
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        ticks: {
          ...chartOptions.scales.y.ticks,
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  return <Bar data={data} options={barOptions} />;
};
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

export const ExpenseLineChart: React.FC = () => {
  const { getCurrentMonthTransactions, selectedYear, selectedMonth } = useFinance();
  
  const transactions = getCurrentMonthTransactions().filter(t => t.type === 'expense');
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  
  const dailyExpenses = Array(daysInMonth).fill(0);
  transactions.forEach(t => {
    const day = t.date.getDate() - 1;
    dailyExpenses[day] += t.amount;
  });

  const data = {
    labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Despesas Diárias',
        data: dailyExpenses,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return <Line data={data} options={chartOptions} />;
};

export const CategoryPieChart: React.FC = () => {
  const { getCurrentMonthTransactions } = useFinance();
  
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
  };

  return <Pie data={data} options={pieOptions} />;
};

export const MonthlyComparisonChart: React.FC = () => {
  const { transactions, selectedYear, selectedMonth } = useFinance();
  
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

  return <Bar data={data} options={chartOptions} />;
};
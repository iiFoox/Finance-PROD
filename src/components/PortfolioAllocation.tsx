import React from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import CategoryIcon from './CategoryIcons';
import PixelCategoryIcon from './PixelCategoryIcons';

interface Investment {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  currentValue: number;
  category: 'Criptoativos' | 'Renda Fixa' | 'Fundo de Investimento' | 'Ações' | 'Tesouro Direto' | 'Fundos de Índice (ETFs)' | 'Fundos Imobiliários' | 'Bens' | 'Outros';
  profit: number;
  profitPercentage: number;
}

interface PortfolioAllocationProps {
  investments: Investment[];
  hideBalances?: boolean;
}

const INVESTMENT_CATEGORIES = {
  'Criptoativos': { color: '#3B82F6', label: 'Criptoativos' },
  'Renda Fixa': { color: '#10B981', label: 'Renda Fixa' },
  'Fundo de Investimento': { color: '#8B5CF6', label: 'Fundo de Investimento' },
  'Ações': { color: '#F59E0B', label: 'Ações' },
  'Tesouro Direto': { color: '#EF4444', label: 'Tesouro Direto' },
  'Fundos de Índice (ETFs)': { color: '#EC4899', label: 'Fundos de Índice (ETFs)' },
  'Fundos Imobiliários': { color: '#6B7280', label: 'Fundos Imobiliários' },
  'Bens': { color: '#F97316', label: 'Bens' },
  'Outros': { color: '#374151', label: 'Outros' }
};

// Paleta de cores para ativos (até 20 cores únicas)
const ASSET_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#6B7280', '#F97316', '#374151',
  '#6366F1', '#22D3EE', '#F43F5E', '#A3E635', '#FBBF24', '#E879F9', '#14B8A6', '#F87171', '#A21CAF', '#FDE68A', '#4ADE80'
];

const PortfolioAllocation: React.FC<PortfolioAllocationProps> = ({ 
  investments, 
  hideBalances = false 
}) => {
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);

  // Preparar dados para o gráfico - por moedas individuais
  const chartData = investments.map((investment, index) => ({
    name: investment.name,
    symbol: investment.symbol,
    value: investment.currentValue,
    percentage: (investment.currentValue / totalValue) * 100,
    profit: investment.profit,
    profitPercentage: investment.profitPercentage,
    category: investment.category,
    color: ASSET_COLORS[index % ASSET_COLORS.length]
  })).sort((a, b) => b.value - a.value);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Criar SVG do gráfico de pizza
  const createPieChart = () => {
    const size = 200;
    const center = size / 2;
    const radius = 80;
    
    let currentAngle = 0;
    
    return chartData.map((slice, index) => {
      const angle = (slice.percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      currentAngle += angle;
      
      // Converter ângulos para radianos
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      // Calcular pontos do arco
      const x1 = center + radius * Math.cos(startAngleRad);
      const y1 = center + radius * Math.sin(startAngleRad);
      const x2 = center + radius * Math.cos(endAngleRad);
      const y2 = center + radius * Math.sin(endAngleRad);
      
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');
      
      return (
        <path
          key={index}
          d={pathData}
          fill={slice.color}
          className="hover:opacity-80 transition-opacity cursor-pointer"
        />
      );
    });
  };

  if (investments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Distribuição por Ativos
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum investimento encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <PieChart className="w-5 h-5" />
        Distribuição por Ativos
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza */}
        <div className="flex justify-center">
          <svg width="200" height="200" className="drop-shadow-sm">
            {createPieChart()}
          </svg>
        </div>
        
        {/* Lista de Ativos */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {chartData.map((slice) => (
            <div key={slice.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PixelCategoryIcon 
                  category={slice.category} 
                  type="investment" 
                  size={16} 
                  className="flex-shrink-0"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">
                    {slice.name} ({slice.symbol})
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {INVESTMENT_CATEGORIES[slice.category as keyof typeof INVESTMENT_CATEGORIES]?.label}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800 dark:text-white">
                  {hideBalances ? '•••••' : formatCurrency(slice.value)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {slice.percentage.toFixed(1)}%
                </div>
                <div className={`text-xs font-medium ${slice.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {hideBalances ? '•••••' : formatPercentage(slice.profitPercentage)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Resumo dos Maiores Ativos */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2 justify-center">
          <BarChart3 className="w-4 h-4" />
          Top 3 Maiores Posições
        </h4>
        <div className="flex flex-col items-center space-y-2">
          {chartData.slice(0, 3).map((asset, index) => (
            <div key={asset.symbol} className="flex items-center justify-between w-full max-w-xs p-2 bg-gray-50 dark:bg-slate-700 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">#{index + 1}</div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{asset.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{asset.percentage.toFixed(1)}% do portfólio</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800 dark:text-white">{hideBalances ? '•••••' : formatCurrency(asset.value)}</div>
                <div className={`text-xs font-medium ${asset.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{hideBalances ? '•••••' : formatPercentage(asset.profitPercentage)}</div>
              </div>
            </div>
          ))}
          {chartData.length > 3 && (
            <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">+ {chartData.length - 3} outros ativos</div>
          )}
        </div>
      </div>
    </div>
  );
};

// NOVO COMPONENTE: Gráfico de Pizza por Categoria
export const PortfolioCategoryPieChart: React.FC<{ investments: Investment[]; hideBalances?: boolean }> = ({ investments, hideBalances = false }) => {
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  // Agrupar por categoria
  const grouped = investments.reduce((acc, inv) => {
    if (!acc[inv.category]) acc[inv.category] = 0;
    acc[inv.category] += inv.currentValue;
    return acc;
  }, {} as Record<string, number>);
  const categories = Object.keys(grouped);
  const chartData = categories.map((cat, i) => ({
    category: cat,
    value: grouped[cat],
    percentage: (grouped[cat] / totalValue) * 100,
    color: INVESTMENT_CATEGORIES[cat as keyof typeof INVESTMENT_CATEGORIES]?.color || ASSET_COLORS[i % ASSET_COLORS.length],
    label: INVESTMENT_CATEGORIES[cat as keyof typeof INVESTMENT_CATEGORIES]?.label || cat
  }));
  // Pie chart SVG
  const size = 200;
  const center = size / 2;
  const radius = 80;
  let currentAngle = 0;
  const createPieChart = () => chartData.map((slice, idx) => {
    const angle = (slice.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);
    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    return <path key={idx} d={pathData} fill={slice.color} className="hover:opacity-80 transition-opacity cursor-pointer" />;
  });
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' }).format(value);
  if (investments.length === 0) return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5" /> Distribuição por Categoria
      </h3>
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum investimento encontrado</div>
    </div>
  );
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <PieChart className="w-5 h-5" /> Distribuição por Categoria
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex justify-center">
          <svg width="200" height="200" className="drop-shadow-sm">{createPieChart()}</svg>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {chartData.map((slice) => (
            <div key={slice.category} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PixelCategoryIcon 
                  category={slice.category} 
                  type="investment" 
                  size={16} 
                  className="flex-shrink-0"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{slice.label}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800 dark:text-white">{hideBalances ? '•••••' : formatCurrency(slice.value)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{slice.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top 3 Categorias */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2 justify-center">
          <BarChart3 className="w-4 h-4" />
          Top 3 Maiores Categorias
        </h4>
        <div className="flex flex-col items-center space-y-2">
          {chartData.slice(0, 3).map((category, index) => (
            <div key={category.category} className="flex items-center justify-between w-full max-w-xs p-2 bg-gray-50 dark:bg-slate-700 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">#{index + 1}</div>
                <PixelCategoryIcon 
                  category={category.category} 
                  type="investment" 
                  size={14} 
                  className="flex-shrink-0"
                />
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-white">{category.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{category.percentage.toFixed(1)}% do portfólio</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800 dark:text-white">{hideBalances ? '•••••' : formatCurrency(category.value)}</div>
              </div>
            </div>
          ))}
          {chartData.length > 3 && (
            <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">+ {chartData.length - 3} outras categorias</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioAllocation; 
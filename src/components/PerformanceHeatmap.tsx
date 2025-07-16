import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Grid3X3, 
  Calendar,
  ArrowUpDown,
  Info
} from 'lucide-react';

interface Investment {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  currentValue: number;
  category: string;
  profit: number;
  profitPercentage: number;
}

interface PerformanceHeatmapProps {
  investments: Investment[];
  hideBalances?: boolean;
}

const PerformanceHeatmap: React.FC<PerformanceHeatmapProps> = ({ 
  investments, 
  hideBalances = false 
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'performance' | 'value' | 'name'>('performance');

  // Função para obter cor baseada na performance
  const getPerformanceColor = (performance: number) => {
    if (performance >= 20) return '#059669'; // Verde escuro - +20% ou mais
    if (performance >= 10) return '#10B981'; // Verde médio - +10% a +20%
    if (performance >= 0) return '#34D399'; // Verde claro - 0% a +10%
    if (performance >= -10) return '#F59E0B'; // Laranja - -10% a 0%
    if (performance >= -20) return '#F97316'; // Laranja escuro - -20% a -10%
    return '#DC2626'; // Vermelho - -20% ou menos
  };

  // Calcular dados para o heatmap
  const heatmapData = useMemo(() => {
    const sorted = [...investments].sort((a, b) => {
      switch (sortBy) {
        case 'performance':
          return b.profitPercentage - a.profitPercentage;
        case 'value':
          return b.currentValue - a.currentValue;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted.map(inv => ({
      ...inv,
      size: Math.sqrt(inv.currentValue) * 2, // Tamanho proporcional ao valor
      color: getPerformanceColor(inv.profitPercentage)
    }));
  }, [investments, sortBy]);

  // Função para obter intensidade da cor
  const getColorIntensity = (performance: number) => {
    const absPerformance = Math.abs(performance);
    if (absPerformance >= 50) return 1.0;
    if (absPerformance >= 30) return 0.95;
    if (absPerformance >= 20) return 0.85;
    if (absPerformance >= 10) return 0.75;
    if (absPerformance >= 5) return 0.65;
    if (absPerformance >= 1) return 0.55;
    return 0.45;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (investments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Grid3X3 className="w-5 h-5" />
          Heatmap de Performance
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Nenhum investimento encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Grid3X3 className="w-5 h-5" />
          Heatmap de Performance
        </h3>
        
        <div className="flex items-center gap-2">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'performance' | 'value' | 'name')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300"
            aria-label="Ordenar por"
          >
            <option value="performance">Performance</option>
            <option value="value">Valor</option>
            <option value="name">Nome</option>
          </select>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            aria-label="Alternar visualização"
          >
            {viewMode === 'grid' ? <BarChart3 className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Legenda de Performance</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border">
            <div 
              className="w-4 h-4 rounded shadow-sm" 
              style={{ backgroundColor: '#059669' }}
            ></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Excelente (+20%)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border">
            <div 
              className="w-4 h-4 rounded shadow-sm" 
              style={{ backgroundColor: '#10B981' }}
            ></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Muito Bom (+10% a +20%)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border">
            <div 
              className="w-4 h-4 rounded shadow-sm" 
              style={{ backgroundColor: '#34D399' }}
            ></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Positivo (0% a +10%)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border">
            <div 
              className="w-4 h-4 rounded shadow-sm" 
              style={{ backgroundColor: '#F59E0B' }}
            ></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Neutro (-10% a 0%)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border">
            <div 
              className="w-4 h-4 rounded shadow-sm" 
              style={{ backgroundColor: '#F97316' }}
            ></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Ruim (-20% a -10%)</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border">
            <div 
              className="w-4 h-4 rounded shadow-sm" 
              style={{ backgroundColor: '#DC2626' }}
            ></div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Muito Ruim (-20%)</span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>🎨</span>
            <span>A intensidade da cor aumenta com valores extremos de performance</span>
          </div>
        </div>
      </div>

      {/* Visualização em Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {heatmapData.map((item, index) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-lg p-3 flex flex-col justify-center items-center text-center hover:scale-105 transition-transform cursor-pointer"
              style={{
                backgroundColor: item.color,
                opacity: getColorIntensity(item.profitPercentage)
              }}
              title={`${item.name}: ${formatPercentage(item.profitPercentage)}`}
            >
              <div className="text-xs font-medium text-gray-800 dark:text-white mb-1 line-clamp-2">
                {item.symbol}
              </div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                {formatPercentage(item.profitPercentage)}
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-200 mt-1">
                {hideBalances ? '•••' : formatCurrency(item.currentValue).replace('US$', '$')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Visualização em Lista */
        <div className="space-y-3">
          {heatmapData.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {item.symbol} • {item.category}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold text-gray-800 dark:text-white">
                  {hideBalances ? '•••••' : formatCurrency(item.currentValue)}
                </div>
                <div className={`text-sm font-medium ${
                  item.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.profitPercentage >= 0 ? (
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 inline mr-1" />
                  )}
                  {formatPercentage(item.profitPercentage)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estatísticas Resumidas */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Melhor Performance</div>
            <div className="text-sm font-semibold text-green-600">
              {heatmapData.length > 0 ? formatPercentage(Math.max(...heatmapData.map(d => d.profitPercentage))) : '0%'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Pior Performance</div>
            <div className="text-sm font-semibold text-red-600">
              {heatmapData.length > 0 ? formatPercentage(Math.min(...heatmapData.map(d => d.profitPercentage))) : '0%'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Média</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white">
              {heatmapData.length > 0 ? formatPercentage(heatmapData.reduce((sum, d) => sum + d.profitPercentage, 0) / heatmapData.length) : '0%'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">Positivos</div>
            <div className="text-sm font-semibold text-blue-600">
              {heatmapData.filter(d => d.profitPercentage > 0).length}/{heatmapData.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceHeatmap; 
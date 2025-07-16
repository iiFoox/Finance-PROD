import React, { useState, useMemo } from 'react';
import { LineChart, TrendingUp, TrendingDown, Calendar, Eye, EyeOff } from 'lucide-react';

interface TimelineData {
  date: string;
  value: number;
  profit: number;
  profitPercentage: number;
}

interface TimelineChartProps {
  data: TimelineData[];
  hideBalances?: boolean;
  height?: number;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ 
  data, 
  hideBalances = false, 
  height = 300 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Filtrar dados por período
  const filteredData = useMemo(() => {
    if (selectedPeriod === 'all') return data;
    
    const now = new Date();
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };
    
    const days = periodDays[selectedPeriod as keyof typeof periodDays];
    if (!days) return data;
    
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return data.filter(item => new Date(item.date) >= cutoffDate);
  }, [data, selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Calcular estatísticas do período
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const firstValue = filteredData[0].value;
    const lastValue = filteredData[filteredData.length - 1].value;
    const change = lastValue - firstValue;
    const changePercentage = (change / firstValue) * 100;
    
    const maxValue = Math.max(...filteredData.map(d => d.value));
    const minValue = Math.min(...filteredData.map(d => d.value));
    
    return {
      change,
      changePercentage,
      maxValue,
      minValue,
      currentValue: lastValue,
      isPositive: change >= 0
    };
  }, [filteredData]);

  // Criar pontos do gráfico SVG
  const createPath = () => {
    if (filteredData.length === 0) return '';
    
    const maxValue = Math.max(...filteredData.map(d => d.value));
    const minValue = Math.min(...filteredData.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    const width = 400;
    const graphHeight = height - 40;
    
    const points = filteredData.map((item, index) => {
      const x = (index / (filteredData.length - 1)) * width;
      const y = graphHeight - ((item.value - minValue) / range) * graphHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Criar área sob a curva
  const createAreaPath = () => {
    if (filteredData.length === 0) return '';
    
    const maxValue = Math.max(...filteredData.map(d => d.value));
    const minValue = Math.min(...filteredData.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    const width = 400;
    const graphHeight = height - 40;
    
    const points = filteredData.map((item, index) => {
      const x = (index / (filteredData.length - 1)) * width;
      const y = graphHeight - ((item.value - minValue) / range) * graphHeight;
      return `${x},${y}`;
    });
    
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const lastX = lastPoint.split(',')[0];
    const firstX = firstPoint.split(',')[0];
    
    return `M ${firstX},${graphHeight} L ${points.join(' L ')} L ${lastX},${graphHeight} Z`;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Evolução do Portfólio
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Dados históricos não disponíveis
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Evolução do Portfólio
        </h3>
        
        <div className="flex items-center gap-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300"
            aria-label="Selecionar período"
          >
            <option value="all">Todo o período</option>
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
            <option value="90d">90 dias</option>
            <option value="1y">1 ano</option>
          </select>
        </div>
      </div>

      {/* Estatísticas do período */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Valor Atual</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white">
              {hideBalances ? '•••••' : formatCurrency(stats.currentValue)}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Variação</div>
            <div className={`text-sm font-semibold ${stats.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {hideBalances ? '•••••' : formatCurrency(stats.change)}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Variação %</div>
            <div className={`text-sm font-semibold ${stats.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(stats.changePercentage)}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Máximo</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-white">
              {hideBalances ? '•••••' : formatCurrency(stats.maxValue)}
            </div>
          </div>
        </div>
      )}

      {/* Gráfico SVG */}
      <div className="relative">
        <svg width="100%" height={height} viewBox={`0 0 400 ${height}`} className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="400" height={height - 40} fill="url(#grid)" />
          
          {/* Área sob a curva */}
          {filteredData.length > 0 && (
            <path
              d={createAreaPath()}
              fill={stats?.isPositive ? '#10b981' : '#ef4444'}
              opacity="0.1"
            />
          )}
          
          {/* Linha do gráfico */}
          {filteredData.length > 0 && (
            <path
              d={createPath()}
              fill="none"
              stroke={stats?.isPositive ? '#10b981' : '#ef4444'}
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          )}
          
          {/* Pontos no gráfico */}
          {filteredData.map((item, index) => {
            const maxValue = Math.max(...filteredData.map(d => d.value));
            const minValue = Math.min(...filteredData.map(d => d.value));
            const range = maxValue - minValue || 1;
            
            const x = (index / (filteredData.length - 1)) * 400;
            const y = (height - 40) - ((item.value - minValue) / range) * (height - 40);
            
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill={stats?.isPositive ? '#10b981' : '#ef4444'}
                  className="opacity-80"
                />
                {/* Tooltip on hover */}
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill="transparent"
                  className="hover:fill-gray-200 hover:opacity-20 cursor-pointer"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {filteredData.length > 0 ? new Date(filteredData[0].date).toLocaleDateString('pt-BR') : ''}
        </span>
        <span className="flex items-center gap-1">
          {stats?.isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          Evolução do portfólio
        </span>
        <span>
          {filteredData.length > 0 ? new Date(filteredData[filteredData.length - 1].date).toLocaleDateString('pt-BR') : ''}
        </span>
      </div>
    </div>
  );
};

export default TimelineChart; 
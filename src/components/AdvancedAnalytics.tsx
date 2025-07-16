import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Activity, 
  Target, 
  Award,
  Filter,
  Eye,
  EyeOff,
  Percent,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Investment {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  currentValue: number;
  category: 'Criptoativos' | 'Renda Fixa' | 'Fundo de Investimento' | 'Ações' | 'Tesouro Direto' | 'Fundos de Índice (ETFs)' | 'Fundos Imobiliários' | 'Bens' | 'Outros';
  profit: number;
  profitPercentage: number;
  purchaseDate?: string;
}

interface AdvancedAnalyticsProps {
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

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ investments, hideBalances = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('profit');
  const [showRisks, setShowRisks] = useState(false);

  // Filtrar investimentos
  const filteredInvestments = useMemo(() => {
    let filtered = investments;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(inv => inv.category === selectedCategory);
    }
    
    return filtered;
  }, [investments, selectedCategory]);

  // Calcular métricas
  const metrics = useMemo(() => {
    const totalInvested = filteredInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = filteredInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalProfit = totalCurrentValue - totalInvested;
    const totalProfitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    const profitableInvestments = filteredInvestments.filter(inv => inv.profit > 0);
    const unprofitableInvestments = filteredInvestments.filter(inv => inv.profit < 0);

    return {
      totalInvested,
      totalCurrentValue,
      totalProfit,
      totalProfitPercentage,
      profitableCount: profitableInvestments.length,
      unprofitableCount: unprofitableInvestments.length,
      averageProfit: filteredInvestments.length > 0 ? totalProfit / filteredInvestments.length : 0,
      bestPerformer: filteredInvestments.reduce((best, inv) => 
        inv.profitPercentage > best.profitPercentage ? inv : best, 
        filteredInvestments[0] || null
      ),
      worstPerformer: filteredInvestments.reduce((worst, inv) => 
        inv.profitPercentage < worst.profitPercentage ? inv : worst, 
        filteredInvestments[0] || null
      )
    };
  }, [filteredInvestments]);

  // Dados por categoria
  const categoryData = useMemo(() => {
    const grouped = filteredInvestments.reduce((acc, inv) => {
      if (!acc[inv.category]) {
        acc[inv.category] = {
          name: inv.category,
          value: 0,
          originalValue: 0,
          profit: 0,
          count: 0,
          color: INVESTMENT_CATEGORIES[inv.category]?.color || '#374151'
        };
      }
      acc[inv.category].value += inv.currentValue;
      acc[inv.category].originalValue += inv.amount;
      acc[inv.category].profit += inv.profit;
      acc[inv.category].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped).sort((a: any, b: any) => b.value - a.value);
  }, [filteredInvestments]);

  // Dados de performance
  const performanceData = useMemo(() => {
    const sorted = [...filteredInvestments].sort((a, b) => {
      switch (sortBy) {
        case 'profit':
          return b.profit - a.profit;
        case 'profitPercentage':
          return b.profitPercentage - a.profitPercentage;
        case 'value':
          return b.currentValue - a.currentValue;
        default:
          return 0;
      }
    });
    return sorted.slice(0, 10);
  }, [filteredInvestments, sortBy]);

  // Análise de riscos
  const riskAnalysis = useMemo(() => {
    if (categoryData.length === 0 || filteredInvestments.length === 0) {
      return [];
    }

    const categoryConcentration = categoryData.reduce((max: any, cat: any) => {
      const percentage = metrics.totalCurrentValue > 0 ? (cat.value / metrics.totalCurrentValue) * 100 : 0;
      return percentage > max.percentage ? { name: cat.name, percentage } : max;
    }, { name: '', percentage: 0 });

    const volatileAssets = filteredInvestments.filter(inv => 
      inv.category === 'Criptoativos' || inv.category === 'Ações'
    );

    const risks = [];
    if (categoryConcentration.percentage > 50) {
      risks.push(`Alta concentração em ${categoryConcentration.name} (${categoryConcentration.percentage.toFixed(1)}%)`);
    }
    if (filteredInvestments.length > 0 && volatileAssets.length / filteredInvestments.length > 0.7) {
      risks.push('Portfólio com alta exposição a ativos voláteis');
    }
    if (filteredInvestments.length < 5) {
      risks.push('Baixa diversificação - considere adicionar mais ativos');
    }

    return risks;
  }, [categoryData, metrics.totalCurrentValue, filteredInvestments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Criar gráfico de barras horizontais
  const createBarChart = (data: any[], maxValue: number) => {
    if (data.length === 0 || maxValue === 0) {
      return <div className="text-center py-4 text-gray-500 dark:text-gray-400">Nenhum dado disponível</div>;
    }

    return data.map((item, index) => {
      const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
      return (
        <div key={index} className="flex items-center gap-3 mb-3">
          <div className="w-20 text-xs text-gray-600 dark:text-gray-400 text-right">
            {item.name}
          </div>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${percentage}%`,
                backgroundColor: item.color
              }}
            />
          </div>
          <div className="w-24 text-xs text-gray-800 dark:text-white text-right">
            {hideBalances ? '•••••' : formatCurrency(item.value)}
          </div>
        </div>
      );
    });
  };

  if (investments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          Adicione investimentos para ver os gráficos e análises.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros:</span>
          </div>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300"
            aria-label="Selecionar categoria"
          >
            <option value="all">Todas as Categorias</option>
            {Object.entries(INVESTMENT_CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300"
            aria-label="Ordenar por"
          >
            <option value="profit">Lucro Absoluto</option>
            <option value="profitPercentage">Rentabilidade %</option>
            <option value="value">Valor Atual</option>
          </select>

          <button
            onClick={() => setShowRisks(!showRisks)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showRisks 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Análise de Riscos
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {hideBalances ? '•••••' : formatCurrency(metrics.totalCurrentValue)}
          </div>
          <div className={`text-sm ${metrics.totalProfitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(metrics.totalProfitPercentage)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lucro/Prejuízo</span>
          </div>
          <div className={`text-2xl font-bold ${metrics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {hideBalances ? '•••••' : formatCurrency(metrics.totalProfit)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {metrics.profitableCount} lucrativos, {metrics.unprofitableCount} em prejuízo
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Diversificação</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {categoryData.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Categorias diferentes
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Melhor Ativo</span>
          </div>
          <div className="text-sm font-bold text-gray-800 dark:text-white">
            {metrics.bestPerformer?.name || 'N/A'}
          </div>
          <div className="text-sm text-green-600">
            {metrics.bestPerformer ? formatPercentage(metrics.bestPerformer.profitPercentage) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Análise de Riscos */}
      {showRisks && riskAnalysis.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 shadow-lg border border-orange-200 dark:border-orange-800">
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Análise de Riscos
          </h3>
          <div className="space-y-2">
            {riskAnalysis.map((risk, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-orange-800 dark:text-orange-200">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Categoria - Gráfico de Barras */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Distribuição por Categoria
          </h3>
          <div className="space-y-4">
            {createBarChart(categoryData, categoryData.length > 0 ? Math.max(...categoryData.map(d => d.value)) : 0)}
          </div>
        </div>

        {/* Performance dos Ativos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Top 10 Ativos ({sortBy === 'profit' ? 'Lucro' : sortBy === 'profitPercentage' ? 'Rentabilidade' : 'Valor'})
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {performanceData.map((asset, index) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-300">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">{asset.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{asset.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {hideBalances ? '•••••' : (
                      sortBy === 'profit' ? formatCurrency(asset.profit) :
                      sortBy === 'profitPercentage' ? formatPercentage(asset.profitPercentage) :
                      formatCurrency(asset.currentValue)
                    )}
                  </div>
                  <div className={`text-sm ${asset.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(asset.profitPercentage)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <Percent className="w-5 h-5" />
          Resumo Estatístico
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Rentabilidade</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Melhor ativo:</span>
                <span className={`text-sm font-medium ${metrics.bestPerformer?.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.bestPerformer ? formatPercentage(metrics.bestPerformer.profitPercentage) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pior ativo:</span>
                <span className={`text-sm font-medium ${metrics.worstPerformer?.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.worstPerformer ? formatPercentage(metrics.worstPerformer.profitPercentage) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Média:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {formatPercentage(metrics.totalProfitPercentage)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Diversificação</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total de ativos:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {filteredInvestments.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Categorias:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {categoryData.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Maior concentração:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {categoryData.length > 0 ? `${((categoryData[0].value / metrics.totalCurrentValue) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ativos lucrativos:</span>
                <span className="text-sm font-medium text-green-600">
                  {metrics.profitableCount} ({((metrics.profitableCount / filteredInvestments.length) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ativos em prejuízo:</span>
                <span className="text-sm font-medium text-red-600">
                  {metrics.unprofitableCount} ({((metrics.unprofitableCount / filteredInvestments.length) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Lucro médio:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {hideBalances ? '•••••' : formatCurrency(metrics.averageProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics; 
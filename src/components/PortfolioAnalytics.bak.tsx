import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, BarChart as BarChartIcon, Activity } from 'lucide-react';

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

interface PortfolioAnalyticsProps {
  investments: Investment[];
  hideBalances?: boolean;
}

const COLORS = {
  'Criptoativos': '#3B82F6',
  'Renda Fixa': '#10B981',
  'Fundo de Investimento': '#8B5CF6',
  'Ações': '#F59E0B',
  'Tesouro Direto': '#EF4444',
  'Fundos de Índice (ETFs)': '#EC4899',
  'Fundos Imobiliários': '#6B7280',
  'Bens': '#F97316',
  'Outros': '#374151'
};

const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({ investments, hideBalances = false }) => {
  // Cálculos gerais do portfólio
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfit = totalCurrentValue - totalInvested;
  const totalProfitPercentage = (totalProfit / totalInvested) * 100;

  // Dados por categoria
  const categoryData = investments.reduce((acc, inv) => {
    if (!acc[inv.category]) {
      acc[inv.category] = {
        name: inv.category,
        value: 0,
        originalValue: 0,
        profit: 0
      };
    }
    acc[inv.category].value += inv.currentValue;
    acc[inv.category].originalValue += inv.amount;
    acc[inv.category].profit += inv.profit;
    return acc;
  }, {} as Record<string, { name: string; value: number; originalValue: number; profit: number; }>);

  const categoryChartData = Object.values(categoryData).sort((a, b) => b.value - a.value);

  // Dados de rentabilidade por categoria
  const profitabilityData = Object.values(categoryData).map(cat => ({
    name: cat.name,
    profitability: ((cat.value - cat.originalValue) / cat.originalValue) * 100
  })).sort((a, b) => b.profitability - a.profitability);

  // Top 5 ativos mais rentáveis
  const topPerformers = [...investments]
    .sort((a, b) => b.profitPercentage - a.profitPercentage)
    .slice(0, 5);

  // Formatadores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hideBalances ? '****' : formatCurrency(totalInvested)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor total aplicado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hideBalances ? '****' : formatCurrency(totalCurrentValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor atual do portfólio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro/Prejuízo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {hideBalances ? '****' : formatCurrency(totalProfit)}
            </div>
            <p className={`text-xs mt-1 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(totalProfitPercentage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Diversificação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(categoryData).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Categorias diferentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => hideBalances ? '****' : formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rentabilidade por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5" />
              Rentabilidade por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitabilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                  />
                  <Bar
                    dataKey="profitability"
                    fill="#3B82F6"
                  >
                    {profitabilityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.profitability >= 0 ? '#10B981' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Top 5 Ativos Mais Rentáveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((asset, index) => (
              <div key={asset.id} className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">{asset.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${asset.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {hideBalances ? '****' : formatCurrency(asset.profit)}
                  </p>
                  <p className={`text-sm ${asset.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(asset.profitPercentage)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights do Portfólio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Insights do Portfólio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Diversificação */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`p-2 rounded-full ${
                Object.keys(categoryData).length >= 4 ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                <PieChartIcon className="w-4 h-4" />
              </div>
              <span>
                {Object.keys(categoryData).length >= 4
                  ? "Boa diversificação! Seu portfólio está distribuído em múltiplas categorias."
                  : "Considere diversificar mais seu portfólio em diferentes categorias de investimento."}
              </span>
            </div>

            {/* Rentabilidade */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`p-2 rounded-full ${
                totalProfitPercentage >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {totalProfitPercentage >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
              <span>
                {totalProfitPercentage >= 0
                  ? `Seu portfólio está performando bem com ${formatPercentage(totalProfitPercentage)} de retorno.`
                  : `Seu portfólio está em ${formatPercentage(totalProfitPercentage)}. Considere revisar sua estratégia.`}
              </span>
            </div>

            {/* Concentração */}
            {categoryChartData.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div className={`p-2 rounded-full ${
                  (categoryChartData[0].value / totalCurrentValue) <= 0.5
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <DollarSign className="w-4 h-4" />
                </div>
                <span>
                  {(categoryChartData[0].value / totalCurrentValue) <= 0.5
                    ? "Boa distribuição! Nenhuma categoria representa mais de 50% do portfólio."
                    : `Atenção: ${categoryChartData[0].name} representa ${((categoryChartData[0].value / totalCurrentValue) * 100).toFixed(1)}% do portfólio.`}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioAnalytics; 
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Wallet,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Bitcoin,
  Activity
} from 'lucide-react';
import SimpleToast from '../components/SimpleToast';
import CryptoChart from '../components/CryptoChart';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

interface Investment {
  id: string;
  cryptoId: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
  purchaseDate: string;
}

const InvestmentsPage: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hideBalances, setHideBalances] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'market_cap'>('market_cap');
  const [filterFavorites, setFilterFavorites] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message?: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Buscar dados das criptomoedas da CoinGecko API
  const fetchCryptoData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h'
      );
      
      if (!response.ok) {
        throw new Error('Falha ao buscar dados das criptomoedas');
      }
      
      const data = await response.json();
      setCryptoData(data);
      
      // Atualizar preços dos investimentos existentes
      setInvestments(prev => prev.map(investment => {
        const crypto = data.find((c: CryptoData) => c.id === investment.cryptoId);
        return crypto ? { ...investment, currentPrice: crypto.current_price } : investment;
      }));
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setToast({
        show: true,
        type: 'error',
        title: 'Erro ao carregar dados',
        message: 'Não foi possível carregar os dados das criptomoedas. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Adicionar investimento
  const addInvestment = () => {
    if (!selectedCrypto || !investmentAmount || parseFloat(investmentAmount) <= 0) {
      setToast({
        show: true,
        type: 'error',
        title: 'Dados inválidos',
        message: 'Por favor, selecione uma criptomoeda e insira um valor válido.'
      });
      return;
    }

    const newInvestment: Investment = {
      id: Date.now().toString(),
      cryptoId: selectedCrypto.id,
      symbol: selectedCrypto.symbol.toUpperCase(),
      name: selectedCrypto.name,
      amount: parseFloat(investmentAmount),
      buyPrice: selectedCrypto.current_price,
      currentPrice: selectedCrypto.current_price,
      purchaseDate: new Date().toISOString()
    };

    setInvestments(prev => [...prev, newInvestment]);
    setShowAddModal(false);
    setSelectedCrypto(null);
    setInvestmentAmount('');
    
    setToast({
      show: true,
      type: 'success',
      title: 'Investimento adicionado!',
      message: `${newInvestment.amount} USD em ${newInvestment.name} foi adicionado ao seu portfólio.`
    });

    // Salvar no localStorage
    const updatedInvestments = [...investments, newInvestment];
    localStorage.setItem('cryptoInvestments', JSON.stringify(updatedInvestments));
  };

  // Remover investimento
  const removeInvestment = (id: string) => {
    const investment = investments.find(inv => inv.id === id);
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    
    if (investment) {
      setToast({
        show: true,
        type: 'success',
        title: 'Investimento removido',
        message: `${investment.name} foi removido do seu portfólio.`
      });
    }

    // Atualizar localStorage
    const updatedInvestments = investments.filter(inv => inv.id !== id);
    localStorage.setItem('cryptoInvestments', JSON.stringify(updatedInvestments));
  };

  // Toggle favoritos
  const toggleFavorite = (cryptoId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(cryptoId) 
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId];
      
      localStorage.setItem('cryptoFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Calcular totais do portfólio
  const portfolioStats = investments.reduce((acc, investment) => {
    const currentValue = (investment.amount / investment.buyPrice) * investment.currentPrice;
    const profit = currentValue - investment.amount;
    const profitPercentage = ((currentValue - investment.amount) / investment.amount) * 100;

    return {
      totalInvested: acc.totalInvested + investment.amount,
      currentValue: acc.currentValue + currentValue,
      totalProfit: acc.totalProfit + profit,
      profitPercentage: acc.profitPercentage + profitPercentage
    };
  }, { totalInvested: 0, currentValue: 0, totalProfit: 0, profitPercentage: 0 });

  // Filtrar e ordenar criptomoedas
  const filteredCryptos = cryptoData
    .filter(crypto => filterFavorites ? favorites.includes(crypto.id) : true)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.current_price - a.current_price;
        case 'change':
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        default:
          return b.market_cap - a.market_cap;
      }
    });

  // Carregar dados salvos
  useEffect(() => {
    const savedInvestments = localStorage.getItem('cryptoInvestments');
    const savedFavorites = localStorage.getItem('cryptoFavorites');
    
    if (savedInvestments) {
      try {
        setInvestments(JSON.parse(savedInvestments));
      } catch (error) {
        console.error('Erro ao carregar investimentos salvos:', error);
      }
    }
    
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Erro ao carregar favoritos salvos:', error);
      }
    }

    fetchCryptoData();
  }, []);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Bitcoin className="w-8 h-8 text-orange-500" />
          Investimentos
        </h1>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHideBalances(!hideBalances)}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            title={hideBalances ? 'Mostrar saldos' : 'Ocultar saldos'}
          >
            {hideBalances ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={fetchCryptoData}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Investimento
          </button>
        </div>
      </div>

      {/* Resumo do Portfólio */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Investido</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {hideBalances ? '•••••' : formatCurrency(portfolioStats.totalInvested)}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor Atual</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {hideBalances ? '•••••' : formatCurrency(portfolioStats.currentValue)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lucro/Prejuízo</p>
              <p className={`text-2xl font-bold ${portfolioStats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {hideBalances ? '•••••' : formatCurrency(portfolioStats.totalProfit)}
              </p>
            </div>
            {portfolioStats.totalProfit >= 0 ? (
              <TrendingUp className="w-8 h-8 text-green-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-red-500" />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rendimento</p>
              <p className={`text-2xl font-bold ${portfolioStats.profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {hideBalances ? '•••••' : formatPercentage(portfolioStats.profitPercentage / investments.length || 0)}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Meus Investimentos */}
      {investments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-6 h-6" />
            Meu Portfólio
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-gray-600 dark:text-gray-400">Moeda</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-400">Investido</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-400">Preço Compra</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-400">Preço Atual</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-400">Valor Atual</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-400">Lucro/Prejuízo</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => {
                  const currentValue = (investment.amount / investment.buyPrice) * investment.currentPrice;
                  const profit = currentValue - investment.amount;
                  const profitPercentage = ((currentValue - investment.amount) / investment.amount) * 100;
                  
                  return (
                    <tr key={investment.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {investment.symbol}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {investment.name}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-4 text-gray-800 dark:text-white">
                        {hideBalances ? '•••••' : formatCurrency(investment.amount)}
                      </td>
                      <td className="text-right py-4 text-gray-800 dark:text-white">
                        {formatCurrency(investment.buyPrice)}
                      </td>
                      <td className="text-right py-4 text-gray-800 dark:text-white">
                        {formatCurrency(investment.currentPrice)}
                      </td>
                      <td className="text-right py-4 text-gray-800 dark:text-white">
                        {hideBalances ? '•••••' : formatCurrency(currentValue)}
                      </td>
                      <td className={`text-right py-4 ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {hideBalances ? '•••••' : (
                          <div>
                            <div>{formatCurrency(profit)}</div>
                            <div className="text-sm">{formatPercentage(profitPercentage)}</div>
                          </div>
                        )}
                      </td>
                      <td className="text-right py-4">
                        <button
                          onClick={() => removeInvestment(investment.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mercado de Criptomoedas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Mercado de Criptomoedas
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                filterFavorites 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1" />
              Favoritos
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-1 text-sm"
              aria-label="Ordenar por"
            >
              <option value="market_cap">Market Cap</option>
              <option value="price">Preço</option>
              <option value="change">Variação 24h</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando dados...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-gray-600 dark:text-gray-400">Moeda</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-400">Preço</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-400">24h</th>
                  <th className="text-center py-3 text-gray-600 dark:text-gray-400">Gráfico 7D</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-400">Market Cap</th>
                  <th className="text-center py-3 text-gray-600 dark:text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCryptos.slice(0, 50).map((crypto) => (
                  <tr key={crypto.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {crypto.symbol.toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {crypto.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-4 text-gray-800 dark:text-white font-medium">
                      {formatCurrency(crypto.current_price)}
                    </td>
                    <td className={`text-right py-4 ${crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercentage(crypto.price_change_percentage_24h)}
                    </td>
                    <td className="text-center py-4">
                      {crypto.sparkline_in_7d?.price ? (
                        <CryptoChart 
                          data={crypto.sparkline_in_7d.price} 
                          isPositive={crypto.price_change_percentage_24h >= 0}
                        />
                      ) : (
                        <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">-</span>
                        </div>
                      )}
                    </td>
                    <td className="text-right py-4 text-gray-800 dark:text-white">
                      {formatCurrency(crypto.market_cap)}
                    </td>
                    <td className="text-center py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleFavorite(crypto.id)}
                          className={`p-1 rounded ${
                            favorites.includes(crypto.id) 
                              ? 'text-yellow-500' 
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          {favorites.includes(crypto.id) ? (
                            <Star className="w-4 h-4 fill-current" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCrypto(crypto);
                            setShowAddModal(true);
                          }}
                          className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 rounded"
                        >
                          Investir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Adicionar Investimento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Novo Investimento
            </h3>
            
            {selectedCrypto && (
              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {selectedCrypto.name} ({selectedCrypto.symbol.toUpperCase()})
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Preço atual: {formatCurrency(selectedCrypto.current_price)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor do Investimento (USD)
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                placeholder="Ex: 1000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCrypto(null);
                  setInvestmentAmount('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={addInvestment}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <SimpleToast 
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default InvestmentsPage; 
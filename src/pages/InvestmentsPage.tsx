import React, { useState, useEffect, useRef } from 'react';
import { 
  Bitcoin, 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  X, 
  Star, 
  BarChart3,
  PieChart,
  Calendar,
  Percent,
  Activity,
  Search,
  Save,
  Trash2,
  Pencil
} from 'lucide-react';
import SimpleToast from '../components/SimpleToast';
import PortfolioAllocation, { PortfolioCategoryPieChart } from '../components/PortfolioAllocation';
import SparklineChart from '../components/SparklineChart';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import TimelineChart from '../components/TimelineChart';
import PerformanceHeatmap from '../components/PerformanceHeatmap';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { coinGeckoService, CryptoCurrency, RateLimitError } from '../services/coinGeckoService';

// Interfaces
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
  purchaseTime: string;
  category: 'Criptoativos' | 'Renda Fixa' | 'Fundo de Investimento' | 'Ações' | 'Tesouro Direto' | 'Fundos de Índice (ETFs)' | 'Fundos Imobiliários' | 'Bens' | 'Outros';
  targetAllocation?: number;
  customCrypto?: boolean;
  notes?: string;
}

interface ConsolidatedInvestment {
  cryptoId: string;
  symbol: string;
  name: string;
  totalAmount: number;
  totalQuantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  category: Investment['category'];
  investments: Investment[];
}

// Componente para cotações em tempo real
const CryptoQuotesTab: React.FC<{ 
  quotes: CryptoCurrency[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenInvestmentModal: (crypto: CryptoCurrency) => void;
  favorites: string[];
  setFavorites: (favorites: string[]) => void;
}> = ({ 
  quotes, 
  loading, 
  error,
  onRetry,
  onOpenInvestmentModal, 
  favorites = [], 
  setFavorites 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<'market_cap' | 'volume' | 'price' | 'change'>('market_cap');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (!loading && !error) {
      setLastUpdate(new Date());
    }
  }, [loading, error]);

  const filteredQuotes = quotes
    .filter(quote => {
      // Filtro de busca
      const matchesSearch = quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quote.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de favoritos
      const matchesFavorites = !showFavoritesOnly || favorites.includes(quote.id);
      
      return matchesSearch && matchesFavorites;
    })
    .sort((a, b) => {
      // Ordenação
      switch (sortBy) {
        case 'market_cap':
          return b.market_cap - a.market_cap;
        case 'volume':
          return b.volume_24h - a.volume_24h;
        case 'price':
          return b.current_price - a.current_price;
        case 'change':
          return b.price_change_percentage_24h - a.price_change_percentage_24h;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Cotações em Tempo Real
          </h2>
          {lastUpdate && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          )}
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar moeda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            title="Ordenar cotações por"
            aria-label="Ordenar cotações por"
          >
            <option value="market_cap">Market Cap</option>
            <option value="volume">Volume 24h</option>
            <option value="price">Preço</option>
            <option value="change">Variação 24h</option>
          </select>
          
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-2 rounded-lg border transition-colors ${
              showFavoritesOnly 
                ? 'bg-yellow-500 text-white border-yellow-500' 
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
            title={showFavoritesOnly ? 'Mostrar todas' : 'Mostrar apenas favoritos'}
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {loading && quotes.length === 0 ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Carregando cotações...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Nenhuma criptomoeda foi encontrada.</p>
          <button
            onClick={onRetry}
            className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Moeda
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    24h
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Gráfico 7D
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Volume 24h
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Favoritos
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden relative">
                          <img 
                            src={quote.image} 
                            alt={`Logo da ${quote.name}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback para ícone se a imagem falhar
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLDivElement;
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                            loading="lazy"
                          />
                          <div 
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-yellow-500 items-center justify-center hidden"
                            aria-label={`Fallback para ${quote.name}`}
                          >
                            <span className="text-white font-bold text-sm">
                              {quote.symbol.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {quote.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {quote.symbol.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {coinGeckoService.formatCurrency(quote.current_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${
                        quote.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {coinGeckoService.formatPercentage(quote.price_change_percentage_24h)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="w-24 h-10 mx-auto">
                        <SparklineChart 
                          data={quote.sparkline_in_7d?.price || []} 
                          color={quote.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444'}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {coinGeckoService.formatLargeNumber(quote.market_cap)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {coinGeckoService.formatLargeNumber(quote.volume_24h)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => {
                          if (setFavorites) {
                            // Lógica para favoritar/desfavoritar
                            const isFavorite = favorites.includes(quote.id);
                            let newFavorites;
                            if (isFavorite) {
                              newFavorites = favorites.filter(id => id !== quote.id);
                            } else {
                              newFavorites = [...favorites, quote.id];
                            }
                            setFavorites(newFavorites);
                            localStorage.setItem('cryptoFavorites', JSON.stringify(newFavorites));
                          }
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          favorites.includes(quote.id) 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={favorites.includes(quote.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                      >
                        <Star className={`w-4 h-4 ${favorites.includes(quote.id) ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            if (onOpenInvestmentModal) {
                              onOpenInvestmentModal(quote);
                            }
                          }}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
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
          
          {filteredQuotes.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma moeda encontrada para "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Categorias de investimentos
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

const InvestmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'analytics' | 'quotes'>('quotes');
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [quotes, setQuotes] = useState<CryptoCurrency[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [hideBalances, setHideBalances] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Form states
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoData | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Investment['category']>('Criptoativos');
  const [targetAllocation, setTargetAllocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseTime, setPurchaseTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [customBuyPrice, setCustomBuyPrice] = useState('');
  const [isCustomCrypto, setIsCustomCrypto] = useState(false);
  const [customCryptoName, setCustomCryptoName] = useState('');
  const [customCryptoSymbol, setCustomCryptoSymbol] = useState('');
  const [notes, setNotes] = useState('');
  
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

  // Buscar todos os dados da página
  const fetchPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Buscar investimentos e cotações em paralelo
      const [investmentsResponse, quotesResponse] = await Promise.all([
        supabase.from('investments').select('*').eq('user_id', user?.id),
        coinGeckoService.getCryptoPrices()
      ]);

      if (investmentsResponse.error) throw investmentsResponse.error;
      // Não vamos tratar o erro da API de cotações como fatal aqui

      const investmentsFromDb = investmentsResponse.data || [];
      const quotesFromApi = quotesResponse || [];
      
      setQuotes(quotesFromApi);

      // 2. Criar um mapa de cotações para busca rápida
      const quotesMap = new Map(quotesFromApi.map(q => [q.id, q.current_price]));

      // 3. Combinar os dados: adicionar o preço atual aos investimentos do banco
      const investmentsWithPrices = investmentsFromDb.map(inv => {
        // Para ativos customizados, o preço atual pode não existir na API, usamos o de compra.
        const currentPrice = quotesMap.get(inv.crypto_id) || inv.buy_price;
        return {
          ...inv,
          id: inv.id,
          cryptoId: inv.crypto_id,
          symbol: inv.symbol,
          name: inv.name,
          amount: inv.amount,
          buyPrice: inv.buy_price,
          purchaseDate: inv.purchase_date,
          category: inv.category,
          customCrypto: inv.custom_crypto,
          notes: inv.notes,
          currentPrice: currentPrice, // <-- A MÁGICA ACONTECE AQUI
          purchaseTime: '', 
          targetAllocation: 0 
        };
      });

      setInvestments(investmentsWithPrices);

    } catch (error: any) {
      console.error('Erro ao carregar dados da página:', error);
      if (error instanceof RateLimitError) {
        setError(error.message);
      } else {
        setError('Falha ao carregar dados. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Consolidar investimentos por moeda
  const consolidateInvestments = (): ConsolidatedInvestment[] => {
    const investmentMap: { [key: string]: ConsolidatedInvestment } = {};

    investments.forEach(investment => {
      // FIX: Garantir que o preço atual seja um número válido, usando o preço de compra como fallback.
      const currentPrice = (investment.currentPrice && investment.currentPrice > 0) 
        ? investment.currentPrice 
        : investment.buyPrice;

      if (!investmentMap[investment.cryptoId]) {
        investmentMap[investment.cryptoId] = {
          cryptoId: investment.cryptoId,
          symbol: investment.symbol,
          name: investment.name,
          totalAmount: 0,
          totalQuantity: 0,
          averageBuyPrice: 0,
          currentPrice: currentPrice,
          currentValue: 0,
          profit: 0,
          profitPercentage: 0,
          category: investment.category,
          investments: [],
        };
      }
      
      const mapEntry = investmentMap[investment.cryptoId];
      mapEntry.investments.push(investment);
      mapEntry.totalAmount += investment.amount;
      mapEntry.totalQuantity += investment.amount / investment.buyPrice;
      mapEntry.currentValue = mapEntry.totalQuantity * currentPrice;
      mapEntry.averageBuyPrice = mapEntry.totalAmount / mapEntry.totalQuantity;
      mapEntry.profit = mapEntry.currentValue - mapEntry.totalAmount;
      mapEntry.profitPercentage = (mapEntry.profit / mapEntry.totalAmount) * 100;
      mapEntry.currentPrice = currentPrice; // Atualiza o preço atual consolidado
    });

    return Object.values(investmentMap);
  };

  // Adicionar investimento
  const addInvestment = async () => {
    // 1. Validação do usuário
    if (!user) {
      setToast({ show: true, type: 'error', title: 'Erro de Autenticação', message: 'Usuário não encontrado. Faça login novamente.' });
      return;
    }

    // 2. Validação dos dados de entrada
    const amountValue = parseFloat(investmentAmount);
    if (!amountValue || isNaN(amountValue) || amountValue <= 0) {
      setToast({ show: true, type: 'error', title: 'Dados inválidos', message: 'Verifique o valor investido.' });
      return;
    }

    try {
      // Se for Criptoativos, manter lógica antiga
      if (selectedCategory === 'Criptoativos') {
        const buyPriceValue = parseFloat(customBuyPrice) || selectedCrypto?.current_price;
        if (!buyPriceValue || isNaN(buyPriceValue)) {
          setToast({ show: true, type: 'error', title: 'Dados inválidos', message: 'Verifique o valor investido e o preço de compra.' });
          return;
        }
        const quantity = amountValue / buyPriceValue;
        const investmentToInsert = {
          user_id: user.id,
          crypto_id: isCustomCrypto ? customCryptoSymbol.toLowerCase() : selectedCrypto?.id,
          name: isCustomCrypto ? customCryptoName : selectedCrypto?.name,
          symbol: isCustomCrypto ? customCryptoSymbol.toUpperCase() : selectedCrypto?.symbol.toUpperCase(),
          quantity: quantity,
          amount: amountValue,
          buy_price: buyPriceValue,
          purchase_date: new Date().toISOString(),
          category: 'Criptoativos',
          custom_crypto: isCustomCrypto,
          notes: ''
        };
        const { data: newInvestment, error } = await supabase
          .from('investments')
          .insert(investmentToInsert)
          .select()
          .single();
        if (error) {
          setToast({ show: true, type: 'error', title: 'Erro ao salvar', message: 'Não foi possível salvar o investimento.' });
          console.error('Erro ao inserir investimento:', error);
          return;
        }
        // FIX: Encontrar o preço atual da cotação para o ativo que está sendo adicionado.
        const quote = quotes.find(q => q.id === (isCustomCrypto ? customCryptoSymbol.toLowerCase() : selectedCrypto?.id));
        const currentPrice = quote?.current_price || buyPriceValue;
        const newInvestmentWithPrice = {
          ...newInvestment,
          currentPrice: currentPrice,
          id: newInvestment.id,
          cryptoId: newInvestment.crypto_id,
          symbol: newInvestment.symbol,
          name: newInvestment.name,
          amount: newInvestment.amount,
          buyPrice: newInvestment.buy_price,
          purchaseDate: newInvestment.purchase_date,
          category: newInvestment.category,
          customCrypto: newInvestment.custom_crypto,
          notes: newInvestment.notes,
          purchaseTime: '',
          targetAllocation: 0
        };
        setInvestments(prev => [...prev, newInvestmentWithPrice]);
      } else {
        // Para outras categorias
        const investmentToInsert = {
          user_id: user.id,
          crypto_id: selectedCategory.toLowerCase(),
          name: selectedCategory,
          symbol: selectedCategory.substring(0, 3).toUpperCase(),
          quantity: 1,
          amount: amountValue,
          buy_price: amountValue,
          purchase_date: new Date().toISOString(),
          category: selectedCategory,
          custom_crypto: false,
          notes: ''
        };
        const { data: newInvestment, error } = await supabase
          .from('investments')
          .insert(investmentToInsert)
          .select()
          .single();
        if (error) {
          setToast({ show: true, type: 'error', title: 'Erro ao salvar', message: 'Não foi possível salvar o investimento.' });
          console.error('Erro ao inserir investimento:', error);
          return;
        }
        const newInvestmentWithPrice = {
          ...newInvestment,
          currentPrice: newInvestment.amount,
          id: newInvestment.id,
          cryptoId: newInvestment.crypto_id,
          symbol: newInvestment.symbol,
          name: newInvestment.name,
          amount: newInvestment.amount,
          buyPrice: newInvestment.buy_price,
          purchaseDate: newInvestment.purchase_date,
          category: newInvestment.category,
          customCrypto: newInvestment.custom_crypto,
          notes: newInvestment.notes,
          purchaseTime: '',
          targetAllocation: 0
        };
        setInvestments(prev => [...prev, newInvestmentWithPrice]);
      }

      // Reset form
      setSelectedCrypto(null);
      setInvestmentAmount('');
      setCustomBuyPrice('');
      setIsCustomCrypto(false);
      setCustomCryptoName('');
      setCustomCryptoSymbol('');
      setShowAddModal(false);

      setToast({
        show: true,
        type: 'success',
        title: 'Investimento adicionado!',
        message: 'Investimento foi adicionado ao seu portfólio.'
      });
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      setToast({
        show: true,
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Ocorreu um erro ao salvar o investimento.'
      });
    }
  };

  // Editar investimento
  const editInvestment = async () => {
    if (!user || !selectedInvestment) {
      setToast({ show: true, type: 'error', title: 'Erro', message: 'Dados inválidos para edição.' });
      return;
    }

    try {
      const amountValue = parseFloat(investmentAmount);
      const buyPriceValue = parseFloat(customBuyPrice);

      if (!amountValue || isNaN(amountValue) || amountValue <= 0 || !buyPriceValue || isNaN(buyPriceValue)) {
        setToast({ show: true, type: 'error', title: 'Dados inválidos', message: 'Verifique o valor investido e o preço de compra.' });
        return;
      }

      const quantity = amountValue / buyPriceValue;
      const investmentToUpdate: any = {
        amount: amountValue,
        buy_price: buyPriceValue,
        quantity: quantity,
        category: selectedCategory,
        purchase_date: purchaseDate,
        notes: selectedInvestment.notes || ''
      };

      // Se for criptoativo, adicionar dados específicos
      if (selectedCategory === 'Criptoativos') {
        if (isCustomCrypto) {
          if (!customCryptoName || !customCryptoSymbol) {
            setToast({
              show: true,
              type: 'error',
              title: 'Dados inválidos',
              message: 'Por favor, preencha o nome e o símbolo da criptomoeda.'
            });
            return;
          }
          investmentToUpdate.crypto_id = customCryptoSymbol.toLowerCase();
          investmentToUpdate.name = customCryptoName;
          investmentToUpdate.symbol = customCryptoSymbol.toUpperCase();
          investmentToUpdate.custom_crypto = true;
        } else {
          if (!selectedCrypto) {
            setToast({
              show: true,
              type: 'error',
              title: 'Dados inválidos',
              message: 'Por favor, selecione uma criptomoeda.'
            });
            return;
          }
          investmentToUpdate.crypto_id = selectedCrypto.id;
          investmentToUpdate.name = selectedCrypto.name;
          investmentToUpdate.symbol = selectedCrypto.symbol.toUpperCase();
          investmentToUpdate.custom_crypto = false;
        }
      }

      const { error } = await supabase
        .from('investments')
        .update(investmentToUpdate)
        .eq('id', selectedInvestment.id);

      if (error) throw error;

      // Atualizar o estado local
      setInvestments(prevInvestments => 
        prevInvestments.map(inv => 
          inv.id === selectedInvestment.id 
            ? {
                ...inv,
                amount: amountValue,
                buyPrice: buyPriceValue,
                category: selectedCategory,
                purchaseDate: purchaseDate,
                notes: selectedInvestment.notes || '',
                ...(selectedCategory === 'Criptoativos' && {
                  cryptoId: isCustomCrypto ? customCryptoSymbol.toLowerCase() : selectedCrypto?.id || inv.cryptoId,
                  name: isCustomCrypto ? customCryptoName : selectedCrypto?.name || inv.name,
                  symbol: isCustomCrypto ? customCryptoSymbol.toUpperCase() : selectedCrypto?.symbol.toUpperCase() || inv.symbol,
                  customCrypto: isCustomCrypto
                })
              }
            : inv
        )
      );

      setShowEditModal(false);
      setToast({ 
        show: true, 
        type: 'success', 
        title: 'Investimento atualizado', 
        message: 'As alterações foram salvas com sucesso!' 
      });

      // Recarregar dados
      fetchPageData();

    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      setToast({ 
        show: true, 
        type: 'error', 
        title: 'Erro ao salvar', 
        message: 'Não foi possível atualizar o investimento.' 
      });
    }
  };

  // Remover investimento
  const removeInvestment = async (id: string) => {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id);

    if (error) {
      setToast({ show: true, type: 'error', title: 'Erro ao remover', message: 'Não foi possível remover o investimento.' });
      return;
    }

    setInvestments(prev => prev.filter(inv => inv.id !== id));
    setToast({
      show: true,
      type: 'success',
      title: 'Investimento removido'
    });
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    // Carregar favoritos do localStorage
    const savedFavorites = localStorage.getItem('crypto-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    }

    fetchPageData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(fetchPageData, 90000); // Aumentado para 90 segundos
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

  const consolidatedInvestments = consolidateInvestments();
  
  // Calcular estatísticas do portfólio
  const portfolioStats = investments.reduce((acc, investment) => {
    acc.totalInvested += investment.amount;
    acc.currentValue += investment.amount / investment.buyPrice * investment.currentPrice;
    return acc;
  }, { totalInvested: 0, currentValue: 0, totalProfit: 0 });
  
  portfolioStats.totalProfit = portfolioStats.currentValue - portfolioStats.totalInvested;
  
  const profitPercentage = portfolioStats.totalInvested > 0
    ? ((portfolioStats.currentValue - portfolioStats.totalInvested) / portfolioStats.totalInvested) * 100
    : 0;

  // FIX: Adicionar a chave que faltava para resolver o aviso do React.
  const portfolioContent = consolidatedInvestments.map((investment) => (
    <div key={investment.cryptoId} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{investment.name} ({investment.symbol})</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{investment.category}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">{investment.investments.length} transação(ões)</p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const inv = investment.investments[0];
                setSelectedInvestment(inv);
                setInvestmentAmount(inv.amount.toString());
                setCustomBuyPrice(inv.buyPrice.toString());
                setSelectedCategory(inv.category);
                setPurchaseDate(inv.purchaseDate);
                setNotes(inv.notes || '');

                // Resetar estados de cripto
                setIsCustomCrypto(inv.customCrypto || false);
                setSelectedCrypto(null);
                setCustomCryptoName('');
                setCustomCryptoSymbol('');

                // Se for cripto, inicializar estados específicos
                if (inv.category === 'Criptoativos') {
                  if (inv.customCrypto) {
                    setIsCustomCrypto(true);
                    setCustomCryptoName(inv.name);
                    setCustomCryptoSymbol(inv.symbol);
                  } else {
                    const quote = quotes.find(q => q.id === inv.cryptoId);
                    if (quote) {
                      setSelectedCrypto({
                        id: quote.id,
                        symbol: quote.symbol,
                        name: quote.name,
                        current_price: quote.current_price,
                        price_change_percentage_24h: quote.price_change_percentage_24h,
                        market_cap: quote.market_cap,
                        total_volume: quote.volume_24h,
                        image: quote.image,
                        sparkline_in_7d: quote.sparkline_in_7d
                      });
                    }
                  }
                }

                setShowEditModal(true);
              }}
              className="text-blue-500 hover:text-blue-700 text-sm mt-1"
              title="Editar investimento"
              aria-label="Editar investimento"
            >
              <Pencil className="w-4 h-4 inline-block" aria-hidden="true"/> Editar
            </button>
            <button 
              onClick={() => removeInvestment(investment.investments[0].id)} 
              className="text-red-500 hover:text-red-700 text-sm mt-1"
              title="Remover todo o investimento"
              aria-label="Remover investimento"
            >
              <Trash2 className="w-4 h-4 inline-block" aria-hidden="true"/> Remover
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Investido</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {hideBalances ? '•••••' : formatCurrency(investment.totalAmount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Valor Atual</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {hideBalances ? '•••••' : formatCurrency(investment.currentValue)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Quantidade</p>
          <p className="text-lg font-semibold text-gray-800 dark:text-white">
            {hideBalances ? '•••••' : investment.totalQuantity.toFixed(6)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Lucro/Prejuízo</p>
          <p className={`text-lg font-semibold ${investment.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {hideBalances ? '•••••' : `${formatCurrency(investment.profit)} (${formatPercentage(investment.profitPercentage)})`}
          </p>
        </div>
      </div>
    </div>
  ));

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
            onClick={fetchPageData}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Rentabilidade</p>
              <p className={`text-2xl font-bold ${profitPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {hideBalances ? '•••••' : formatPercentage(profitPercentage)}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('quotes')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'quotes'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Cotações
              </div>
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'portfolio'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Meu Portfólio
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Analytics
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'portfolio' ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Meus Investimentos Consolidados</h2>
              {consolidatedInvestments.length > 0 ? (
                <div>{portfolioContent}</div>
              ) : (
                <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg shadow">
                  <p className="text-gray-500 dark:text-gray-400">
                    Nenhum investimento cadastrado ainda.
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === 'analytics' ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Analytics do Portfólio
              </h2>
              
              {consolidatedInvestments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    Adicione investimentos para ver os gráficos e análises.
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Seção 1: Análises e Métricas Detalhadas */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-purple-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl">
                        <span className="text-2xl">📈</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Análises e Métricas Detalhadas
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Insights avançados sobre performance e riscos
                        </p>
                      </div>
                    </div>
                    
                    <AdvancedAnalytics 
                      investments={consolidatedInvestments.map(inv => ({
                        id: inv.cryptoId,
                        name: inv.name,
                        symbol: inv.symbol,
                        amount: inv.totalAmount,
                        currentValue: inv.currentValue,
                        category: inv.category,
                        profit: inv.profit,
                        profitPercentage: inv.profitPercentage
                      }))}
                      hideBalances={hideBalances}
                    />
                  </div>

                  {/* Seção 2: Gráficos Pizza */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-blue-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Gráficos Pizza
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Distribuição e composição dos seus investimentos
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <PortfolioAllocation 
                        investments={consolidatedInvestments.map(inv => ({
                          id: inv.cryptoId,
                          name: inv.name,
                          symbol: inv.symbol,
                          amount: inv.totalAmount,
                          currentValue: inv.currentValue,
                          category: inv.category,
                          profit: inv.profit,
                          profitPercentage: inv.profitPercentage
                        }))}
                        hideBalances={hideBalances}
                      />
                      <PortfolioCategoryPieChart 
                        investments={consolidatedInvestments.map(inv => ({
                          id: inv.cryptoId,
                          name: inv.name,
                          symbol: inv.symbol,
                          amount: inv.totalAmount,
                          currentValue: inv.currentValue,
                          category: inv.category,
                          profit: inv.profit,
                          profitPercentage: inv.profitPercentage
                        }))}
                        hideBalances={hideBalances}
                      />
                    </div>
                  </div>

                  {/* Seção 3: Evolução Temporal */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-green-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Evolução Temporal
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Acompanhe a evolução do seu portfólio ao longo do tempo
                        </p>
                      </div>
                    </div>
                    
                    <TimelineChart 
                      data={consolidatedInvestments.map((inv, index) => ({
                        date: new Date(Date.now() - (consolidatedInvestments.length - index) * 24 * 60 * 60 * 1000).toISOString(),
                        value: inv.currentValue,
                        profit: inv.profit,
                        profitPercentage: inv.profitPercentage
                      }))}
                      hideBalances={hideBalances}
                    />
                  </div>
                  
                  {/* Seção 4: Heatmap de Performance */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-8 border border-orange-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl">
                        <span className="text-2xl">🔥</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Heatmap de Performance
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Visualização interativa da performance dos seus ativos
                        </p>
                      </div>
                    </div>
                    
                    <PerformanceHeatmap 
                      investments={consolidatedInvestments.map(inv => ({
                        id: inv.cryptoId,
                        name: inv.name,
                        symbol: inv.symbol,
                        amount: inv.totalAmount,
                        currentValue: inv.currentValue,
                        category: inv.category,
                        profit: inv.profit,
                        profitPercentage: inv.profitPercentage
                      }))}
                      hideBalances={hideBalances}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <CryptoQuotesTab 
              quotes={quotes}
              loading={loading}
              error={error}
              onRetry={fetchPageData}
              favorites={favorites}
              setFavorites={setFavorites}
              onOpenInvestmentModal={(crypto) => {
                // Converter CryptoCurrency para CryptoData
                const cryptoData: CryptoData = {
                  id: crypto.id,
                  symbol: crypto.symbol,
                  name: crypto.name,
                  current_price: crypto.current_price,
                  price_change_percentage_24h: crypto.price_change_percentage_24h,
                  market_cap: crypto.market_cap,
                  total_volume: crypto.volume_24h,
                  image: crypto.image,
                  sparkline_in_7d: crypto.sparkline_in_7d
                };
                setSelectedCrypto(cryptoData);
                setCustomBuyPrice(crypto.current_price.toString());
                setShowAddModal(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Modal de Adicionar Investimento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Novo Investimento
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Valor do Investimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor do Investimento (USD) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      placeholder="Ex: 1000"
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Investment['category'])}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    title="Selecione a categoria do investimento"
                    aria-label="Categoria do investimento"
                  >
                    {Object.entries(INVESTMENT_CATEGORIES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleção de Moeda, Preço de Compra e Ativo Customizado - só para Criptoativos */}
                {selectedCategory === 'Criptoativos' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Moeda/Ativo *
                      </label>
                      <select
                        value={selectedCrypto?.id || ''}
                        onChange={(e) => {
                          const crypto = quotes.find(c => c.id === e.target.value);
                          if (crypto) {
                            // Garantir que seja do tipo CryptoData
                            setSelectedCrypto({
                              id: crypto.id,
                              symbol: crypto.symbol,
                              name: crypto.name,
                              current_price: crypto.current_price,
                              price_change_percentage_24h: crypto.price_change_percentage_24h,
                              market_cap: crypto.market_cap,
                              total_volume: crypto.volume_24h, // garantir compatibilidade
                              image: crypto.image,
                              sparkline_in_7d: crypto.sparkline_in_7d
                            });
                            setCustomBuyPrice(crypto.current_price.toString());
                          } else {
                            setSelectedCrypto(null);
                          }
                          setIsCustomCrypto(false);
                        }}
                        disabled={isCustomCrypto}
                        className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg \
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white\n           disabled:opacity-50"
                        required={!isCustomCrypto}
                      >
                        <option value="">Selecione uma moeda</option>
                        {quotes.slice(0, 50).map((crypto) => (
                          <option key={crypto.id} value={crypto.id}>
                            {crypto.name} ({crypto.symbol.toUpperCase()}) - {formatCurrency(crypto.current_price)}
                          </option>
                        ))}
                      </select>
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="customCrypto"
                          checked={isCustomCrypto}
                          onChange={(e) => {
                            setIsCustomCrypto(e.target.checked);
                            if (e.target.checked) {
                              setSelectedCrypto(null);
                              setCustomBuyPrice('');
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="customCrypto" className="text-sm text-gray-700 dark:text-gray-300">
                          Meu ativo não está listado
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preço no momento da compra (USD) *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={customBuyPrice}
                          onChange={(e) => setCustomBuyPrice(e.target.value)}
                          placeholder={selectedCrypto ? selectedCrypto.current_price.toString() : "Ex: 45000"}
                          min="0"
                          step="0.00000001"
                          className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg \
                                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                          required
                        />
                      </div>
                      {selectedCrypto && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Preço atual: {formatCurrency(selectedCrypto.current_price)}
                        </p>
                      )}
                    </div>
                    {isCustomCrypto && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nome do Ativo *
                          </label>
                          <input
                            type="text"
                            value={customCryptoName}
                            onChange={(e) => setCustomCryptoName(e.target.value)}
                            placeholder="Ex: Bitcoin"
                            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg \
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Símbolo/Ticker *
                          </label>
                          <input
                            type="text"
                            value={customCryptoSymbol}
                            onChange={(e) => setCustomCryptoSymbol(e.target.value.toUpperCase())}
                            placeholder="Ex: BTC"
                            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg \
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                            required
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Data do investimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Data do Investimento *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                {/* Hora do investimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hora do Investimento
                  </label>
                  <input
                    type="time"
                    value={purchaseTime}
                    onChange={(e) => setPurchaseTime(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Resumo do Investimento */}
              {(selectedCrypto || isCustomCrypto) && investmentAmount && parseFloat(investmentAmount) > 0 && customBuyPrice && parseFloat(customBuyPrice) > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-3">Resumo do Investimento</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Ativo:</span>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {isCustomCrypto 
                          ? `${customCryptoName} (${customCryptoSymbol})`
                          : `${selectedCrypto?.name} (${selectedCrypto?.symbol.toUpperCase()})`
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Quantidade estimada:</span>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {(parseFloat(investmentAmount) / parseFloat(customBuyPrice)).toFixed(8)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Categoria:</span>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {INVESTMENT_CATEGORIES[selectedCategory]?.label}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Data/Hora:</span>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {new Date(purchaseDate + 'T' + purchaseTime).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                           rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addInvestment}
                  disabled={
                    !investmentAmount ||
                    parseFloat(investmentAmount) <= 0 ||
                    !purchaseDate ||
                    (selectedCategory === 'Criptoativos'
                      ? (!customBuyPrice || parseFloat(customBuyPrice) <= 0 || (!selectedCrypto && !isCustomCrypto) || (isCustomCrypto && (!customCryptoName || !customCryptoSymbol)))
                      : false)
                  }
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed \
                           text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Registrar Investimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Investimento */}
      {showEditModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Editar Investimento
                </h2>
                                              <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Fechar modal"
              aria-label="Fechar modal de edição"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
              </div>
              
              <div className="space-y-6">
                {/* Primeira linha: Valor e Preço */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Valor do Investimento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valor do Investimento (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        title="Valor do investimento em USD"
                        aria-label="Valor do investimento em USD"
                      />
                    </div>
                  </div>

                  {/* Preço de Compra */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preço de Compra (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={customBuyPrice}
                        onChange={(e) => setCustomBuyPrice(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        title="Preço de compra em USD"
                        aria-label="Preço de compra em USD"
                      />
                    </div>
                  </div>
                </div>

                {/* Segunda linha: Categoria e Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria *
                    </label>
                                      <select
                    value={selectedCategory}
                    onChange={(e) => {
                      const newCategory = e.target.value as Investment['category'];
                      setSelectedCategory(newCategory);
                      if (newCategory === 'Criptoativos') {
                        if (!selectedInvestment.customCrypto) {
                          const quote = quotes.find(q => q.id === selectedInvestment.cryptoId);
                          if (quote) {
                            setSelectedCrypto({
                              id: quote.id,
                              symbol: quote.symbol,
                              name: quote.name,
                              current_price: quote.current_price,
                              price_change_percentage_24h: quote.price_change_percentage_24h,
                              market_cap: quote.market_cap,
                              total_volume: quote.volume_24h,
                              image: quote.image,
                              sparkline_in_7d: quote.sparkline_in_7d
                            });
                          }
                        } else {
                          setIsCustomCrypto(true);
                          setCustomCryptoName(selectedInvestment.name);
                          setCustomCryptoSymbol(selectedInvestment.symbol);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    title="Selecione a categoria do investimento"
                    aria-label="Categoria do investimento"
                    id="categorySelect"
                  >
                    {Object.entries(INVESTMENT_CATEGORIES).map(([value, { label }]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  </div>

                  {/* Data da Compra */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data da Compra *
                    </label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      title="Data da compra"
                      aria-label="Data da compra"
                    />
                  </div>
                </div>

                {/* Terceira linha: Opções de Criptomoeda */}
                {selectedCategory === 'Criptoativos' && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      <input
                        type="checkbox"
                        checked={isCustomCrypto}
                        onChange={(e) => {
                          setIsCustomCrypto(e.target.checked);
                          if (!e.target.checked) {
                            setSelectedCrypto(null);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      Criptomoeda não listada
                    </label>

                    {isCustomCrypto ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nome da Criptomoeda *
                          </label>
                          <input
                            type="text"
                            value={customCryptoName}
                            onChange={(e) => setCustomCryptoName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                            placeholder="Ex: Bitcoin"
                            title="Nome da criptomoeda personalizada"
                            aria-label="Nome da criptomoeda"
                            id="customCryptoName"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" htmlFor="customCryptoSymbol">
                            Símbolo *
                          </label>
                          <input
                            type="text"
                            value={customCryptoSymbol}
                            onChange={(e) => setCustomCryptoSymbol(e.target.value.toUpperCase())}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                            placeholder="Ex: BTC"
                            title="Símbolo da criptomoeda personalizada"
                            aria-label="Símbolo da criptomoeda"
                            id="customCryptoSymbol"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Selecione a Criptomoeda *
                        </label>
                        <select
                          value={selectedCrypto?.id || ''}
                          onChange={(e) => {
                            const crypto = quotes.find(q => q.id === e.target.value);
                            if (crypto) {
                              setSelectedCrypto({
                                id: crypto.id,
                                symbol: crypto.symbol,
                                name: crypto.name,
                                current_price: crypto.current_price,
                                price_change_percentage_24h: crypto.price_change_percentage_24h,
                                market_cap: crypto.market_cap,
                                total_volume: crypto.volume_24h,
                                image: crypto.image,
                                sparkline_in_7d: crypto.sparkline_in_7d
                              });
                              setCustomBuyPrice(crypto.current_price.toString());
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                          title="Lista de criptomoedas disponíveis"
                          aria-label="Selecione uma criptomoeda"
                          id="cryptoSelect"
                        >
                          <option value="">Selecione uma criptomoeda</option>
                          {quotes.map((crypto) => (
                            <option key={crypto.id} value={crypto.id}>
                              {crypto.name} ({crypto.symbol.toUpperCase()}) - {formatCurrency(crypto.current_price)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Notas */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="Adicione notas sobre este investimento..."
                    title="Notas sobre o investimento"
                    aria-label="Notas sobre o investimento"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Cancelar edição"
                  aria-label="Cancelar edição"
                >
                  Cancelar
                </button>
                <button
                  onClick={editInvestment}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  title="Salvar alterações do investimento"
                  aria-label="Salvar alterações do investimento"
                >
                  <Save className="w-5 h-5" aria-hidden="true" />
                  Salvar Alterações
                </button>
              </div>
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
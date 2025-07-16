// CoinGecko API service for real-time crypto prices
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  volume_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  last_updated: string;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  total_volume: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  last_updated: string;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

// Popular cryptocurrencies with their CoinGecko IDs
export const POPULAR_CRYPTOS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { id: 'vechain', symbol: 'VET', name: 'VeChain' }
];

class CoinGeckoService {
  private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          return response;
        }
        if (response.status === 429) {
          // Rate limit hit. Throw a specific error to be handled by the caller.
          throw new RateLimitError('Too Many Requests');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        if (error instanceof RateLimitError) {
          // Don't retry on rate limit errors, just re-throw
          throw error;
        }
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async getCryptoPrices(coinIds: string[] = []): Promise<CryptoCurrency[]> {
    try {
      const ids = coinIds.length > 0 ? coinIds : POPULAR_CRYPTOS.map(c => c.id);
      const idsString = ids.join(',');
      
      const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${idsString}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`;
      
      const response = await this.fetchWithRetry(url);
      const data: CoinGeckoResponse[] = await response.json();
      
      return data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        volume_24h: coin.total_volume,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        last_updated: coin.last_updated,
        image: coin.image,
        sparkline_in_7d: coin.sparkline_in_7d
      }));
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      throw error;
    }
  }

  async getCryptoPrice(coinId: string): Promise<CryptoCurrency | null> {
    try {
      const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinId}&order=market_cap_desc&per_page=1&page=1&sparkline=true&price_change_percentage=24h`;
      
      const response = await this.fetchWithRetry(url);
      const data: CoinGeckoResponse[] = await response.json();
      
      if (data.length === 0) return null;
      
      const coin = data[0];
      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        volume_24h: coin.total_volume,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        last_updated: coin.last_updated,
        image: coin.image,
        sparkline_in_7d: coin.sparkline_in_7d
      };
    } catch (error) {
      console.error(`Error fetching price for ${coinId}:`, error);
      return null;
    }
  }

  async searchCrypto(query: string): Promise<{id: string, symbol: string, name: string}[]> {
    try {
      const url = `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(query)}`;
      
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      return data.coins.slice(0, 10).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name
      }));
    } catch (error) {
      console.error('Error searching crypto:', error);
      return [];
    }
  }

  async getCryptoHistory(coinId: string, days: number = 30): Promise<{prices: number[][], market_caps: number[][], total_volumes: number[][]}> {
    try {
      const url = `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
      
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      return {
        prices: data.prices || [],
        market_caps: data.market_caps || [],
        total_volumes: data.total_volumes || []
      };
    } catch (error) {
      console.error(`Error fetching history for ${coinId}:`, error);
      return { prices: [], market_caps: [], total_volumes: [] };
    }
  }

  // Get trending cryptocurrencies
  async getTrendingCryptos(): Promise<{id: string, symbol: string, name: string, price_change_percentage_24h: number}[]> {
    try {
      const url = `${COINGECKO_API_BASE}/search/trending`;
      
      const response = await this.fetchWithRetry(url);
      const data = await response.json();
      
      return data.coins.slice(0, 10).map((item: any) => ({
        id: item.item.id,
        symbol: item.item.symbol.toUpperCase(),
        name: item.item.name,
        price_change_percentage_24h: item.item.price_change_percentage_24h?.usd || 0
      }));
    } catch (error) {
      console.error('Error fetching trending cryptos:', error);
      return [];
    }
  }

  // Format currency values
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value);
  }

  // Format percentage
  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  // Format large numbers
  formatLargeNumber(value: number): string {
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  }
}

export const coinGeckoService = new CoinGeckoService();
export default coinGeckoService;

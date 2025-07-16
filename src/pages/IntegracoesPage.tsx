import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowLeft,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  CreditCard,
  Building,
  Coins,
  BarChart3,
  Lock,
  RefreshCw
} from 'lucide-react';

const IntegracoesPage: React.FC = () => {
  const navigate = useNavigate();

  const integrations = [
    {
      category: 'Bancos',
      icon: Building,
      integrations: [
        { name: 'Banco do Brasil', status: 'Disponível', description: 'Sincronização automática de contas e transações' },
        { name: 'Itaú', status: 'Disponível', description: 'Integração completa com internet banking' },
        { name: 'Bradesco', status: 'Disponível', description: 'Acesso a dados de contas e investimentos' },
        { name: 'Santander', status: 'Disponível', description: 'Sincronização em tempo real' },
        { name: 'Caixa Econômica', status: 'Em breve', description: 'Integração em desenvolvimento' },
        { name: 'Nubank', status: 'Disponível', description: 'API oficial para sincronização' }
      ]
    },
    {
      category: 'Cartões de Crédito',
      icon: CreditCard,
      integrations: [
        { name: 'Visa', status: 'Disponível', description: 'Todos os cartões Visa' },
        { name: 'Mastercard', status: 'Disponível', description: 'Todos os cartões Mastercard' },
        { name: 'Elo', status: 'Disponível', description: 'Cartões Elo nacionais' },
        { name: 'American Express', status: 'Disponível', description: 'Cartões Amex' }
      ]
    },
    {
      category: 'Investimentos',
      icon: Coins,
      integrations: [
        { name: 'XP Investimentos', status: 'Disponível', description: 'Portfólio e operações' },
        { name: 'Rico', status: 'Disponível', description: 'Acompanhamento de investimentos' },
        { name: 'Clear', status: 'Disponível', description: 'Dados de corretagem' },
        { name: 'Modalmais', status: 'Em breve', description: 'Integração em desenvolvimento' }
      ]
    },
    {
      category: 'Criptomoedas',
      icon: BarChart3,
      integrations: [
        { name: 'Binance', status: 'Disponível', description: 'Portfólio de criptomoedas' },
        { name: 'Coinbase', status: 'Disponível', description: 'Acompanhamento de ativos' },
        { name: 'Mercado Bitcoin', status: 'Disponível', description: 'Carteira brasileira' },
        { name: 'Foxbit', status: 'Em breve', description: 'Integração em desenvolvimento' }
      ]
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Sincronização Automática',
      description: 'Seus dados são atualizados automaticamente, sem necessidade de inserção manual.'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Todas as integrações usam protocolos seguros e criptografia de ponta a ponta.'
    },
    {
      icon: RefreshCw,
      title: 'Tempo Real',
      description: 'Receba atualizações em tempo real de suas transações e saldos.'
    },
    {
      icon: Lock,
      title: 'Controle Total',
      description: 'Você decide quais dados compartilhar e pode revogar acesso a qualquer momento.'
    }
  ];

  const platforms = [
    {
      name: 'Web',
      icon: Monitor,
      description: 'Acesso completo via navegador',
      features: ['Todas as integrações disponíveis', 'Interface otimizada', 'Relatórios avançados'],
      status: 'Disponível'
    },
    {
      name: 'Mobile',
      icon: Smartphone,
      description: 'App nativo para iOS e Android',
      features: ['Sincronização automática', 'Notificações push', 'Interface touch-friendly'],
      status: 'Em breve'
    },
    {
      name: 'Tablet',
      icon: Tablet,
      description: 'Interface otimizada para tablets',
      features: ['Layout responsivo', 'Gráficos interativos', 'Navegação intuitiva'],
      status: 'Em breve'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">FinanceApp</h1>
              <p className="text-sm text-gray-400">Controle Financeiro Inteligente</p>
            </div>
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Integrações <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Poderosas</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Conecte-se com seus bancos, cartões e investimentos favoritos. 
            Sincronização automática e segura para você ter controle total das suas finanças.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center hover:border-slate-600 transition-all duration-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Parceiros Integrados
            </h3>
            <p className="text-xl text-gray-400">
              Conecte-se com os principais serviços financeiros do Brasil
            </p>
          </div>

          <div className="space-y-12">
            {integrations.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div key={categoryIndex} className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">{category.category}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.integrations.map((integration, integrationIndex) => (
                      <div key={integrationIndex} className="bg-slate-700 rounded-xl p-6 border border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-lg font-semibold text-white">{integration.name}</h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            integration.status === 'Disponível' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {integration.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{integration.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="px-6 py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Plataformas Disponíveis
            </h3>
            <p className="text-xl text-gray-400">
              Acesse suas integrações de qualquer lugar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {platforms.map((platform, index) => {
              const Icon = platform.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center hover:border-slate-600 transition-all duration-200 relative">
                  {platform.status === 'Em breve' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-500/30">
                        Em breve
                      </span>
                    </div>
                  )}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4">{platform.name}</h4>
                  <p className="text-gray-400 mb-6">{platform.description}</p>
                  <ul className="space-y-2 text-left">
                    {platform.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Pronto para conectar?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Comece gratuitamente e conecte-se com seus serviços financeiros favoritos
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-2xl text-lg"
          >
            <span>Criar Conta Grátis</span>
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FinanceApp</span>
          </div>
          <p className="text-gray-400">
            © 2024 FinanceApp. Todos os direitos reservados. Transformando vidas através do controle financeiro.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default IntegracoesPage; 
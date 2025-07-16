import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  CreditCard, 
  PiggyBank, 
  Shield, 
  ArrowLeft,
  CheckCircle,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  DollarSign,
  PieChart,
  Calendar,
  Bell,
  Download,
  Upload,
  Lock,
  Users,
  Activity,
  Award
} from 'lucide-react';

const RecursosPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description: 'Visualize suas finanças em tempo real com gráficos interativos e insights personalizados',
      details: [
        'Visão geral completa das suas finanças',
        'Gráficos de receitas e despesas',
        'Análise de tendências',
        'Indicadores de performance',
        'Alertas inteligentes'
      ]
    },
    {
      icon: Target,
      title: 'Metas Financeiras',
      description: 'Defina objetivos e acompanhe seu progresso rumo à independência financeira',
      details: [
        'Criação de metas personalizadas',
        'Acompanhamento em tempo real',
        'Notificações de progresso',
        'Histórico de conquistas',
        'Recomendações personalizadas'
      ]
    },
    {
      icon: CreditCard,
      title: 'Gestão de Cartões',
      description: 'Organize seus cartões de crédito e acompanhe faturas automaticamente',
      details: [
        'Cadastro de múltiplos cartões',
        'Acompanhamento de faturas',
        'Alertas de vencimento',
        'Análise de gastos por cartão',
        'Integração com bancos'
      ]
    },
    {
      icon: PiggyBank,
      title: 'Orçamentos Inteligentes',
      description: 'Crie orçamentos por categoria e receba alertas quando necessário',
      details: [
        'Orçamentos por categoria',
        'Alertas de limite',
        'Relatórios mensais',
        'Comparação com meses anteriores',
        'Sugestões de economia'
      ]
    },
    {
      icon: Shield,
      title: 'Segurança Bancária',
      description: 'Suas informações financeiras protegidas com criptografia de ponta a ponta',
      details: [
        'Criptografia AES-256',
        'Autenticação de dois fatores',
        'Backup automático',
        'Conformidade com LGPD',
        'Monitoramento de segurança'
      ]
    },
    {
      icon: TrendingUp,
      title: 'Investimentos',
      description: 'Acompanhe seus investimentos e receba recomendações personalizadas',
      details: [
        'Portfólio de investimentos',
        'Acompanhamento de performance',
        'Análise de risco',
        'Recomendações personalizadas',
        'Integração com corretoras'
      ]
    }
  ];

  const integrations = [
    { name: 'Bancos Brasileiros', icon: '🏦', description: 'Integração com principais bancos' },
    { name: 'Corretoras', icon: '📈', description: 'Acesso a dados de investimentos' },
    { name: 'Cartões de Crédito', icon: '💳', description: 'Sincronização automática' },
    { name: 'Criptomoedas', icon: '₿', description: 'Acompanhamento de criptoativos' }
  ];

  const platforms = [
    { name: 'Web', icon: Monitor, description: 'Acesso completo via navegador', status: 'Disponível' },
    { name: 'Mobile', icon: Smartphone, description: 'App nativo para iOS e Android', status: 'Em breve' },
    { name: 'Tablet', icon: Tablet, description: 'Interface otimizada para tablets', status: 'Em breve' }
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
            Recursos <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Poderosos</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Descubra todas as funcionalidades que fazem do FinanceApp a plataforma mais completa 
            para gerenciar suas finanças pessoais e empresariais.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-200 hover:shadow-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
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
              Integrações Poderosas
            </h3>
            <p className="text-xl text-gray-400">
              Conecte-se com seus bancos e serviços financeiros favoritos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center hover:border-slate-600 transition-all duration-200">
                <div className="text-4xl mb-4">{integration.icon}</div>
                <h4 className="text-xl font-bold text-white mb-2">{integration.name}</h4>
                <p className="text-gray-400">{integration.description}</p>
              </div>
            ))}
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
              Acesse suas finanças de qualquer lugar, a qualquer hora
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
                  <p className="text-gray-400">{platform.description}</p>
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
            Pronto para experimentar?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Comece gratuitamente e descubra como o FinanceApp pode transformar suas finanças
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

export default RecursosPage; 
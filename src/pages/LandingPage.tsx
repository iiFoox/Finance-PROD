import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  BarChart3, 
  Target, 
  CreditCard, 
  PiggyBank, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  Zap, 
  Globe, 
  Lock,
  Award,
  Clock,
  DollarSign,
  ChevronRight,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  Bell
} from 'lucide-react';
import CategoryIcon from '../components/CategoryIcons';
import PixelCategoryIcon from '../components/PixelCategoryIcons';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const stats = [
    { number: '50K+', label: 'Usuários Ativos', icon: Users },
    { number: 'R$ 2.5M', label: 'Economizados', icon: DollarSign },
    { number: '99.9%', label: 'Uptime', icon: Shield },
    { number: '4.9/5', label: 'Avaliação', icon: Star }
  ];

  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard Inteligente',
      description: 'Visualize suas finanças em tempo real com gráficos interativos e insights personalizados'
    },
    {
      icon: Target,
      title: 'Metas Financeiras',
      description: 'Defina objetivos e acompanhe seu progresso rumo à independência financeira'
    },
    {
      icon: CreditCard,
      title: 'Gestão de Cartões',
      description: 'Organize seus cartões de crédito e acompanhe faturas automaticamente'
    },
    {
      icon: PiggyBank,
      title: 'Orçamentos Inteligentes',
      description: 'Crie orçamentos por categoria e receba alertas quando necessário'
    },
    {
      icon: Shield,
      title: 'Segurança Bancária',
      description: 'Suas informações financeiras protegidas com criptografia de ponta a ponta'
    },
    {
      icon: TrendingUp,
      title: 'Investimentos',
      description: 'Acompanhe seus investimentos e receba recomendações personalizadas'
    }
  ];

  const testimonials = [
    {
      name: 'Ana Silva',
      role: 'Designer UX',
      company: 'TechCorp',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'O FinanceApp revolucionou minha forma de gerenciar dinheiro. Em 6 meses consegui economizar R$ 15.000!',
      rating: 5
    },
    {
      name: 'Carlos Mendes',
      role: 'Empreendedor',
      company: 'StartupXYZ',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'Como empreendedor, preciso ter controle total das minhas finanças. O FinanceApp me dá exatamente isso.',
      rating: 5
    },
    {
      name: 'Mariana Costa',
      role: 'Médica',
      company: 'Hospital Central',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'Interface incrível e funcionalidades que realmente fazem diferença. Recomendo para todos!',
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Até 100 transações/mês',
        'Dashboard básico',
        '2 cartões de crédito',
        'Suporte por email',
        'Relatórios mensais'
      ],
      popular: false,
      cta: 'Começar Grátis'
    },
    {
      name: 'Pro',
      price: 'R$ 19,90',
      period: '/mês',
      description: 'Para quem quer mais controle',
      features: [
        'Transações ilimitadas',
        'Dashboard avançado',
        'Cartões ilimitados',
        'Suporte prioritário',
        'Relatórios detalhados',
        'Metas e investimentos',
        'Exportação de dados'
      ],
      popular: true,
      cta: 'Começar Pro'
    },
    {
      name: 'Business',
      price: 'R$ 49,90',
      period: '/mês',
      description: 'Para empresas e equipes',
      features: [
        'Tudo do plano Pro',
        'Múltiplos usuários',
        'Integração com sistemas',
        'Suporte 24/7',
        'API personalizada',
        'Relatórios customizados',
        'Treinamento da equipe'
      ],
      popular: false,
      cta: 'Falar com Vendas'
    }
  ];

  const benefits = [
    'Interface moderna e intuitiva',
    'Sincronização em tempo real',
    'Relatórios detalhados',
    'Categorização automática',
    'Alertas personalizados',
    'Acesso web completo',
    'Backup automático',
    'Integração com bancos'
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
          <div className="flex items-center space-x-6">
            <a href="/recursos" className="text-gray-300 hover:text-white transition-colors">
              Recursos
            </a>
            <a href="/precos" className="text-gray-300 hover:text-white transition-colors">
              Preços
            </a>
            <a href="/contato" className="text-gray-300 hover:text-white transition-colors">
              Contato
            </a>
            <button
              onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Começar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 mb-6">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-white font-semibold">4.9/5</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">50.000+ usuários</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Controle Financeiro <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Inteligente</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Transforme suas finanças com a plataforma mais completa do Brasil. 
                Dashboard inteligente, integrações bancárias e insights personalizados 
                para você conquistar seus objetivos financeiros.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-2xl text-lg group"
                >
                  <span>Começar Gratuitamente</span>
                  <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>SSL Seguro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Sem Cartão</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span>Setup em 2 min</span>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Main App Screenshot */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Dashboard Financeiro</h4>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                      <div className="text-blue-400 text-sm">Receitas</div>
                      <div className="text-white font-bold text-lg">+ R$ 8.500,00</div>
                      <div className="text-green-400 text-xs">+12% este mês</div>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-3 border border-red-500/30">
                      <div className="text-red-400 text-sm">Despesas</div>
                      <div className="text-white font-bold text-lg">- R$ 6.200,00</div>
                      <div className="text-red-400 text-xs">-8% este mês</div>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Saldo Atual</span>
                      <span className="text-green-400 text-sm">+27%</span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">R$ 2.300,00</div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-500/20 text-green-400 py-2 rounded-lg text-sm font-semibold border border-green-500/30 hover:bg-green-500/30 transition-colors">
                      + Nova Receita
                    </button>
                    <button className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg text-sm font-semibold border border-red-500/30 hover:bg-red-500/30 transition-colors">
                      + Nova Despesa
                    </button>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                  Live
                </div>
              </div>

              {/* Floating Notification */}
              <div className="absolute -bottom-4 -left-4 bg-slate-800 rounded-lg p-3 border border-slate-700 shadow-xl max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Meta Atingida!</div>
                    <div className="text-gray-400 text-xs">Você economizou R$ 500 este mês</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Confiado por milhares de usuários
            </h2>
            <p className="text-xl text-gray-400">
              Números que comprovam nossa eficiência
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: '50.000+', label: 'Usuários Ativos', icon: Users },
              { number: 'R$ 2.5M+', label: 'Economizados', icon: DollarSign },
              { number: '99.9%', label: 'Uptime', icon: Activity },
              { number: '4.9/5', label: 'Avaliação', icon: Star }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Tudo que você precisa em um só lugar
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Ferramentas poderosas e intuitivas para você ter controle total sobre suas finanças
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-200 hover:shadow-2xl group">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* App Screenshots Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Veja como é fácil usar o FinanceApp
            </h3>
            <p className="text-xl text-gray-400">
              Interface intuitiva e funcionalidades poderosas em um só lugar
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dashboard Screenshot */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Dashboard Principal</h4>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-500/20 rounded-lg p-3">
                      <div className="text-blue-400 text-sm">Receitas</div>
                      <div className="text-white font-bold">R$ 8.500</div>
                    </div>
                    <div className="bg-red-500/20 rounded-lg p-3">
                      <div className="text-red-400 text-sm">Despesas</div>
                      <div className="text-white font-bold">R$ 6.200</div>
                    </div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-gray-400 text-sm mb-2">Gráfico de Gastos</div>
                    <div className="flex space-x-1">
                      <div className="w-4 h-8 bg-blue-500 rounded-t"></div>
                      <div className="w-4 h-6 bg-purple-500 rounded-t"></div>
                      <div className="w-4 h-10 bg-green-500 rounded-t"></div>
                      <div className="w-4 h-4 bg-yellow-500 rounded-t"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Transactions Screenshot */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl h-[270px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Transações</h4>
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">+</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between p-4 bg-slate-700 rounded-lg h-16 transition-all duration-200 hover:bg-slate-600 cursor-pointer" 
                  >
                    <div className="flex items-center gap-2">
                      <PixelCategoryIcon 
                        category="Alimentação" 
                        type="expense" 
                        size={20}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-sm font-medium truncate">Restaurante</div>
                        <div className="text-gray-400 text-xs">Hoje, 19:30</div>
                      </div>
                    </div>
                    <div className="text-red-400 font-semibold text-sm flex-shrink-0">-R$ 45,00</div>
                  </div>
                  <div 
                    className="flex items-center justify-between p-4 bg-slate-700 rounded-lg h-16 transition-all duration-200 hover:bg-slate-600 cursor-pointer" 
                  >
                    <div className="flex items-center gap-2">
                      <PixelCategoryIcon 
                        category="Salário" 
                        type="income" 
                        size={20}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-sm font-medium truncate">Salário</div>
                        <div className="text-gray-400 text-xs">Ontem, 08:00</div>
                      </div>
                    </div>
                    <div className="text-green-400 font-semibold text-sm flex-shrink-0">+R$ 3.500,00</div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Investments Screenshot */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-2xl h-[270px]">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Investimentos</h4>
                  <div className="text-green-400 text-sm">+12.5%</div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-700 rounded-lg p-3 h-16 transition-all duration-200 hover:bg-slate-600 cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-sm">Portfólio Total</span>
                      <span className="text-green-400 font-bold">R$ 25.430</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ações</span>
                      <span className="text-white">R$ 12.500</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Fundos</span>
                      <span className="text-white">R$ 8.200</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Cripto</span>
                      <span className="text-white">R$ 4.730</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              O que nossos usuários dizem
            </h3>
            <p className="text-xl text-gray-400">
              Histórias reais de pessoas que transformaram suas finanças
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ana Silva',
                role: 'Designer UX/UI',
                company: 'Deloitte',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
                content: 'O FinanceApp revolucionou minha forma de controlar gastos. Em 6 meses economizei R$ 15.000!',
                rating: 5
              },
              {
                name: 'Carlos Santos',
                role: 'CEO & Fundador',
                company: 'Stone Pagamentos',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                content: 'As integrações bancárias são incríveis. Tudo sincroniza automaticamente, sem trabalho manual.',
                rating: 5
              },
              {
                name: 'Mariana Costa',
                role: 'Médica Cardiologista',
                company: 'Hospital Albert Einstein',
                avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
                content: 'Interface intuitiva e relatórios detalhados. Finalmente consigo visualizar onde meu dinheiro vai.',
                rating: 5
              },
              {
                name: 'Roberto Almeida',
                role: 'Advogado',
                company: 'Pinheiro Neto Advogados',
                avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
                content: 'Como advogado, preciso de controle financeiro preciso. O FinanceApp me dá exatamente isso.',
                rating: 5
              },
              {
                name: 'Fernanda Lima',
                role: 'Engenheira',
                company: 'Vale',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
                content: 'Os relatórios de investimentos são fantásticos. Consigo acompanhar tudo em um só lugar.',
                rating: 5
              },
              {
                name: 'Pedro Mendes',
                role: 'Professor',
                company: 'USP',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                content: 'Simples e eficiente. Perfeito para quem quer organizar as finanças sem complicação.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-200">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={`${testimonial.name} - ${testimonial.role}`}
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-slate-600"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 border-2 border-slate-600';
                      fallback.innerHTML = `<span class="text-white font-bold text-lg">${testimonial.name.split(' ').map(n => n[0]).join('')}</span>`;
                      target.parentNode?.insertBefore(fallback, target);
                    }}
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role} • {testimonial.company}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-300 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Escolha o plano ideal para você
            </h3>
            <p className="text-xl text-gray-400">
              Comece grátis e atualize quando precisar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-slate-800 rounded-2xl p-8 border transition-all duration-200 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-blue-500 shadow-blue-500/20' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleGetStarted}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-bold text-white mb-6">
                Por que escolher o FinanceApp?
              </h3>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Desenvolvido pensando na sua experiência, oferecemos as melhores ferramentas 
                para você conquistar seus objetivos financeiros.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGetStarted}
                className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <span>Começar Gratuitamente</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-white">Resumo Financeiro</h4>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Receitas</span>
                      <span className="text-green-400 font-semibold">+ R$ 8.500,00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Despesas</span>
                      <span className="text-red-400 font-semibold">- R$ 6.200,00</span>
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">Saldo</span>
                        <span className="text-blue-400 font-bold text-xl">R$ 2.300,00</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4 h-16 transition-all duration-200 hover:bg-slate-600 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Meta: Viagem</span>
                      <span className="text-sm text-purple-400">75%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar suas finanças?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a 50.000+ pessoas que já estão no controle de suas finanças
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-2xl text-lg"
            >
              <span>Criar Conta Grátis</span>
              <TrendingUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FinanceApp</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transformando vidas através do controle financeiro inteligente.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-gray-400" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center opacity-50">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center opacity-50">
                  <Tablet className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="/precos" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="/integracoes" className="hover:text-white transition-colors">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/sobre" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="/contato" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/ajuda" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="/documentacao" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="/status" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 FinanceApp. Todos os direitos reservados. Transformando vidas através do controle financeiro.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
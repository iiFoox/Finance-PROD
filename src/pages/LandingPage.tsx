import React from 'react';
import { TrendingUp, Shield, BarChart3, Target, CreditCard, PiggyBank, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const features = [
    {
      icon: BarChart3,
      title: 'Controle Total',
      description: 'Monitore todas suas receitas e despesas em tempo real com gráficos intuitivos'
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
      title: 'Dados Seguros',
      description: 'Suas informações financeiras protegidas com criptografia de ponta'
    },
    {
      icon: TrendingUp,
      title: 'Insights Personalizados',
      description: 'Receba análises inteligentes sobre seus hábitos de consumo'
    }
  ];

  const benefits = [
    'Interface moderna e intuitiva',
    'Sincronização em tempo real',
    'Relatórios detalhados',
    'Categorização automática',
    'Alertas personalizados',
    'Acesso multiplataforma'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">FinanceApp</h1>
              <p className="text-sm text-gray-400">Controle Financeiro Inteligente</p>
            </div>
          </div>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
          >
            <span>Começar Agora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transforme sua
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Vida Financeira</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              A plataforma completa para organizar suas finanças, definir metas e alcançar a liberdade financeira. 
              Simples, seguro e poderoso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-2xl text-lg"
              >
                <span>Criar Conta Grátis</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onGetStarted}
                className="border-2 border-slate-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all duration-200 text-lg"
              >
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
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
                onClick={onGetStarted}
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

                  <div className="bg-slate-700 rounded-lg p-4">
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
            Junte-se a milhares de pessoas que já estão no controle de suas finanças
          </p>
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 mx-auto shadow-2xl text-lg"
          >
            <span>Criar Conta Grátis</span>
            <ArrowRight className="w-5 h-5" />
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

export default LandingPage;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowLeft,
  CheckCircle,
  X,
  Star,
  Zap,
  Shield,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  DollarSign,
  CreditCard,
  Target,
  BarChart3,
  Bell,
  Download,
  Lock,
  Activity
} from 'lucide-react';

const PrecosPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const pricingPlans = [
    {
      name: 'Gratuito',
      price: { monthly: 'R$ 0', yearly: 'R$ 0' },
      period: '/mês',
      description: 'Perfeito para começar',
      features: [
        'Até 100 transações/mês',
        'Dashboard básico',
        '2 cartões de crédito',
        'Suporte por email',
        'Relatórios mensais',
        'Acesso web completo',
        'Backup básico'
      ],
      notIncluded: [
        'Relatórios avançados',
        'Metas e investimentos',
        'Integração com bancos',
        'Suporte prioritário'
      ],
      popular: false,
      cta: 'Começar Grátis',
      color: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Pro',
      price: { monthly: 'R$ 19,90', yearly: 'R$ 199' },
      period: billingCycle === 'monthly' ? '/mês' : '/ano',
      description: 'Para quem quer mais controle',
      features: [
        'Transações ilimitadas',
        'Dashboard avançado',
        'Cartões ilimitados',
        'Suporte prioritário',
        'Relatórios detalhados',
        'Metas e investimentos',
        'Exportação de dados',
        'Integração com bancos',
        'Alertas personalizados',
        'Backup automático',
        'Acesso web completo'
      ],
      notIncluded: [
        'Múltiplos usuários',
        'API personalizada',
        'Suporte 24/7'
      ],
      popular: true,
      cta: 'Começar Pro',
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'Business',
      price: { monthly: 'R$ 49,90', yearly: 'R$ 499' },
      period: billingCycle === 'monthly' ? '/mês' : '/ano',
      description: 'Para empresas e equipes',
      features: [
        'Tudo do plano Pro',
        'Múltiplos usuários',
        'Integração com sistemas',
        'Suporte 24/7',
        'API personalizada',
        'Relatórios customizados',
        'Treinamento da equipe',
        'Dashboard empresarial',
        'Controle de permissões',
        'Backup em nuvem',
        'Conformidade LGPD'
      ],
      notIncluded: [
        'Implementação personalizada',
        'Suporte dedicado'
      ],
      popular: false,
      cta: 'Falar com Vendas',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const savings = billingCycle === 'yearly' ? 'Economize 17%' : '';

  const faqs = [
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento.'
    },
    {
      question: 'Há período de teste gratuito?',
      answer: 'Oferecemos 14 dias de teste gratuito em todos os planos pagos.'
    },
    {
      question: 'Posso mudar de plano?',
      answer: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.'
    },
    {
      question: 'Os dados são seguros?',
      answer: 'Absolutamente! Usamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança.'
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
            Planos <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Simples</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Escolha o plano ideal para suas necessidades. Comece grátis e atualize quando precisar.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Mensal
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-blue-500' : 'bg-gray-600'
              }`}
              aria-label={`Alternar para plano ${billingCycle === 'monthly' ? 'anual' : 'mensal'}`}
              title={`Alternar para plano ${billingCycle === 'monthly' ? 'anual' : 'mensal'}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-lg ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
                Anual
              </span>
              {billingCycle === 'yearly' && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  {savings}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative bg-slate-800 rounded-2xl p-8 border transition-all duration-200 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-blue-500 shadow-blue-500/20 scale-105' 
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
                    <span className="text-4xl font-bold text-white">{plan.price[billingCycle]}</span>
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
                  {plan.notIncluded.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center opacity-50">
                      <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/login')}
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

      {/* FAQ Section */}
      <section className="px-6 py-20 bg-slate-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Perguntas Frequentes
            </h3>
            <p className="text-xl text-gray-400">
              Tire suas dúvidas sobre nossos planos e serviços
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <h4 className="text-xl font-bold text-white mb-3">{faq.question}</h4>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a 50.000+ pessoas que já transformaram suas finanças
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-2xl text-lg"
            >
              <span>Criar Conta Grátis</span>
              <TrendingUp className="w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 text-lg">
              Falar com Especialista
            </button>
          </div>
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

export default PrecosPage; 
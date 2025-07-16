import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowLeft,
  Search,
  HelpCircle,
  Mail,
  MessageCircle,
  BookOpen,
  Video,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

const AjudaPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    {
      title: 'Primeiros Passos',
      icon: HelpCircle,
      articles: [
        'Como criar minha conta',
        'Como adicionar minha primeira transação',
        'Como configurar meu perfil',
        'Como navegar pela aplicação'
      ]
    },
    {
      title: 'Transações',
      icon: BookOpen,
      articles: [
        'Como adicionar uma transação',
        'Como editar ou excluir transações',
        'Como categorizar transações',
        'Como importar transações'
      ]
    },
    {
      title: 'Integrações',
      icon: Users,
      articles: [
        'Como conectar meu banco',
        'Como sincronizar cartões de crédito',
        'Como integrar investimentos',
        'Solução de problemas de sincronização'
      ]
    },
    {
      title: 'Relatórios',
      icon: TrendingUp,
      articles: [
        'Como visualizar relatórios',
        'Como exportar dados',
        'Como personalizar gráficos',
        'Como interpretar análises'
      ]
    }
  ];

  const faqs = [
    {
      question: 'Como posso começar a usar o FinanceApp?',
      answer: 'É muito simples! Basta criar uma conta gratuita, fazer login e começar a adicionar suas transações. Você pode começar com o plano gratuito que permite até 100 transações por mês.'
    },
    {
      question: 'O FinanceApp é seguro?',
      answer: 'Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança para proteger seus dados financeiros. Suas informações nunca são compartilhadas com terceiros.'
    },
    {
      question: 'Posso integrar com meu banco?',
      answer: 'Sim! Oferecemos integração com os principais bancos brasileiros. A integração é segura e permite sincronização automática de suas transações e saldos.'
    },
    {
      question: 'Como funciona o plano gratuito?',
      answer: 'O plano gratuito permite até 100 transações por mês, dashboard básico, 2 cartões de crédito e suporte por email. É perfeito para começar!'
    },
    {
      question: 'Posso exportar meus dados?',
      answer: 'Sim! Você pode exportar seus dados em diferentes formatos (CSV, PDF) a qualquer momento. Seus dados são seus e você tem controle total sobre eles.'
    },
    {
      question: 'Há suporte em português?',
      answer: 'Sim! Todo nosso suporte é oferecido em português brasileiro, incluindo documentação, chat e atendimento por email.'
    },
    {
      question: 'Como cancelar minha assinatura?',
      answer: 'Você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta. Não há taxas de cancelamento.'
    },
    {
      question: 'Posso usar em múltiplos dispositivos?',
      answer: 'Sim! O FinanceApp funciona em web e em breve estará disponível para mobile e tablet. Seus dados são sincronizados automaticamente entre todos os dispositivos.'
    }
  ];

  const supportOptions = [
    {
      icon: Mail,
      title: 'Email',
      description: 'Resposta em até 24 horas',
      action: 'financeapp84@gmail.com',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Chat Online',
      description: 'Suporte em tempo real',
      action: 'Iniciar Chat',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: BookOpen,
      title: 'Base de Conhecimento',
      description: 'Artigos e tutoriais',
      action: 'Explorar',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Video,
      title: 'Vídeos Tutoriais',
      description: 'Guias em vídeo',
      action: 'Assistir',
      color: 'from-red-500 to-red-600'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Central de <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Ajuda</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Encontre respostas rápidas para suas dúvidas e aprenda a usar o FinanceApp de forma eficiente.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar ajuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Como podemos ajudar?
            </h3>
            <p className="text-xl text-gray-400">
              Escolha a melhor forma de obter suporte
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center hover:border-slate-600 transition-all duration-200">
                  <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{option.title}</h4>
                  <p className="text-gray-400 mb-4">{option.description}</p>
                  <button className="text-blue-400 hover:text-blue-300 font-semibold">
                    {option.action}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Perguntas Frequentes
            </h3>
            <p className="text-xl text-gray-400">
              Respostas para as dúvidas mais comuns
            </p>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700 transition-colors"
                >
                  <h4 className="text-lg font-semibold text-white">{faq.question}</h4>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-6 py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Artigos por Categoria
            </h3>
            <p className="text-xl text-gray-400">
              Encontre ajuda organizada por tópicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">{category.title}</h4>
                  </div>
                  <ul className="space-y-3">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 hover:text-white cursor-pointer transition-colors">
                          {article}
                        </span>
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
            Ainda precisa de ajuda?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Nossa equipe está pronta para ajudar você
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-2xl text-lg">
              <Mail className="w-5 h-5" />
              <span>Enviar Email</span>
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 text-lg">
              Iniciar Chat
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

export default AjudaPage; 
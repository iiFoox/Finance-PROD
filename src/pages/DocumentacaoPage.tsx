import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowLeft,
  BookOpen,
  Code,
  Play,
  Download,
  FileText,
  Video,
  CheckCircle,
  Clock,
  Users,
  Zap
} from 'lucide-react';

const DocumentacaoPage: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Primeiros Passos',
      icon: Play,
      articles: [
        { title: 'Guia de Introdução', duration: '5 min', type: 'Tutorial' },
        { title: 'Configuração Inicial', duration: '10 min', type: 'Guia' },
        { title: 'Primeira Transação', duration: '3 min', type: 'Tutorial' }
      ]
    },
    {
      title: 'Funcionalidades',
      icon: Zap,
      articles: [
        { title: 'Dashboard Completo', duration: '8 min', type: 'Guia' },
        { title: 'Gestão de Transações', duration: '12 min', type: 'Tutorial' },
        { title: 'Relatórios e Gráficos', duration: '15 min', type: 'Guia' },
        { title: 'Metas e Objetivos', duration: '10 min', type: 'Tutorial' }
      ]
    },
    {
      title: 'Integrações',
      icon: Code,
      articles: [
        { title: 'Conectando Bancos', duration: '7 min', type: 'Guia' },
        { title: 'Sincronização de Cartões', duration: '5 min', type: 'Tutorial' },
        { title: 'Investimentos', duration: '12 min', type: 'Guia' }
      ]
    },
    {
      title: 'API e Desenvolvedores',
      icon: FileText,
      articles: [
        { title: 'Documentação da API', duration: '20 min', type: 'Técnico' },
        { title: 'Exemplos de Integração', duration: '15 min', type: 'Código' },
        { title: 'Webhooks', duration: '10 min', type: 'Técnico' }
      ]
    }
  ];

  const quickStart = [
    {
      step: 1,
      title: 'Criar Conta',
      description: 'Registre-se gratuitamente no FinanceApp',
      icon: Users
    },
    {
      step: 2,
      title: 'Configurar Perfil',
      description: 'Adicione suas informações básicas',
      icon: FileText
    },
    {
      step: 3,
      title: 'Adicionar Transações',
      description: 'Comece registrando suas receitas e despesas',
      icon: TrendingUp
    },
    {
      step: 4,
      title: 'Conectar Bancos',
      description: 'Integre suas contas para sincronização automática',
      icon: Code
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
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Documentação</span> Completa
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Aprenda a usar todas as funcionalidades do FinanceApp com nossos guias detalhados, 
            tutoriais em vídeo e documentação técnica.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Comece Rápido
            </h3>
            <p className="text-xl text-gray-400">
              Siga estes passos para começar a usar o FinanceApp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickStart.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center hover:border-slate-600 transition-all duration-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mb-2">{item.step}</div>
                  <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Documentação Organizada
            </h3>
            <p className="text-xl text-gray-400">
              Encontre exatamente o que você precisa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white">{section.title}</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {section.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h5 className="text-white font-semibold">{article.title}</h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{article.duration}</span>
                              </span>
                              <span className="px-2 py-1 bg-gray-600 rounded-full text-xs">
                                {article.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="text-blue-400 hover:text-blue-300">
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="px-6 py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Tutoriais em Vídeo
            </h3>
            <p className="text-xl text-gray-400">
              Aprenda visualmente com nossos tutoriais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Primeiros Passos', duration: '5:30', thumbnail: '🎬' },
              { title: 'Dashboard Completo', duration: '8:15', thumbnail: '📊' },
              { title: 'Integrações', duration: '12:45', thumbnail: '🔗' },
              { title: 'Relatórios', duration: '10:20', thumbnail: '📈' },
              { title: 'Metas Financeiras', duration: '7:30', thumbnail: '🎯' },
              { title: 'Dicas Avançadas', duration: '15:10', thumbnail: '⚡' }
            ].map((video, index) => (
              <div key={index} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200 cursor-pointer">
                <div className="text-4xl mb-4">{video.thumbnail}</div>
                <h4 className="text-lg font-bold text-white mb-2">{video.title}</h4>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Video className="w-4 h-4" />
                  <span>{video.duration}</span>
                </div>
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
            Acesse a documentação completa e comece a usar o FinanceApp hoje mesmo
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
              Baixar PDF
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

export default DocumentacaoPage; 
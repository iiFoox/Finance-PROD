import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowLeft,
  Users,
  Target,
  Shield,
  Globe,
  Award,
  Heart,
  Zap,
  CheckCircle,
  Star,
  Clock
} from 'lucide-react';

const SobrePage: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { number: '50.000+', label: 'Usuários Ativos', icon: Users },
    { number: 'R$ 2.5M+', label: 'Economizados', icon: Target },
    { number: '99.9%', label: 'Uptime', icon: Shield },
    { number: '4.9/5', label: 'Avaliação', icon: Star }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Paixão pelo Cliente',
      description: 'Colocamos nossos usuários em primeiro lugar, sempre buscando a melhor experiência possível.'
    },
    {
      icon: Shield,
      title: 'Segurança em Primeiro Lugar',
      description: 'Protegemos seus dados financeiros com a mais alta tecnologia de segurança disponível.'
    },
    {
      icon: Zap,
      title: 'Inovação Constante',
      description: 'Sempre buscamos novas formas de melhorar e simplificar o controle financeiro.'
    },
    {
      icon: Globe,
      title: 'Acessibilidade',
      description: 'Acreditamos que o controle financeiro deve estar ao alcance de todos.'
    }
  ];

  const team = [
    {
      name: 'Equipe FinanceApp',
      role: 'Fundadores',
      description: 'Uma equipe apaixonada por tecnologia e finanças, dedicada a transformar a vida das pessoas através do controle financeiro inteligente.',
      achievements: [
        'Mais de 5 anos de experiência em fintech',
        'Especialistas em UX/UI e desenvolvimento',
        'Conhecimento profundo do mercado brasileiro',
        'Compromisso com a inovação e qualidade'
      ]
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Nascimento da Ideia',
      description: 'Identificamos a necessidade de uma ferramenta mais intuitiva para controle financeiro pessoal.'
    },
    {
      year: '2021',
      title: 'Desenvolvimento',
      description: 'Começamos a desenvolver o FinanceApp com foco na experiência do usuário.'
    },
    {
      year: '2022',
      title: 'Lançamento Beta',
      description: 'Lançamos a versão beta com os primeiros usuários e feedback valioso.'
    },
    {
      year: '2023',
      title: 'Crescimento Rápido',
      description: 'Alcançamos 10.000 usuários e implementamos recursos avançados.'
    },
    {
      year: '2024',
      title: 'Expansão',
      description: 'Chegamos a 50.000+ usuários e continuamos crescendo e melhorando.'
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
            Sobre o <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">FinanceApp</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transformando vidas através do controle financeiro inteligente. 
            Nossa missão é democratizar o acesso a ferramentas financeiras poderosas e fáceis de usar.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
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

      {/* Mission Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold text-white mb-6">
                Nossa Missão
              </h3>
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                Democratizar o acesso a ferramentas financeiras poderosas, 
                tornando o controle financeiro acessível, intuitivo e eficaz para todos.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                Acreditamos que o conhecimento financeiro é fundamental para 
                a independência e prosperidade das pessoas. Por isso, criamos 
                uma plataforma que combina tecnologia avançada com simplicidade.
              </p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Objetivo Claro</h4>
                    <p className="text-gray-400">Transformar vidas através do controle financeiro</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Foco no Usuário</h4>
                    <p className="text-gray-400">Experiência intuitiva e funcionalidades poderosas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Segurança Total</h4>
                    <p className="text-gray-400">Proteção de dados com tecnologia de ponta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Nossos Valores
            </h3>
            <p className="text-xl text-gray-400">
              Os princípios que guiam tudo o que fazemos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4">{value.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Nossa Equipe
            </h3>
            <p className="text-xl text-gray-400">
              Conheça as pessoas por trás do FinanceApp
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                <div className="text-center mb-8">
                  <h4 className="text-2xl font-bold text-white mb-2">{member.name}</h4>
                  <p className="text-blue-400 font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
                    {member.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {member.achievements.map((achievement, achievementIndex) => (
                    <div key={achievementIndex} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="px-6 py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Nossa Jornada
            </h3>
            <p className="text-xl text-gray-400">
              Uma história de crescimento e inovação
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-slate-700 h-full"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 px-8">
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                      <div className="text-2xl font-bold text-blue-400 mb-2">{item.year}</div>
                      <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-slate-800"></div>
                  <div className="w-1/2 px-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Faça parte da nossa história
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de pessoas que já transformaram suas finanças com o FinanceApp
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

export default SobrePage; 
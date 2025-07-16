import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Activity,
  Wifi,
  Server,
  Database,
  Shield,
  RefreshCw
} from 'lucide-react';

const StatusPage: React.FC = () => {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulação de status dos serviços
  const services = [
    {
      name: 'API Principal',
      status: 'operational',
      description: 'Serviços principais da aplicação',
      icon: Server,
      uptime: '99.99%',
      responseTime: '45ms'
    },
    {
      name: 'Banco de Dados',
      status: 'operational',
      description: 'Armazenamento de dados',
      icon: Database,
      uptime: '99.95%',
      responseTime: '12ms'
    },
    {
      name: 'Autenticação',
      status: 'operational',
      description: 'Sistema de login e segurança',
      icon: Shield,
      uptime: '99.98%',
      responseTime: '28ms'
    },
    {
      name: 'Integrações Bancárias',
      status: 'operational',
      description: 'Conexão com bancos e cartões',
      icon: Wifi,
      uptime: '99.92%',
      responseTime: '150ms'
    },
    {
      name: 'Notificações',
      status: 'operational',
      description: 'Sistema de alertas e emails',
      icon: Activity,
      uptime: '99.89%',
      responseTime: '75ms'
    }
  ];

  const incidents = [
    {
      id: 1,
      title: 'Manutenção Programada - Integrações',
      status: 'resolved',
      date: '2024-01-15',
      description: 'Manutenção programada para melhorar a performance das integrações bancárias.',
      impact: 'minor'
    },
    {
      id: 2,
      title: 'Atualização de Segurança',
      status: 'resolved',
      date: '2024-01-10',
      description: 'Atualização de segurança aplicada com sucesso.',
      impact: 'none'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-400';
      case 'degraded':
        return 'text-yellow-400';
      case 'outage':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'outage':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'none':
        return 'bg-green-500/20 text-green-400';
      case 'minor':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'major':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const overallStatus = services.every(service => service.status === 'operational') 
    ? 'operational' 
    : 'degraded';

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
            Status do <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Sistema</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Monitore o status de todos os nossos serviços em tempo real. 
            Mantemos você informado sobre qualquer interrupção ou manutenção.
          </p>

          {/* Overall Status */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {getStatusIcon(overallStatus)}
              <h3 className="text-2xl font-bold text-white">
                Status Geral: 
                <span className={`ml-2 ${getStatusColor(overallStatus)}`}>
                  {overallStatus === 'operational' ? 'Operacional' : 'Degradado'}
                </span>
              </h3>
            </div>
            <p className="text-gray-400 mb-4">
              Todos os sistemas estão funcionando normalmente
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Última atualização: {lastUpdated.toLocaleTimeString()}</span>
              <button 
                onClick={() => setLastUpdated(new Date())}
                className="ml-2 text-blue-400 hover:text-blue-300"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Status dos Serviços
            </h3>
            <p className="text-xl text-gray-400">
              Monitoramento em tempo real de todos os componentes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{service.name}</h4>
                        <p className="text-sm text-gray-400">{service.description}</p>
                      </div>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-green-400 font-semibold">{service.uptime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tempo de Resposta:</span>
                      <span className="text-blue-400 font-semibold">{service.responseTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Incidents */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-white mb-4">
              Incidentes Recentes
            </h3>
            <p className="text-xl text-gray-400">
              Histórico de interrupções e manutenções
            </p>
          </div>

          <div className="space-y-6">
            {incidents.map((incident, index) => (
              <div key={index} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(incident.status)}
                    <div>
                      <h4 className="text-lg font-bold text-white">{incident.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{incident.date}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getImpactColor(incident.impact)}`}>
                          {incident.impact === 'none' ? 'Sem Impacto' : 
                           incident.impact === 'minor' ? 'Impacto Menor' : 'Impacto Maior'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed">{incident.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Precisa de ajuda?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Nossa equipe está sempre pronta para ajudar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/ajuda')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center space-x-2 shadow-2xl text-lg"
            >
              <span>Central de Ajuda</span>
              <TrendingUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/contato')}
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 text-lg"
            >
              Entrar em Contato
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

export default StatusPage; 
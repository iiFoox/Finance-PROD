import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { 
  Home, 
  CreditCard, 
  Target, 
  TrendingUp, 
  Settings, 
  User, 
  LogOut, 
  Bell,
  Menu,
  X,
  Landmark,
  PiggyBank,
  Bitcoin
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import ChatBot from './ChatBot';


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { 
    selectedYear, 
    selectedMonth, 
    setSelectedDate, 
    getUnreadNotificationsCount 
  } = useFinance();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);

  const unreadCount = getUnreadNotificationsCount();

  // Itens principais do menu
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'expenses', label: 'Transações', icon: CreditCard, path: '/expenses' },
    { id: 'banks', label: 'Bancos', icon: Landmark, path: '/banks' },
    { id: 'budgets', label: 'Orçamentos', icon: Target, path: '/budgets' },
    { id: 'goals', label: 'Metas', icon: PiggyBank, path: '/goals' },
    { id: 'investments', label: 'Investimentos', icon: Bitcoin, path: '/investments' },
  ];

  // Itens de usuário (ficarão na parte inferior)
  const userMenuItems = [
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
  ];

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const handleTabChange = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  const handleDateChange = (year: number, month: number) => {
    setSelectedDate(year, month);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FinanceApp</span>
            </div>
          </div>

          {/* Date Selectors */}
          <div className="p-3 lg:p-4 border-b border-slate-700">
            <div className="space-y-2 lg:space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Ano
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleDateChange(parseInt(e.target.value), selectedMonth)}
                  className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white"
                  aria-label="Selecionar ano"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Mês
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => handleDateChange(selectedYear, parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white"
                  aria-label="Selecionar mês"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6 space-y-1 lg:space-y-2">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.path)}
                  className={`w-full flex items-center space-x-2 lg:space-x-3 px-3 py-2 lg:py-3 rounded-lg text-left transition-colors duration-200 text-sm lg:text-base ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${isActive ? 'text-white' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-3 lg:p-4 border-t border-slate-700">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-3 lg:mb-4">
              <img 
                src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.name || user?.email?.split('@')[0] || 'User')}&background=3b82f6&color=ffffff&size=40`}
                alt="Avatar"
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-medium text-white truncate">
                  {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            
            {/* Menu items de usuário */}
            <div className="space-y-1 mb-3">
              {userMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.path)}
                    className={`w-full flex items-center space-x-2 lg:space-x-3 px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-left transition-colors duration-200 text-xs lg:text-sm ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3 h-3 lg:w-4 lg:h-4 ${isActive ? 'text-white' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 lg:space-x-3 px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors text-xs lg:text-sm"
            >
              <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-16 bg-slate-800 border-b border-slate-700">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
                aria-label="Abrir menu lateral"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {[...mainMenuItems, ...userMenuItems].find(item => item.path === location.pathname)?.label || 'Dashboard'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors relative"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      )}

      {/* Chat Bot */}
        <ChatBot isOpen={showChatBot} onToggle={() => setShowChatBot(!showChatBot)} />
    </div>
  );
};

export default Layout;
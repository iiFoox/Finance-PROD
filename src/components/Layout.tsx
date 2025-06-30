import React, { useState } from 'react';
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
  PiggyBank
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import ChatBot from './ChatBot';

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab = 'dashboard', onTabChange }) => {
  const { user, logout } = useAuth();
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'expenses', label: 'Transações', icon: CreditCard },
    { id: 'banks', label: 'Bancos', icon: Landmark },
    { id: 'budgets', label: 'Orçamentos', icon: Target },
    { id: 'goals', label: 'Metas', icon: PiggyBank },
  ];

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const handleTabChange = (tab: string) => {
    onTabChange?.(tab);
    setIsSidebarOpen(false);
  };

  const handleDateChange = (year: number, month: number) => {
    setSelectedDate(year, month);
  };

  return (
    <div className="min-h-screen bg-slate-900 transition-colors duration-300">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-700">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-lg lg:text-xl font-bold text-white">FinanceApp</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
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
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
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
                src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
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
            
            <div className="space-y-1">
              <button
                onClick={() => handleTabChange('profile')}
                className="w-full flex items-center space-x-2 lg:space-x-3 px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-left text-gray-300 hover:bg-slate-700 hover:text-white transition-colors text-xs lg:text-sm"
              >
                <User className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>Perfil</span>
              </button>
              
              <button
                onClick={() => handleTabChange('settings')}
                className="w-full flex items-center space-x-2 lg:space-x-3 px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-left text-gray-300 hover:bg-slate-700 hover:text-white transition-colors text-xs lg:text-sm"
              >
                <Settings className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>Configurações</span>
              </button>
              
              <button
                onClick={logout}
                className="w-full flex items-center space-x-2 lg:space-x-3 px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors text-xs lg:text-sm"
              >
                <LogOut className="w-3 h-3 lg:w-4 lg:h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-white capitalize">
                  {activeTab === 'dashboard' ? 'Dashboard' : 
                   activeTab === 'expenses' ? 'Transações' :
                   activeTab === 'banks' ? 'Bancos' :
                   activeTab === 'budgets' ? 'Orçamentos' :
                   activeTab === 'goals' ? 'Metas' :
                   activeTab === 'profile' ? 'Perfil' :
                   activeTab === 'settings' ? 'Configurações' : 'Dashboard'}
                </h1>
                <p className="text-xs lg:text-sm text-gray-400">
                  {months[selectedMonth]} de {selectedYear}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-3">
              <button 
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Notifications Panel */}
      <NotificationPanel 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* ChatBot */}
      <ChatBot 
        isOpen={showChatBot}
        onToggle={() => setShowChatBot(!showChatBot)}
      />
    </div>
  );
};

export default Layout;
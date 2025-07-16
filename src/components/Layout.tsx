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
import { SidebarProvider, SidebarInset, SidebarTrigger } from './ui/sidebar';
import { AppSidebar } from './AppSidebar';

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
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadCount = getUnreadNotificationsCount();

  // Menu items para identificar a página atual
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'expenses', label: 'Transações', path: '/expenses' },
    { id: 'banks', label: 'Bancos', path: '/banks' },
    { id: 'budgets', label: 'Orçamentos', path: '/budgets' },
    { id: 'goals', label: 'Metas', path: '/goals' },
    { id: 'investments', label: 'Investimentos', path: '/investments' },
    { id: 'settings', label: 'Configurações', path: '/settings' },
  ];

  const currentPageTitle = allMenuItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  const handleTabChange = (path: string) => {
    navigate(path);
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
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen} defaultOpen={false}>
      <div className="flex min-h-screen w-full">
        <div
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
        >
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col">
          <SidebarInset>
            {/* Header */}
            <header className="sticky top-0 z-40 h-16 bg-slate-800 border-b border-slate-700">
              <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="lg:hidden p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors" />
                  <div>
                    <h1 className="text-lg lg:text-xl font-bold text-white">
                      {currentPageTitle}
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
            <main className="flex-1 p-6">
              {children}
            </main>

            {/* Notifications Panel */}
            {showNotifications && (
              <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
            )}

            {/* Chat Bot */}
            <ChatBot isOpen={showChatBot} onToggle={() => setShowChatBot(!showChatBot)} />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
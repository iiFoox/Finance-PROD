import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { 
  Home, 
  CreditCard, 
  Target, 
  TrendingUp, 
  Settings, 
  LogOut,
  Landmark,
  PiggyBank,
  Bitcoin,
  User,
  ChevronRight
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from './ui/sidebar';

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { 
    selectedYear, 
    selectedMonth, 
    setSelectedDate 
  } = useFinance();
  const { state } = useSidebar();

  // Itens principais do menu
  const mainMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'expenses', label: 'Transações', icon: CreditCard, path: '/expenses' },
    { id: 'banks', label: 'Bancos', icon: Landmark, path: '/banks' },
    { id: 'budgets', label: 'Orçamentos', icon: Target, path: '/budgets' },
    { id: 'goals', label: 'Metas', icon: PiggyBank, path: '/goals' },
    { id: 'investments', label: 'Investimentos', icon: Bitcoin, path: '/investments' },
  ];

  // Itens de usuário
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
    <Sidebar 
      variant="sidebar" 
      collapsible="icon" 
      className="group transition-all duration-200"
    >
      <SidebarHeader>
        <div className={`flex items-center justify-center ${state === 'expanded' ? 'px-6 py-6 justify-start' : 'py-1'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            {state === 'expanded' && (
              <span className="text-xl font-bold text-white sidebar-text">
                FinanceApp
              </span>
            )}
          </div>
        </div>
        {state === 'expanded' && <SidebarSeparator className="sidebar-separator" />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {state === 'expanded' && (
            <SidebarGroupLabel className="sidebar-label">
              Menu Principal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isCollapsed = state === 'collapsed';
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
                        transition-all duration-200 ${isCollapsed ? 'h-10' : 'h-12'}'
                      `}
                    >
                      <button
                        onClick={() => handleTabChange(item.path)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center pt-1' : 'px-3 justify-center lg:justify-start'}`}
                      >
                        <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0`} />
                        {state === 'expanded' && (
                          <span className="ml-3 sidebar-text whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="sidebar-separator" />
        {state === 'expanded' && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-6 py-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Período
                  </label>
                  <div className="mt-2 space-y-2">
                    <select
                      value={selectedMonth + 1}
                      onChange={(e) => handleDateChange(selectedYear, parseInt(e.target.value) - 1)}
                      aria-label="Selecionar mês"
                      className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleDateChange(parseInt(e.target.value), selectedMonth)}
                      aria-label="Selecionar ano"
                      className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        {state === 'expanded' && <SidebarSeparator className="sidebar-separator" />}
        <SidebarGroup>
          {state === 'expanded' && (
            <SidebarGroupLabel className="sidebar-label">
              Configurações
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isCollapsed = state === 'collapsed';
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700 hover:text-white'}
                        transition-all duration-200 ${isCollapsed ? 'h-10' : 'h-12'}'
                      `}
                    >
                      <button
                        onClick={() => handleTabChange(item.path)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center pt-1' : 'px-3 justify-center lg:justify-start'}`}
                      >
                        <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0`} />
                        {state === 'expanded' && (
                          <span className="ml-3 sidebar-text whitespace-nowrap">
                            {item.label}
                          </span>
                        )}
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            {state === 'expanded' ? (
              <>
                <div className="flex items-center space-x-3 px-3 py-3">
                  <img 
                    src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.name || user?.email?.split('@')[0] || 'User')}&background=3b82f6&color=ffffff&size=40`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 sidebar-text">
                    <p className="text-sm font-medium text-white truncate sidebar-text">
                      {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-400 truncate sidebar-text">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className="text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 h-12"
                    >
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-3"
                      >
                        <LogOut className="w-6 h-6 flex-shrink-0" />
                        <span className="ml-3 sidebar-text whitespace-nowrap">
                          Sair
                        </span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </>
            ) : (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={`
                      text-gray-300 hover:bg-slate-700 hover:text-white
                      transition-all duration-200 ${state === 'collapsed' ? 'h-10' : 'h-12'}
                      ${state === 'collapsed' ? '!w-10 !h-10 !p-0 !justify-center !mx-auto' : ''}
                    `}
                  >
                    <button
                      className={`w-full h-full flex items-center ${state === 'collapsed' ? 'justify-center !p-0 pt-1' : 'px-3 justify-center lg:justify-start'}`}
                      aria-label="Perfil do usuário"
                    >
                      <img 
                        src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.name || user?.email?.split('@')[0] || 'User')}&background=3b82f6&color=ffffff&size=32`}
                        alt="Avatar"
                        className={`${state === 'collapsed' ? 'w-5 h-5' : 'w-6 h-6'} rounded-full object-cover flex-shrink-0`}
                      />
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={`
                      text-red-400 hover:bg-red-900/20 hover:text-red-300
                      transition-all duration-200 ${state === 'collapsed' ? 'h-10' : 'h-12'}
                      ${state === 'collapsed' ? '!w-10 !h-10 !p-0 !justify-center !mx-auto' : ''}
                    `}
                  >
                    <button
                      onClick={handleSignOut}
                      className={`w-full h-full flex items-center ${state === 'collapsed' ? 'justify-center !p-0' : 'px-3 justify-center lg:justify-start'}`}
                      aria-label="Sair da aplicação"
                    >
                      <LogOut className={`${state === 'collapsed' ? 'w-5 h-5' : 'w-6 h-6'} flex-shrink-0`} />
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
} 
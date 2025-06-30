import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FinanceProvider, useFinance } from './contexts/FinanceContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import BanksPage from './pages/BanksPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import Layout from './components/Layout';

const AppContent: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isLoading: financeLoading } = useFinance();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const isLoading = authLoading || financeLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o usuário está logado, vai direto para o dashboard
  if (user) {
    const renderPage = () => {
      switch (activeTab) {
        case 'dashboard':
          return <DashboardPage />;
        case 'expenses':
          return <ExpensesPage />;
        case 'banks':
          return <BanksPage />;
        case 'budgets':
          return <BudgetsPage />;
        case 'goals':
          return <GoalsPage />;
        case 'profile':
          return (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-gray-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Perfil</h2>
              <p className="text-gray-600 dark:text-gray-400">Em desenvolvimento...</p>
            </div>
          );
        case 'settings':
          return (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-gray-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Configurações</h2>
              <p className="text-gray-600 dark:text-gray-400">Em desenvolvimento...</p>
            </div>
          );
        default:
          return <DashboardPage />;
      }
    };

    return (
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderPage()}
      </Layout>
    );
  }

  // Se não está logado, mostra landing page ou auth
  if (!showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // Mostra telas de autenticação
  if (authMode === 'register') {
    return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
  }
  
  return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <AppContent />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import BanksPage from './pages/BanksPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import SettingsPage from './pages/Settings';
import InvestmentsPage from './pages/InvestmentsPage';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import RecursosPage from './pages/RecursosPage';
import PrecosPage from './pages/PrecosPage';
import ContatoPage from './pages/ContatoPage';
import SobrePage from './pages/SobrePage';
import IntegracoesPage from './pages/IntegracoesPage';
import AjudaPage from './pages/AjudaPage';
import DocumentacaoPage from './pages/DocumentacaoPage';
import StatusPage from './pages/StatusPage';

// PrivateRoute protege as rotas que exigem autenticação
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public routes são para páginas como Login e Register
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

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

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// AppContent gerencia todas as rotas
const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Páginas Públicas - Removido PublicRoute para funcionar no Vercel */}
      <Route path="/recursos" element={<RecursosPage />} />
      <Route path="/precos" element={<PrecosPage />} />
      <Route path="/contato" element={<ContatoPage />} />
      <Route path="/sobre" element={<SobrePage />} />
      <Route path="/integracoes" element={<IntegracoesPage />} />
      <Route path="/ajuda" element={<AjudaPage />} />
      <Route path="/documentacao" element={<DocumentacaoPage />} />
      <Route path="/status" element={<StatusPage />} />
      
      {/* Rotas Privadas */}
      <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
      <Route path="/expenses" element={<PrivateRoute><Layout><ExpensesPage /></Layout></PrivateRoute>} />
      <Route path="/banks" element={<PrivateRoute><Layout><BanksPage /></Layout></PrivateRoute>} />
      <Route path="/budgets" element={<PrivateRoute><Layout><BudgetsPage /></Layout></PrivateRoute>} />
      <Route path="/goals" element={<PrivateRoute><Layout><GoalsPage /></Layout></PrivateRoute>} />
      <Route path="/investments" element={<PrivateRoute><Layout><InvestmentsPage /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><SettingsPage /></Layout></PrivateRoute>} />

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// App configura os providers
function App() {
  return (
    <Router>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <FinanceProvider>
              <AppContent />
            </FinanceProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
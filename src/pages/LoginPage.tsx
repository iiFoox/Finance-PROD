import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, TrendingUp, Loader2, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string>('');
  const [localLoading, setLocalLoading] = useState<boolean>(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLocalError('');
    setLocalLoading(true);
    
    if (!email || !password) {
      setLocalError('Por favor, preencha todos os campos.');
      setLocalLoading(false);
      return;
    }

    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        let errorMessage = 'Email ou senha incorretos. Tente novamente.';

        if (supabaseError.message.toLowerCase().includes('email not confirmed')) {
          errorMessage = `Seu email ainda não foi confirmado. Verifique sua caixa de entrada.`;
        }
        
        setLocalError(errorMessage);
      } else if (data.user) {
        // Login bem-sucedido - o useEffect vai redirecionar automaticamente
        // quando o AuthContext detectar o usuário logado
      }
    } catch (error: any) {
      setLocalError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex flex-col items-center hover:opacity-80 transition-opacity"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">FinanceApp</h1>
            <p className="text-gray-400">Controle seus gastos de forma inteligente</p>
          </button>
        </div>

        {/* Card de Login */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Bem-vindo!</h2>
            <p className="text-gray-400">Entre em sua conta para continuar</p>
          </div>

          {/* Mensagem de Erro */}
          {localError && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{localError}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="seu@email.com"
                disabled={localLoading}
                required
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-gray-400 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Sua senha"
                  disabled={localLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700"
                  disabled={localLoading}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Link Esqueci Senha */}
            <div className="flex items-center justify-end">
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700 rounded"
                aria-label="Esqueci minha senha"
              >
                Esqueci minha senha
              </button>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={localLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all duration-300"
            >
              {localLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Link para Registro */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700 rounded"
                disabled={localLoading}
                aria-label="Criar nova conta"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
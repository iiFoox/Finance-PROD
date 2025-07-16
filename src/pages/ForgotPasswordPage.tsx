import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHelpers } from '../lib/supabaseAuth';
import { Eye, EyeOff, TrendingUp, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    if (!email) {
      setError('Por favor, insira seu email.');
      setIsLoading(false);
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um email válido.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authHelpers.sendPasswordResetEmail(email);

      if (!result.success) {
        setError(result.error || 'Erro ao enviar email de redefinição. Verifique se o email está correto e tente novamente.');
      } else {
        setSuccess('Email de redefinição enviado! Verifique sua caixa de entrada e siga as instruções.');
      }
    } catch (error: any) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
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
            <p className="text-gray-400">Redefinir senha</p>
          </button>
        </div>

        {/* Card de Redefinição */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Esqueceu sua senha?</h2>
            <p className="text-gray-400 mt-2">
              Não se preocupe! Insira seu email e enviaremos um link para redefinir sua senha.
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-green-300 font-medium">{success}</p>
                <p className="text-xs text-green-400 mt-1">
                  Se não encontrar o email, verifique sua pasta de spam.
                </p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="seu@email.com"
                disabled={isLoading}
                required
                aria-label="Email para redefinição de senha"
              />
            </div>

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all duration-300"
              aria-label="Enviar email de redefinição"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Email de Redefinição'
              )}
            </button>
          </form>

          {/* Links de Navegação */}
          <div className="mt-8 space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center text-gray-400 hover:text-gray-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700 rounded"
              disabled={isLoading}
              aria-label="Voltar para página de login"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o Login
            </button>
            
            <div className="text-center">
              <p className="text-gray-400">
                Não tem uma conta?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700 rounded"
                  disabled={isLoading}
                  aria-label="Criar nova conta"
                >
                  Criar conta
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 
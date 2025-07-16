import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { authHelpers } from '../lib/supabaseAuth';
import { Eye, EyeOff, TrendingUp, Loader2, AlertCircle, CheckCircle, Check, X } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const passwordRequirements = [
    { label: 'Pelo menos 8 caracteres', valid: formData.password.length >= 8 },
    { label: 'Uma letra minúscula', valid: /[a-z]/.test(formData.password) },
    { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(formData.password) },
    { label: 'Um número', valid: /\d/.test(formData.password) },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.valid);

  useEffect(() => {
    const checkToken = async () => {
      try {
        console.log('🔍 Verificando parâmetros da URL...');
        
        // Primeiro, verificar se há uma sessão ativa
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Sessão ativa encontrada para:', session.user.email);
          setIsValidToken(true);
          setIsCheckingToken(false);
          return;
        }
        
        // Se não há sessão, verificar tokens na URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        
        console.log('📋 Parâmetros encontrados:', {
          accessToken: accessToken ? 'Presente' : 'Ausente',
          refreshToken: refreshToken ? 'Presente' : 'Ausente',
          url: window.location.href
        });
        
        if (accessToken && refreshToken) {
          console.log('🔄 Tentando estabelecer sessão com tokens...');
          
          // Tentar fazer login com os tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          console.log('📊 Resultado do setSession:', {
            success: !error,
            hasUser: !!data.user,
            error: error?.message
          });

          if (error) {
            console.error('❌ Erro ao estabelecer sessão:', error);
            setError('Link de redefinição inválido ou expirado. Solicite um novo link.');
            setIsValidToken(false);
          } else if (data.user) {
            console.log('✅ Sessão estabelecida com sucesso para:', data.user.email);
            setIsValidToken(true);
          } else {
            console.error('❌ Nenhum usuário encontrado na sessão');
            setError('Link de redefinição inválido. Solicite um novo link.');
            setIsValidToken(false);
          }
        } else {
          console.error('❌ Tokens não encontrados na URL');
          console.log('🔍 URL completa:', window.location.href);
          console.log('🔍 Hash da URL:', window.location.hash);
          
          // Tentar extrair tokens do hash da URL (caso estejam lá)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashAccessToken = hashParams.get('access_token');
          const hashRefreshToken = hashParams.get('refresh_token');
          
          if (hashAccessToken && hashRefreshToken) {
            console.log('🔄 Tokens encontrados no hash, tentando estabelecer sessão...');
            
            const { data, error } = await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken,
            });

            if (error) {
              console.error('❌ Erro ao estabelecer sessão com tokens do hash:', error);
              setError('Link de redefinição inválido ou expirado. Solicite um novo link.');
              setIsValidToken(false);
            } else if (data.user) {
              console.log('✅ Sessão estabelecida com sucesso usando tokens do hash');
              setIsValidToken(true);
            } else {
              setError('Link de redefinição inválido. Solicite um novo link.');
              setIsValidToken(false);
            }
          } else {
            setError('Link de redefinição inválido. Solicite um novo link.');
            setIsValidToken(false);
          }
        }
      } catch (error) {
        console.error('🔥 Erro inesperado ao verificar token:', error);
        setError('Erro ao verificar o link de redefinição. Tente novamente.');
        setIsValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos mínimos.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authHelpers.updateUserPassword(formData.password);

      if (!result.success) {
        setError(result.error || 'Erro ao atualizar a senha. Tente novamente.');
      } else {
        setSuccess('Senha atualizada com sucesso! Redirecionando para o login...');
        
        // Fazer logout para garantir que o usuário precise fazer login novamente
        await authHelpers.signOut();
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error: any) {
      setError('Erro ao atualizar a senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-400">Verificando link de redefinição...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex flex-col items-center hover:opacity-80 transition-opacity"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">FinanceApp</h1>
              <p className="text-gray-400">Link inválido</p>
            </button>
          </div>

          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Link Inválido</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              
              {/* Debug Info - Remover em produção */}
              {import.meta.env.DEV && (
                <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-left">
                  <h3 className="text-yellow-300 font-semibold mb-2">Debug Info:</h3>
                  <div className="text-xs text-yellow-400 space-y-1">
                    <p><strong>URL:</strong> {window.location.href}</p>
                    <p><strong>Hash:</strong> {window.location.hash}</p>
                    <p><strong>Search:</strong> {window.location.search}</p>
                    <p><strong>Access Token:</strong> {searchParams.get('access_token') ? 'Presente' : 'Ausente'}</p>
                    <p><strong>Refresh Token:</strong> {searchParams.get('refresh_token') ? 'Presente' : 'Ausente'}</p>
                  </div>
                  
                  <button
                    onClick={async () => {
                      const result = await authHelpers.testConfiguration();
                      console.log('🧪 Resultado do teste:', result);
                      alert(`Teste de configuração: ${result.success ? 'Sucesso' : 'Falha'}\n${result.error || ''}`);
                    }}
                    className="mt-3 w-full bg-yellow-600 text-white py-2 px-3 rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Testar Configuração Supabase
                  </button>
                </div>
              )}
              
              <button
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Solicitar Novo Link
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full mt-4 text-gray-400 hover:text-gray-300 font-medium transition-colors"
              >
                Voltar para o Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-gray-400">Nova senha</p>
          </button>
        </div>

        {/* Card de Redefinição */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Definir Nova Senha</h2>
            <p className="text-gray-400 mt-2">
              Digite sua nova senha abaixo.
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
              <p className="text-sm text-green-300">{success}</p>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nova Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Nova Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-gray-400 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Sua nova senha"
                  disabled={isLoading}
                  required
                  aria-label="Nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700"
                  disabled={isLoading}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 p-3 bg-slate-700 rounded-lg">
                  <p className="text-xs font-medium text-gray-300 mb-2">Requisitos da senha:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {req.valid ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <X className="w-3 h-3 text-red-400" />
                        )}
                        <span className={`text-xs ${req.valid ? 'text-green-400' : 'text-red-400'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Nova Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-gray-400 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Confirme sua nova senha"
                  disabled={isLoading}
                  required
                  aria-label="Confirmar nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700"
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                  title={showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão de Atualização */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordValid || formData.password !== formData.confirmPassword}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transition-all duration-300"
              aria-label="Atualizar senha"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Atualizando...
                </>
              ) : (
                'Atualizar Senha'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 
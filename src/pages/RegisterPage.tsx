import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Eye, EyeOff, TrendingUp, Loader2, Check, X } from 'lucide-react';
import FinanceAppLogo from '../components/FinanceAppLogo';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { register, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const passwordRequirements = [
    { label: 'Pelo menos 8 caracteres', valid: formData.password.length >= 8 },
    { label: 'Uma letra minúscula', valid: /[a-z]/.test(formData.password) },
    { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(formData.password) },
    { label: 'Um número', valid: /\d/.test(formData.password) },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.valid);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      console.log('Toast: Mostrando erro de validação');
      showError('Erro de validação', 'Por favor, preencha todos os campos');
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log('Toast: Mostrando erro de email inválido');
      showError('Email inválido', 'Por favor, insira um email válido');
      return;
    }

    if (!isPasswordValid) {
      console.log('Toast: Mostrando erro de senha inválida');
      showError('Senha inválida', 'A senha não atende aos requisitos mínimos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('Toast: Mostrando erro de senhas não coincidem');
      showError('Senhas não coincidem', 'As senhas não coincidem');
      return;
    }

    if (!acceptTerms) {
      console.log('Toast: Mostrando erro de termos não aceitos');
      showError('Termos não aceitos', 'Você deve aceitar os termos de uso');
      return;
    }

    try {
      console.log('Tentando registrar usuário:', formData.email);
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        console.log('Toast: Mostrando sucesso do registro');
        showSuccess(
          'Conta criada com sucesso!', 
          `Verifique seu email (${formData.email}) para confirmar a conta.`,
          8000
        );
        
        // Limpar formulário
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setAcceptTerms(false);
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Tratar erros específicos
        let errorMessage = result.error || 'Erro ao criar conta. Verifique os dados e tente novamente.';
        
        if (errorMessage.toLowerCase().includes('email already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.';
        } else if (errorMessage.toLowerCase().includes('password')) {
          errorMessage = 'A senha não atende aos requisitos de segurança.';
        } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (errorMessage.toLowerCase().includes('database error')) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
        } else if (errorMessage.toLowerCase().includes('rate limit') || errorMessage.toLowerCase().includes('too many requests')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
        } else if (errorMessage.toLowerCase().includes('email rate limit exceeded')) {
          errorMessage = 'Limite de emails excedido. Aguarde alguns minutos antes de tentar novamente.';
        }
        
        showError('Erro no registro', errorMessage);
      }
    } catch (err: any) {
      console.error('Erro no registro:', err);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (err.message) {
        if (err.message.toLowerCase().includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (err.message.toLowerCase().includes('timeout')) {
          errorMessage = 'Tempo limite excedido. Tente novamente.';
        } else if (err.message.toLowerCase().includes('database')) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
        } else if (err.message.toLowerCase().includes('rate limit') || err.message.toLowerCase().includes('too many requests')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
        } else if (err.message.toLowerCase().includes('email rate limit exceeded')) {
          errorMessage = 'Limite de emails excedido. Aguarde alguns minutos antes de tentar novamente.';
        } else {
          errorMessage = err.message;
        }
      }
      
      showError('Erro no registro', errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="hover:opacity-80 transition-opacity"
          >
            <FinanceAppLogo size={64} showText={true} variant="vertical" />
          </button>
        </div>

        {/* Register Form */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 backdrop-blur-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Criar Conta</h2>
            <p className="text-gray-400">Preencha os dados para começar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white placeholder-gray-400 transition-colors"
                placeholder="Seu nome completo"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white placeholder-gray-400 transition-colors"
                placeholder="seu@email.com"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white placeholder-gray-400 pr-12 transition-colors"
                  placeholder="Sua senha"
                  disabled={isLoading}
                  required
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-700 text-white placeholder-gray-400 pr-12 transition-colors"
                  placeholder="Confirme sua senha"
                  disabled={isLoading}
                  required
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

            <div className="flex items-start">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                disabled={isLoading}
              />
              <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-400">
                Eu aceito os{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  termos de uso
                </a>{' '}
                e{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  política de privacidade
                </a>.
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center shadow-lg transition-all duration-300">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar minha conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem uma conta?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="text-blue-400 hover:text-blue-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-700 rounded" 
                disabled={isLoading}
                aria-label="Ir para página de login"
              >
                Entrar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
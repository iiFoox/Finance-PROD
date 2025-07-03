import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type ErrorType = 'general' | 'wrong_password' | 'user_not_found' | 'invalid_credentials' | 'rate_limit' | 'network_error' | 'email_not_confirmed' | null;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name: string; avatar_url?: string }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  errorType: ErrorType;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);

  const clearError = () => {
    setError(null);
    setErrorType(null);
  };

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Erro ao obter sessão:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    clearError();

    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        console.error('❌ SUPABASE: Erro no login:', supabaseError.message);
        const errorMessage = supabaseError.message.toLowerCase();

        let userFriendlyMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';

        if (errorMessage.includes('email not confirmed')) {
          setErrorType('email_not_confirmed');
          userFriendlyMessage = `Seu email (${email}) ainda não foi confirmado. Verifique sua caixa de entrada.`;
        } else if (errorMessage.includes('invalid login credentials')) {
          setErrorType('invalid_credentials');
          userFriendlyMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else {
          setErrorType('general');
          userFriendlyMessage = supabaseError.message;
        }

        setError(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      } else if (data.user) {
        setUser(data.user);
        clearError();
      } else {
        const errorMsg = 'Ocorreu um erro desconhecido durante o login.';
        setErrorType('general');
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error('🔥 App: Erro no catch do login:', err);
      
      if (err.message && (err.message.includes('Email ou senha') || err.message.includes('email'))) {
        throw err;
      }
      
      const networkError = 'Erro de conexão. Verifique sua internet e tente novamente.';
      setErrorType('network_error');
      setError(networkError);
      throw new Error(networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
          }
        }
      });

      if (error) {
        console.error('Erro no registro:', error.message);
        return { success: false, error: error.message };
      }

      // Se o usuário foi criado com sucesso
      if (data.user) {
        // Verificar se precisa de confirmação de email
        if (data.user.email_confirmed_at) {
          setUser(data.user);
        } else {
          // Email de confirmação foi enviado
          console.log('Email de confirmação enviado para:', email);
        }
        return { success: true };
      }

      return { success: false, error: 'Erro ao criar usuário' };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: 'Erro de conexão' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error.message);
      }
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name: string; avatar_url?: string }) => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          avatar_url: data.avatar_url,
        }
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    isLoading,
    error,
    errorType,
    clearError,
    register,
    logout,
    signOut: logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
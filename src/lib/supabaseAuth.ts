import { supabase } from './supabase';

// Configurações de autenticação
export const authConfig = {
  // Configurações de email
  email: {
    // Template de email para redefinição de senha
    resetPasswordTemplate: {
      subject: 'Redefinir sua senha - FinanceApp',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FinanceApp</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Redefinir sua senha</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Olá! Você solicitou a redefinição da sua senha no FinanceApp.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              Clique no botão abaixo para definir uma nova senha:
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="{{ .ConfirmationURL }}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Redefinir Senha
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Se você não solicitou esta redefinição, pode ignorar este email com segurança.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Este link expira em 24 horas por motivos de segurança.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Este é um email automático, não responda a esta mensagem.
            </p>
          </div>
        </div>
      `
    },
    
    // Template de email de confirmação
    confirmEmailTemplate: {
      subject: 'Confirme seu email - FinanceApp',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FinanceApp</h1>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Confirme seu email</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Olá! Obrigado por se cadastrar no FinanceApp.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
              Para ativar sua conta, clique no botão abaixo:
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="{{ .ConfirmationURL }}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        display: inline-block;
                        font-weight: bold;">
                Confirmar Email
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Após confirmar seu email, você poderá acessar todas as funcionalidades do FinanceApp.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              Este é um email automático, não responda a esta mensagem.
            </p>
          </div>
        </div>
      `
    }
  },
  
  // Configurações de segurança
  security: {
    // Tempo de expiração do token de redefinição (em segundos)
    resetTokenExpiry: 24 * 60 * 60, // 24 horas
    
    // Requisitos mínimos de senha
    passwordRequirements: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    }
  }
};

// Funções auxiliares para autenticação
export const authHelpers = {
  // Validar requisitos de senha
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < authConfig.security.passwordRequirements.minLength) {
      errors.push(`A senha deve ter pelo menos ${authConfig.security.passwordRequirements.minLength} caracteres`);
    }
    
    if (authConfig.security.passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (authConfig.security.passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    if (authConfig.security.passwordRequirements.requireNumbers && !/\d/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    }
    
    if (authConfig.security.passwordRequirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('A senha deve conter pelo menos um caractere especial');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Enviar email de redefinição de senha
  sendPasswordResetEmail: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔄 Tentando enviar email de redefinição para:', email);
      console.log('📍 URL de redirecionamento:', `${window.location.origin}/reset-password`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('❌ Erro do Supabase:', error);
        
        // Tratamento específico de erros
        if (error.message.includes('SMTP')) {
          return { 
            success: false, 
            error: 'Erro na configuração de email. Verifique as configurações SMTP no Supabase.' 
          };
        }
        
        if (error.message.includes('rate limit')) {
          return { 
            success: false, 
            error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' 
          };
        }
        
        if (error.message.includes('User not found')) {
          return { 
            success: false, 
            error: 'Email não encontrado. Verifique se o email está correto.' 
          };
        }
        
        return { success: false, error: error.message };
      }
      
      console.log('✅ Email de redefinição enviado com sucesso');
      return { success: true };
    } catch (error: any) {
      console.error('🔥 Erro inesperado:', error);
      return { success: false, error: error.message || 'Erro inesperado ao enviar email' };
    }
  },
  
  // Atualizar senha do usuário
  updateUserPassword: async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
  
  // Verificar se o usuário está autenticado
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return !!user;
    } catch {
      return false;
    }
  },
  
  // Fazer logout
  signOut: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Testar configuração do Supabase
  testConfiguration: async (): Promise<{ success: boolean; error?: string; details?: any }> => {
    try {
      console.log('🧪 Testando configuração do Supabase...');
      
      // Verificar se as variáveis de ambiente estão configuradas
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return { 
          success: false, 
          error: 'Variáveis de ambiente do Supabase não configuradas' 
        };
      }
      
      console.log('✅ Variáveis de ambiente configuradas');
      
      // Testar conexão com o Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        return { 
          success: false, 
          error: `Erro na conexão com Supabase: ${error.message}` 
        };
      }
      
      console.log('✅ Conexão com Supabase estabelecida');
      
      return { 
        success: true, 
        details: {
          hasSession: !!data.session,
          userEmail: data.session?.user?.email || 'Nenhum usuário logado'
        }
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: `Erro inesperado: ${error.message}` 
      };
    }
  }
};

export default authConfig; 
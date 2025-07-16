import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserSettings {
  profile: {
    avatar_url: string;
    name: string;
  };
  notifications: {
    dueBills: boolean;
    lowBalance: boolean;
    budgetAlerts: boolean;
    monthlyReport: boolean;
    transactionReminders: boolean;
    goalAchievements: boolean;
    weeklyDigest: boolean;
    investmentUpdates: boolean;
  };
  preferences: {
    defaultBank: string;
    defaultView: 'day' | 'week' | 'month' | 'year';
    currency: 'BRL' | 'USD';
    dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  };
  financial: {
    primaryCurrency: 'BRL' | 'USD';
    secondaryCurrency: 'BRL' | 'USD';
    roundingMethod: 'normal' | 'up' | 'down';
    dailySpendingLimit: string;
    weeklySpendingLimit: string;
    monthlySpendingLimit: string;
    enableSpendingLimits: boolean;
  };
  analytics: {
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    defaultChartType: 'line' | 'bar' | 'pie';
    analysisPeriodia: '3months' | '6months' | '12months';
    smartAlerts: boolean;
    predictiveInsights: boolean;
    categoryTracking: boolean;
    goalTracking: boolean;
  };
}

const defaultSettings: UserSettings = {
  profile: {
    avatar_url: '',
    name: '',
  },
  notifications: {
    dueBills: true,
    lowBalance: true,
    budgetAlerts: true,
    monthlyReport: true,
    transactionReminders: true,
    goalAchievements: true,
    weeklyDigest: false,
    investmentUpdates: true,
  },
  preferences: {
    defaultBank: '',
    defaultView: 'month',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
  },
  financial: {
    primaryCurrency: 'BRL',
    secondaryCurrency: 'USD',
    roundingMethod: 'normal',
    dailySpendingLimit: '200',
    weeklySpendingLimit: '1000',
    monthlySpendingLimit: '5000',
    enableSpendingLimits: false,
  },
  analytics: {
    backupFrequency: 'weekly',
    defaultChartType: 'line',
    analysisPeriodia: '6months',
    smartAlerts: true,
    predictiveInsights: true,
    categoryTracking: true,
    goalTracking: true,
  },
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações do banco de dados
  const loadSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Carregando configurações para usuário:', user.id);

      // Primeiro, tentar buscar configurações existentes
      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('❌ Erro ao buscar configurações:', fetchError);
        
        if (fetchError.code === 'PGRST116') {
          // Configurações não existem, tentar criar
          console.log('📝 Configurações não encontradas, tentando criar...');
          
          // Tentar criar via função RPC primeiro (mais seguro)
          try {
            console.log('🔧 Tentando criar via função RPC...');
            const { data: rpcData, error: rpcError } = await supabase.rpc('create_default_user_settings', {
              user_uuid: user.id
            });
            
            if (rpcError) {
              console.error('❌ Erro na função RPC:', rpcError);
              throw rpcError;
            }
            
            console.log('✅ Configurações criadas via RPC:', rpcData);
            setSettings(rpcData);
            return;
          } catch (rpcError) {
            console.log('⚠️ RPC falhou, tentando inserção direta...');
            
            // Se RPC falhar, tentar inserção direta
            const { data: newSettings, error: createError } = await supabase
              .from('user_settings')
              .insert({
                user_id: user.id,
                profile: defaultSettings.profile,
                notifications: defaultSettings.notifications,
                preferences: defaultSettings.preferences,
                financial: defaultSettings.financial,
                analytics: defaultSettings.analytics,
              })
              .select()
              .single();

            if (createError) {
              console.error('❌ Erro ao criar configurações:', createError);
              
              // Se for erro de RLS, usar configurações padrão localmente
              if (createError.code === '42501') {
                console.log('🔒 Erro de RLS, usando configurações padrão localmente');
                setSettings(defaultSettings);
                setError('Configurações padrão carregadas. Algumas funcionalidades podem estar limitadas.');
                return;
              }
              
              throw createError;
            }
            
            console.log('✅ Configurações criadas com sucesso');
            setSettings(newSettings);
          }
        } else {
          throw fetchError;
        }
      } else {
        console.log('✅ Configurações carregadas com sucesso');
        setSettings(data);
      }
    } catch (err) {
      console.error('🔥 Erro ao carregar configurações:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      // Usar configurações padrão em caso de erro
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Salvar configurações no banco de dados
  const saveSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      // Primeiro, verificar se o registro existe
      const { data: existingSettings, error: checkError } = await supabase
        .from('user_settings')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      let error;
      
      if (checkError && checkError.code === 'PGRST116') {
        // Registro não existe, criar novo
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            profile: defaultSettings.profile,
            notifications: defaultSettings.notifications,
            preferences: defaultSettings.preferences,
            financial: defaultSettings.financial,
            analytics: defaultSettings.analytics,
            ...newSettings,
          });
        error = insertError;
      } else if (checkError) {
        // Outro erro
        error = checkError;
      } else {
        // Registro existe, atualizar
        const { error: updateError } = await supabase
          .from('user_settings')
          .update(newSettings)
          .eq('user_id', user.id);
        error = updateError;
      }

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setSettings(prev => ({ ...prev, ...newSettings }));

      // Disparar evento para notificar outros componentes
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: { ...settings, ...newSettings } 
      }));

      return true;
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      throw err;
    }
  }, [user, settings]);

  // Atualizar configurações específicas
  const updateSettings = useCallback(async (
    section: keyof UserSettings,
    updates: Partial<UserSettings[keyof UserSettings]>
  ) => {
    const newSettings = {
      [section]: { ...settings[section], ...updates }
    };

    await saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Validar configurações
  const validateSettings = useCallback((settings: UserSettings) => {
    const errors: string[] = [];

    // Validar limites de gastos
    const dailyLimit = parseFloat(settings.financial.dailySpendingLimit);
    const weeklyLimit = parseFloat(settings.financial.weeklySpendingLimit);
    const monthlyLimit = parseFloat(settings.financial.monthlySpendingLimit);

    if (isNaN(dailyLimit) || dailyLimit < 0) {
      errors.push('Limite diário deve ser um número positivo');
    }
    if (isNaN(weeklyLimit) || weeklyLimit < 0) {
      errors.push('Limite semanal deve ser um número positivo');
    }
    if (isNaN(monthlyLimit) || monthlyLimit < 0) {
      errors.push('Limite mensal deve ser um número positivo');
    }

    // Validar moedas
    if (settings.financial.primaryCurrency === settings.financial.secondaryCurrency) {
      errors.push('Moeda primária e secundária devem ser diferentes');
    }

    return errors;
  }, []);

  // Carregar configurações quando o usuário mudar
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    error,
    saveSettings,
    updateSettings,
    validateSettings,
    reloadSettings: loadSettings,
  };
}; 
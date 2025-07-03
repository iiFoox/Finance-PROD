import { useState, useEffect } from 'react';

export interface AppSettings {
  notifications: {
    dueBills: boolean;
    lowBalance: boolean;
    budgetAlerts: boolean;
    monthlyReport: boolean;
  };
  preferences: {
    defaultBank: string;
    defaultView: 'day' | 'week' | 'month' | 'year';
    currency: string;
    dateFormat: string;
  };
  savedAt?: string;
}

const defaultSettings: AppSettings = {
  notifications: {
    dueBills: true,
    lowBalance: true,
    budgetAlerts: true,
    monthlyReport: true,
  },
  preferences: {
    defaultBank: '',
    defaultView: 'month',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
  },
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar configurações do localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('financeAppSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          notifications: { ...prev.notifications, ...parsed.notifications },
          preferences: { ...prev.preferences, ...parsed.preferences },
          savedAt: parsed.savedAt,
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Escutar eventos de atualização de configurações
  useEffect(() => {
    const handleSettingsUpdate = (event: CustomEvent) => {
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...event.detail.notifications },
        preferences: { ...prev.preferences, ...event.detail.preferences },
        savedAt: event.detail.savedAt,
      }));
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener);

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);

  // Função para verificar se notificações estão ativas
  const isNotificationEnabled = (type: keyof AppSettings['notifications']) => {
    return settings.notifications[type];
  };

  // Função para obter a visualização padrão
  const getDefaultView = () => {
    return settings.preferences.defaultView;
  };

  // Função para obter o banco padrão
  const getDefaultBank = () => {
    return settings.preferences.defaultBank;
  };

  // Função para obter o formato de data
  const getDateFormat = () => {
    return settings.preferences.dateFormat;
  };

  return {
    settings,
    isLoaded,
    isNotificationEnabled,
    getDefaultView,
    getDefaultBank,
    getDateFormat,
  };
}; 
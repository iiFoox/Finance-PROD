import { useUserSettings } from './useUserSettings';

export const useAppSettings = () => {
  const { settings } = useUserSettings();

  // Função para formatar moeda baseada nas configurações do usuário
  const formatCurrency = (value: number, currency?: 'BRL' | 'USD') => {
    const userCurrency = currency || settings.preferences.currency;
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para formatar data baseada nas configurações do usuário
  const formatDate = (date: Date | string, includeTime = false) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
      'dd/MM/yyyy': { day: '2-digit', month: '2-digit', year: 'numeric' },
      'MM/dd/yyyy': { month: '2-digit', day: '2-digit', year: 'numeric' },
      'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' }
    };

    const options = formatMap[settings.preferences.dateFormat] || formatMap['dd/MM/yyyy'];
    
    if (includeTime) {
      Object.assign(options, { hour: '2-digit', minute: '2-digit' });
    }

    return dateObj.toLocaleString('pt-BR', options);
  };

  // Função para verificar se uma notificação está ativa
  const isNotificationEnabled = (type: keyof typeof settings.notifications) => {
    return settings.notifications[type];
  };

  // Função para obter o banco padrão
  const getDefaultBank = () => {
    return settings.preferences.defaultBank;
  };

  // Função para obter a visualização padrão
  const getDefaultView = () => {
    return settings.preferences.defaultView;
  };

  // Função para obter a moeda primária
  const getPrimaryCurrency = () => {
    return settings.financial.primaryCurrency;
  };

  // Função para obter a moeda secundária
  const getSecondaryCurrency = () => {
    return settings.financial.secondaryCurrency;
  };

  // Função para aplicar arredondamento baseado nas configurações
  const applyRounding = (value: number) => {
    const method = settings.financial.roundingMethod;
    
    switch (method) {
      case 'up':
        return Math.ceil(value * 100) / 100;
      case 'down':
        return Math.floor(value * 100) / 100;
      default:
        return Math.round(value * 100) / 100;
    }
  };

  // Função para verificar limites de gastos
  const checkSpendingLimits = (amount: number, period: 'daily' | 'weekly' | 'monthly') => {
    if (!settings.financial.enableSpendingLimits) return { withinLimit: true, limit: 0, spent: 0 };

    const limits = {
      daily: parseFloat(settings.financial.dailySpendingLimit),
      weekly: parseFloat(settings.financial.weeklySpendingLimit),
      monthly: parseFloat(settings.financial.monthlySpendingLimit)
    };

    const limit = limits[period];
    const withinLimit = amount <= limit;

    return { withinLimit, limit, spent: amount };
  };

  // Função para obter configurações de gráficos
  const getChartSettings = () => {
    return {
      defaultType: settings.analytics.defaultChartType,
      analysisPeriod: settings.analytics.analysisPeriodia,
      smartAlerts: settings.analytics.smartAlerts,
      predictiveInsights: settings.analytics.predictiveInsights,
      categoryTracking: settings.analytics.categoryTracking,
      goalTracking: settings.analytics.goalTracking
    };
  };

  // Função para obter configurações de backup
  const getBackupSettings = () => {
    return {
      frequency: settings.analytics.backupFrequency
    };
  };

  return {
    settings,
    formatCurrency,
    formatDate,
    isNotificationEnabled,
    getDefaultBank,
    getDefaultView,
    getPrimaryCurrency,
    getSecondaryCurrency,
    applyRounding,
    checkSpendingLimits,
    getChartSettings,
    getBackupSettings
  };
}; 
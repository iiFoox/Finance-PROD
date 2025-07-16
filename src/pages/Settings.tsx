import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserSettings, UserSettings } from '../hooks/useUserSettings';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { 
  Bell, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Camera, 
  Mail, 
  User, 
  Upload, 
  X,
  Save,
  BarChart3,
  Settings2,
  TrendingUp,
  Target,
  Calculator,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SimpleToast from '../components/SimpleToast';
import Modal from '../components/Modal';

const SettingsPage: React.FC = () => {
  const { banks, transactions, clearAllTransactions } = useFinance();
  const { user, signOut, updateProfile } = useAuth();
  const { settings, isLoading: settingsLoading, saveSettings, validateSettings, updateSettings } = useUserSettings();
  const { showSuccess, showError, showWarning } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para o toast
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message?: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showClearTransactionsModal, setShowClearTransactionsModal] = useState(false);
  const [isClearingTransactions, setIsClearingTransactions] = useState(false);
  
  // Estado local para configurações (para edição)
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  
  // Perfil do usuário
  const profile = {
    name: localSettings.profile?.name || user?.user_metadata?.name || '',
    email: user?.email || '',
    avatar_url: localSettings.profile?.avatar_url || settings.profile?.avatar_url || user?.user_metadata?.avatar_url || '',
  };

  const totalAccounts = banks.length;
  const totalTransactions = transactions.length;
  const joinDate = new Date(user?.created_at || Date.now()).toLocaleDateString('pt-BR');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione apenas arquivos de imagem.');
      setShowErrorModal(true);
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 5MB.');
      setShowErrorModal(true);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewAvatar(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!previewAvatar || !user) return;

    setIsUploadingAvatar(true);
    try {
      // Converter base64 para blob
      const response = await fetch(previewAvatar);
      const blob = await response.blob();
      
      // Gerar nome único para o arquivo
      const fileExt = blob.type.split('/')[1];
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar apenas o estado local (não salvar no banco ainda)
      setLocalSettings(prev => ({
        ...prev,
        profile: { ...prev.profile, avatar_url: publicUrl }
      }));
      
      setPreviewAvatar(null);
      setHasUnsavedChanges(true);

      console.log('Avatar uploaded successfully:', publicUrl);
      
      // Mostrar toast de sucesso
      setToast({
        show: true,
        type: 'success',
        title: 'Avatar selecionado!',
        message: 'Clique em "Salvar Configurações" para confirmar a alteração.'
      });
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      setToast({
        show: true,
        type: 'error',
        title: 'Erro no upload',
        message: 'Não foi possível fazer upload da imagem. Tente novamente.'
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const cancelPreview = () => {
    setPreviewAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNotificationChange = (key: keyof typeof localSettings.notifications) => {
    const newValue = !localSettings.notifications[key];
    setLocalSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: newValue,
      },
    }));
    
    // Mostrar feedback visual imediato
    const notificationNames = {
      dueBills: 'Contas a vencer',
      lowBalance: 'Saldo baixo',
      budgetAlerts: 'Alertas de orçamento',
      monthlyReport: 'Relatório mensal',
      transactionReminders: 'Lembretes de transação',
      goalAchievements: 'Alcance de metas',
      weeklyDigest: 'Resumo semanal',
      investmentUpdates: 'Atualizações de investimento'
    };
    
    const notificationName = notificationNames[key];
    console.log(`🔔 Notificação "${notificationName}" ${newValue ? 'ativada' : 'desativada'}`);
    setHasUnsavedChanges(true);
  };

  // Sincronizar configurações quando carregadas
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handlePreferenceChange = (key: keyof typeof localSettings.preferences, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
    
    // Mostrar feedback visual imediato
    const preferenceNames = {
      defaultBank: 'Conta padrão',
      defaultView: 'Visualização padrão',
      currency: 'Moeda',
      dateFormat: 'Formato de data'
    };
    
    const preferenceName = preferenceNames[key];
    let displayValue = value;
    
    // Formatar valores para exibição
    if (key === 'defaultView') {
      const viewNames = { day: 'Diária', week: 'Semanal', month: 'Mensal', year: 'Anual' };
      displayValue = viewNames[value as keyof typeof viewNames] || value;
    } else if (key === 'defaultBank') {
      const bank = banks.find(b => b.id === value);
      displayValue = bank ? bank.name : 'Nenhuma conta selecionada';
    }
    
    console.log(`⚙️ Preferência "${preferenceName}" alterada para: ${displayValue}`);
    setHasUnsavedChanges(true);
  };



  const handleFinancialChange = (key: keyof typeof localSettings.financial, value: string | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      financial: {
        ...prev.financial,
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleAnalyticsChange = (key: keyof typeof localSettings.analytics, value: string | boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      analytics: {
        ...prev.analytics,
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleProfileChange = (key: keyof typeof profile, value: string) => {
    // Atualizar apenas o nome do perfil localmente
    if (key === 'name') {
      // Atualizar o perfil local
      const updatedProfile = { ...profile, [key]: value };
      // Atualizar o estado local das configurações
      setLocalSettings(prev => ({
        ...prev,
        profile: { ...prev.profile, [key]: value }
      }));
      setHasUnsavedChanges(true);
    }
  };

  const handleCancelEdit = () => {
    setLocalSettings(settings);
    setIsEditing(false);
    setPreviewAvatar(null);
    setHasUnsavedChanges(false);
    setValidationErrors([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearAllTransactions = () => {
    setShowClearTransactionsModal(true);
  };

  const handleConfirmClearTransactions = async () => {
    setIsClearingTransactions(true);
    try {
      await clearAllTransactions();
      showSuccess(
        'Transações Limpas', 
        'Todas as transações foram removidas com sucesso. Esta ação não pode ser desfeita.'
      );
      setShowClearTransactionsModal(false);
    } catch (error) {
      console.error('Erro ao limpar transações:', error);
      showError(
        'Erro ao Limpar Transações', 
        'Não foi possível limpar as transações. Tente novamente.'
      );
    } finally {
      setIsClearingTransactions(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setValidationErrors([]);
    
    try {
      // Validar configurações antes de salvar
      const errors = validateSettings(localSettings);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setToast({
          show: true,
          type: 'error',
          title: 'Erro de validação',
          message: errors.join(', ')
        });
        return;
      }

      // Salvar configurações no banco de dados
      await saveSettings(localSettings);

      // Salvar perfil no Supabase (se o nome ou avatar foi alterado)
      const hasProfileChanges = profile.name !== user?.user_metadata?.name || 
                               localSettings.profile?.avatar_url !== user?.user_metadata?.avatar_url;
      
      if (hasProfileChanges) {
        await updateProfile({
          name: profile.name,
          avatar_url: localSettings.profile?.avatar_url || profile.avatar_url,
        });
      }

      setIsEditing(false);
      setHasUnsavedChanges(false);
      setPreviewAvatar(null);
      
      // Mostrar feedback de sucesso
      const savedItems = [];
      if (profile.name !== user?.user_metadata?.name) savedItems.push('Perfil');
      savedItems.push('Notificações');
      savedItems.push('Preferências');
      savedItems.push('Configurações Financeiras');
      savedItems.push('Relatórios & Análises');
      
      setToast({
        show: true,
        type: 'success',
        title: 'Configurações salvas!',
        message: `${savedItems.join(', ')} foram atualizados com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setToast({
        show: true,
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Não foi possível salvar as configurações. Tente novamente.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (settingsLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando configurações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Configurações</h1>

      {/* Seção de Perfil */}
      <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <User className="w-6 h-6" />
          Perfil
        </h2>
        
        {/* Avatar e Informações Básicas */}
        <div className="text-center space-y-4 mb-6">
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={previewAvatar || profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=3b82f6&color=ffffff&size=128`}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
            
            {isEditing && (
              <div className="absolute bottom-0 right-0">
                {previewAvatar ? (
                  <div className="flex space-x-1">
                    <button
                      onClick={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="bg-green-500 p-2 rounded-full text-white hover:bg-green-600 disabled:opacity-50 shadow-lg"
                      title="Confirmar upload"
                    >
                      {isUploadingAvatar ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={cancelPreview}
                      className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600 shadow-lg"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 p-2 rounded-full text-white hover:bg-blue-600 shadow-lg"
                    title="Alterar foto de perfil"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Input de arquivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Selecionar arquivo de imagem para avatar"
          />

          {previewAvatar && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Nova imagem selecionada. Clique no ✓ para confirmar o upload.
            </p>
          )}
        </div>

        {/* Nome e Email */}
        <div className="text-center space-y-2">
          {isEditing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="text-center text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-800 dark:text-white px-4 py-2"
              placeholder="Seu nome"
              aria-label="Nome do usuário"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {profile.name || 'Usuário'}
            </h2>
          )}
          <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
          {isEditing && (
            <small className="block text-gray-500 dark:text-gray-400">
              O email não pode ser alterado
            </small>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <div className="text-blue-500 mb-2">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Membro desde</h3>
            <p className="text-gray-600 dark:text-gray-400">{joinDate}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <div className="text-green-500 mb-2">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Total de Contas</h3>
            <p className="text-gray-600 dark:text-gray-400">{totalAccounts}</p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
            <div className="text-purple-500 mb-2">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Total de Transações</h3>
            <p className="text-gray-600 dark:text-gray-400">{totalTransactions}</p>
          </div>
        </div>
      </section>

      {/* Notificações */}
      <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Notificações
        </h2>
        <div className="space-y-4">
          {Object.entries(localSettings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {key === 'dueBills' && 'Contas a vencer'}
                {key === 'lowBalance' && 'Saldo baixo'}
                {key === 'budgetAlerts' && 'Alertas de orçamento'}
                {key === 'monthlyReport' && 'Relatório mensal'}
                {key === 'transactionReminders' && 'Lembretes de transação'}
                {key === 'goalAchievements' && 'Alcance de metas'}
                {key === 'weeklyDigest' && 'Resumo semanal'}
                {key === 'investmentUpdates' && 'Atualizações de investimento'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleNotificationChange(key as keyof typeof localSettings.notifications)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Preferências */}
      <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Preferências
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Conta padrão</span>
            <select
              value={localSettings.preferences.defaultBank}
              onChange={(e) => handlePreferenceChange('defaultBank', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Conta padrão"
            >
              <option value="">Selecione uma conta</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.id}>{bank.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Visualização padrão</span>
            <select
              value={localSettings.preferences.defaultView}
              onChange={(e) => handlePreferenceChange('defaultView', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Visualização padrão"
            >
              <option value="day">Diária</option>
              <option value="week">Semanal</option>
              <option value="month">Mensal</option>
              <option value="year">Anual</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Formato de data</span>
            <select
              value={localSettings.preferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Formato de data"
            >
              <option value="dd/MM/yyyy">DD/MM/AAAA</option>
              <option value="MM/dd/yyyy">MM/DD/AAAA</option>
              <option value="yyyy-MM-dd">AAAA-MM-DD</option>
            </select>
          </div>
        </div>
      </section>



      {/* Configurações Financeiras */}
      <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Configurações Financeiras
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Moeda primária</span>
            <select
              value={localSettings.financial.primaryCurrency}
              onChange={(e) => handleFinancialChange('primaryCurrency', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Moeda primária"
            >
              <option value="BRL">Real</option>
              <option value="USD">Dólar</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Moeda secundária</span>
            <select
              value={localSettings.financial.secondaryCurrency}
              onChange={(e) => handleFinancialChange('secondaryCurrency', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Moeda secundária"
            >
              <option value="BRL">Real</option>
              <option value="USD">Dólar</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Método de arredondamento</span>
            <select
              value={localSettings.financial.roundingMethod}
              onChange={(e) => handleFinancialChange('roundingMethod', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Método de arredondamento"
            >
              <option value="normal">Normal</option>
              <option value="up">Arredondar para cima</option>
              <option value="down">Arredondar para baixo</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Limite de gastos diários</span>
            <input
              type="number"
              value={localSettings.financial.dailySpendingLimit}
              onChange={(e) => handleFinancialChange('dailySpendingLimit', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Limite de gastos diários"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Limite de gastos semanais</span>
            <input
              type="number"
              value={localSettings.financial.weeklySpendingLimit}
              onChange={(e) => handleFinancialChange('weeklySpendingLimit', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Limite de gastos semanais"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Limite de gastos mensais</span>
            <input
              type="number"
              value={localSettings.financial.monthlySpendingLimit}
              onChange={(e) => handleFinancialChange('monthlySpendingLimit', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Limite de gastos mensais"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Habilitar limites de gastos</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.financial.enableSpendingLimits}
                onChange={(e) => handleFinancialChange('enableSpendingLimits', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Relatórios & Análises */}
      <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Relatórios & Análises
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Frequência de backup</span>
            <select
              value={localSettings.analytics.backupFrequency}
              onChange={(e) => handleAnalyticsChange('backupFrequency', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Frequência de backup"
            >
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tipo de gráfico padrão</span>
            <select
              value={localSettings.analytics.defaultChartType}
              onChange={(e) => handleAnalyticsChange('defaultChartType', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Tipo de gráfico padrão"
            >
              <option value="line">Linha</option>
              <option value="bar">Barras</option>
              <option value="pie">Pizza</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Período de análise</span>
            <select
              value={localSettings.analytics.analysisPeriodia}
              onChange={(e) => handleAnalyticsChange('analysisPeriodia', e.target.value)}
              className="bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2"
              aria-label="Período de análise"
            >
              <option value="3months">3 meses</option>
              <option value="6months">6 meses</option>
              <option value="12months">12 meses</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Alertas inteligentes</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.analytics.smartAlerts}
                onChange={(e) => handleAnalyticsChange('smartAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Insights preditivos</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.analytics.predictiveInsights}
                onChange={(e) => handleAnalyticsChange('predictiveInsights', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Rastreamento de categoria</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.analytics.categoryTracking}
                onChange={(e) => handleAnalyticsChange('categoryTracking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Rastreamento de meta</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.analytics.goalTracking}
                onChange={(e) => handleAnalyticsChange('goalTracking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Status das Configurações */}
      {hasUnsavedChanges && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Alterações não salvas</span>
          </div>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
            Você fez alterações nas configurações. Clique em "Salvar Alterações" para aplicá-las.
          </p>
        </div>
      )}

      {/* Erros de Validação */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Erros de validação</span>
          </div>
          <ul className="text-sm text-red-600 dark:text-red-400 mt-2 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ações Perigosas */}
      <section className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Ações Perigosas
        </h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-6">
          As ações abaixo são irreversíveis. Use com muito cuidado.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-700">
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">
                Limpar Todas as Transações
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                Remove permanentemente todas as transações de todos os meses. Esta ação não pode ser desfeita.
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Total de transações: {transactions.length}
              </p>
            </div>
            <button
              onClick={handleClearAllTransactions}
              disabled={transactions.length === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Todas
            </button>
          </div>
        </div>
      </section>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={isEditing ? handleCancelEdit : () => setIsEditing(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
        </button>
        
        <button
          onClick={handleSaveSettings}
          disabled={isSaving || !hasUnsavedChanges}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 ${
            hasUnsavedChanges 
              ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white animate-pulse shadow-lg' 
              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {hasUnsavedChanges ? 'Salvar Alterações' : 'Nenhuma alteração'}
            </>
          )}
        </button>
      </div>

      {/* Simple Toast */}
      <SimpleToast 
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />

      {/* Modal de Erro */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Erro"
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {errorMessage}
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação - Limpar Transações */}
      <Modal
        isOpen={showClearTransactionsModal}
        onClose={() => setShowClearTransactionsModal(false)}
        title="Confirmar Limpeza de Transações"
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Atenção! Esta ação é irreversível
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Você está prestes a remover <strong>{transactions.length} transações</strong> de todos os meses.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>⚠️ Importante:</strong> Esta ação não pode ser desfeita. Todas as transações serão permanentemente removidas do sistema.
              </p>
            </div>
          </div>
          
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowClearTransactionsModal(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmClearTransactions}
              disabled={isClearingTransactions}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isClearingTransactions ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Limpando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Sim, Limpar Todas
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage; 
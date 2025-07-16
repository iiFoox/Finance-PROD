import React, { useState, useEffect } from 'react';
import { Wand2, AlertCircle, CheckCircle } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { Transaction } from '../types';
import Modal from './Modal';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

type CategoryMap = {
  expense: {
    'Alimentação': string[];
    'Transporte': string[];
    'Moradia': string[];
    'Lazer': string[];
    'Saúde': string[];
    'Educação': string[];
    'Outros': string[];
  };
  income: {
    'Salário': string[];
    'Freelance': string[];
    'Rendimentos': string[];
    'Outros': string[];
  };
};

interface FormErrors {
  amount?: string;
  description?: string;
  date?: string;
  bankId?: string;
  cardId?: string;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction }) => {
  const { addTransaction, updateTransaction, banks, cards, selectedYear, selectedMonth } = useFinance();
  
  // Função para gerar data inicial baseada no período selecionado
  const getInitialDate = () => {
    const now = new Date();
    const selectedDate = new Date(selectedYear, selectedMonth, now.getDate(), now.getHours(), now.getMinutes());
    
    // Formatar para datetime-local considerando timezone local
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const hours = String(selectedDate.getHours()).padStart(2, '0');
    const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Função para converter data local para Date corretamente
  const parseLocalDateTime = (dateTimeString: string): Date => {
    // Pegar o valor diretamente do campo datetime-local
    // O formato é YYYY-MM-DDTHH:MM
    const [datePart, timePart] = dateTimeString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    // Criar data local (sem conversão de timezone)
    const localDate = new Date(year, month - 1, day, hours, minutes);
    
    console.log('Data original do campo:', dateTimeString);
    console.log('Data convertida:', localDate);
    console.log('Data ISO:', localDate.toISOString());
    
    return localDate;
  };
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'Alimentação',
    subcategory: '',
    description: '',
    date: getInitialDate(),
    tags: '',
    paymentMethod: 'money' as 'money' | 'creditCard' | 'debitCard' | 'pix',
    bankId: '',
    cardId: '',
    isInstallment: false,
    currentInstallment: 1,
    totalInstallments: 2,
    isRecurring: false,
    recurringEndDate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryMap: CategoryMap = {
    expense: {
      'Alimentação': ['Restaurante', 'Supermercado', 'Delivery', 'Outros'],
      'Transporte': ['Combustível', 'Transporte Público', 'Uber/99/Táxi', 'Manutenção', 'Outros'],
      'Moradia': ['Aluguel', 'Condomínio', 'Água', 'Luz', 'Internet', 'IPTU', 'Outros'],
      'Lazer': ['Cinema', 'Shows', 'Viagens', 'Streaming', 'Outros'],
      'Saúde': ['Consultas', 'Medicamentos', 'Plano de Saúde', 'Academia', 'Outros'],
      'Educação': ['Mensalidade', 'Material', 'Cursos', 'Livros', 'Outros'],
      'Outros': ['Geral']
    },
    income: {
      'Salário': ['Salário', 'Décimo Terceiro', 'Férias', 'Bônus'],
      'Freelance': ['Projeto', 'Consultoria', 'Outros'],
      'Rendimentos': ['Dividendos', 'Juros', 'Aluguel'],
      'Outros': ['Geral']
    }
  };

  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);

  useEffect(() => {
    // Update categories based on type
    const newCategories = Object.keys(categoryMap[formData.type]);
    setCategories(newCategories);
    
    // Reset category if it's not valid for the new type
    if (!newCategories.includes(formData.category)) {
      setFormData(prev => ({ 
        ...prev, 
        category: newCategories[0] || '',
        subcategory: ''
      }));
    }
  }, [formData.type]);

  useEffect(() => {
    // Update subcategories based on category
    if (formData.category && categoryMap[formData.type][formData.category as keyof typeof categoryMap[typeof formData.type]]) {
      const newSubcategories = categoryMap[formData.type][formData.category as keyof typeof categoryMap[typeof formData.type]] || [];
      setSubcategories(newSubcategories);
      
      // Reset subcategory if it's not valid for the new category
      if (!newSubcategories.includes(formData.subcategory)) {
        setFormData(prev => ({ 
          ...prev, 
          subcategory: newSubcategories[0] || ''
        }));
      }
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  }, [formData.category, formData.type]);

  useEffect(() => {
    if (transaction) {
      console.log('Carregando transação para edição:', transaction);
      console.log('isRecurring:', transaction.isRecurring);
      console.log('recurringDetails:', transaction.recurringDetails);
      
      setFormData({
        type: transaction.type === 'investment' ? 'income' : transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        subcategory: transaction.subcategory,
        description: transaction.description,
        date: transaction.date.toISOString().slice(0, 16),
        tags: transaction.tags?.join(', ') || '',
        paymentMethod: transaction.paymentMethod || 'money',
        bankId: transaction.bankId || '',
        cardId: transaction.cardId || '',
        isInstallment: transaction.isInstallment || false,
        currentInstallment: transaction.installmentDetails?.current || 1,
        totalInstallments: transaction.installmentDetails?.total || 2,
        isRecurring: Boolean(transaction.isRecurring),
        recurringEndDate: transaction.recurringDetails?.endDate?.toISOString().slice(0, 10) || '',
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        category: 'Alimentação',
        subcategory: 'Restaurante',
        description: '',
        date: getInitialDate(),
        tags: '',
        paymentMethod: 'money',
        bankId: '',
        cardId: '',
        isInstallment: false,
        currentInstallment: 1,
        totalInstallments: 2,
        isRecurring: false,
        recurringEndDate: '',
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  // Atualizar data quando o período selecionado mudar
  useEffect(() => {
    if (!transaction && isOpen) {
      setFormData(prev => ({
        ...prev,
        date: getInitialDate()
      }));
    }
  }, [selectedYear, selectedMonth, isOpen, transaction]);

  // Validação em tempo real
  const validateField = (name: string, value: string | number) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'amount':
        if (!value || parseFloat(value.toString()) <= 0) {
          newErrors.amount = 'Valor deve ser maior que zero';
        } else {
          delete newErrors.amount;
        }
        break;
      case 'description':
        if (!value || value.toString().trim().length === 0) {
          newErrors.description = 'Descrição é obrigatória';
        } else {
          delete newErrors.description;
        }
        break;
      case 'date':
        if (!value || value.toString().trim().length === 0) {
          newErrors.date = 'Data é obrigatória';
        } else {
          delete newErrors.date;
        }
        break;
      case 'bankId':
        if ((formData.paymentMethod === 'creditCard' || formData.paymentMethod === 'debitCard' || formData.paymentMethod === 'pix') && !value) {
          newErrors.bankId = 'Banco é obrigatório';
        } else {
          delete newErrors.bankId;
        }
        break;
      case 'cardId':
        if ((formData.paymentMethod === 'creditCard' || formData.paymentMethod === 'debitCard') && !value) {
          newErrors.cardId = 'Cartão é obrigatório';
        } else {
          delete newErrors.cardId;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos os campos obrigatórios
    const isAmountValid = validateField('amount', formData.amount);
    const isDescriptionValid = validateField('description', formData.description);
    const isDateValid = validateField('date', formData.date);
    const isBankValid = validateField('bankId', formData.bankId);
    const isCardValid = validateField('cardId', formData.cardId);
    
    if (!isAmountValid || !isDescriptionValid || !isDateValid || !isBankValid || !isCardValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    const transactionData = {
      type: formData.type,
      amount,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description.trim(),
      date: parseLocalDateTime(formData.date),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      paymentMethod: formData.paymentMethod,
      bankId: (formData.paymentMethod === 'creditCard' || formData.paymentMethod === 'debitCard' || formData.paymentMethod === 'pix') ? formData.bankId : undefined,
      cardId: (formData.paymentMethod === 'creditCard' || formData.paymentMethod === 'debitCard') ? formData.cardId : undefined,
      isInstallment: formData.isInstallment,
      installmentDetails: formData.isInstallment ? {
        current: formData.currentInstallment,
        total: formData.totalInstallments,
        groupId: transaction?.installmentDetails?.groupId || crypto.randomUUID(),
      } : undefined,
      isRecurring: formData.isRecurring,
      recurringDetails: formData.isRecurring ? {
        frequency: 'monthly' as const,
        endDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
      } : undefined,
      invoiceMonth: formData.paymentMethod === 'creditCard' ? parseLocalDateTime(formData.date).getMonth() : undefined,
      invoiceYear: formData.paymentMethod === 'creditCard' ? parseLocalDateTime(formData.date).getFullYear() : undefined,
    };

    try {
      if (transaction) {
        await updateTransaction(transaction.id, transactionData);
      } else {
        if (formData.isInstallment && !transaction) {
          // Create multiple transactions for installments
          const singleAmount = amount / formData.totalInstallments;
          const baseDate = parseLocalDateTime(formData.date);
          const groupId = crypto.randomUUID();
          
          for (let i = 0; i < formData.totalInstallments; i++) {
            const installmentDate = new Date(baseDate);
            installmentDate.setMonth(installmentDate.getMonth() + i);
            
            await addTransaction({
              ...transactionData,
              amount: singleAmount,
              description: `${formData.description} (${i + 1}/${formData.totalInstallments})`,
              date: installmentDate,
              installmentDetails: {
                current: i + 1,
                total: formData.totalInstallments,
                groupId,
              },
              invoiceMonth: formData.paymentMethod === 'creditCard' ? installmentDate.getMonth() : undefined,
              invoiceYear: formData.paymentMethod === 'creditCard' ? installmentDate.getFullYear() : undefined,
            });
          }
        } else if (formData.isRecurring && !transaction) {
          // Create recurring transactions until end date or for 12 months if no end date
          const baseDate = parseLocalDateTime(formData.date);
          const endDate = formData.recurringEndDate 
            ? new Date(formData.recurringEndDate)
            : new Date(baseDate.getFullYear() + 1, baseDate.getMonth(), baseDate.getDate());
          
          let currentDate = new Date(baseDate);
          while (currentDate <= endDate) {
            await addTransaction({
              ...transactionData,
              date: new Date(currentDate),
              invoiceMonth: formData.paymentMethod === 'creditCard' ? currentDate.getMonth() : undefined,
              invoiceYear: formData.paymentMethod === 'creditCard' ? currentDate.getFullYear() : undefined,
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
          }
        } else {
          await addTransaction(transactionData);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestCategory = () => {
    if (!formData.description) return;
    
    const description = formData.description.toLowerCase();
    
    // Mapeamento inteligente de palavras-chave para categorias
    const categoryMappings = {
      // Alimentação
      'alimentação': ['ifood', 'uber eats', 'rappi', 'mcdonalds', 'burger king', 'kfc', 'subway', 'pizza', 'restaurante', 'lanchonete', 'padaria', 'açougue', 'mercado', 'supermercado', 'feira', 'hortifruti', 'comida', 'almoço', 'jantar', 'café', 'bebida', 'cerveja', 'refrigerante', 'água', 'leite', 'pão', 'carne', 'frango', 'peixe', 'verdura', 'fruta', 'doce', 'chocolate', 'sorvete', 'delivery', 'entrega'],
      
      // Transporte
      'transporte': ['uber', 'cabify', '99', 'taxi', 'ônibus', 'metro', 'trem', 'gasolina', 'etanol', 'diesel', 'combustível', 'posto', 'shell', 'petrobras', 'ipiranga', 'br', 'estacionamento', 'pedágio', 'vinheta', 'multa', 'detran', 'ipva', 'seguro auto', 'mecânico', 'oficina', 'pneu', 'óleo', 'revisão', 'carro', 'moto', 'bicicleta', 'patinete', 'transporte público', 'bilhete único', 'cartão transporte'],
      
      // Moradia
      'moradia': ['aluguel', 'condomínio', 'iptu', 'luz', 'energia', 'água', 'gás', 'internet', 'telefone', 'celular', 'tv', 'streaming', 'netflix', 'amazon prime', 'spotify', 'limpeza', 'faxina', 'porteiro', 'segurança', 'reforma', 'pintura', 'eletricista', 'encanador', 'pedreiro', 'móveis', 'decoração', 'casa', 'apartamento'],
      
      // Lazer
      'lazer': ['cinema', 'teatro', 'show', 'festa', 'balada', 'bar', 'pub', 'clube', 'academia', 'ginásio', 'piscina', 'parque', 'zoológico', 'museu', 'exposição', 'viagem', 'hotel', 'pousada', 'passagem', 'avião', 'rodoviária', 'turismo', 'passeio', 'diversão', 'entretenimento', 'jogo', 'videogame', 'livro', 'revista', 'jornal', 'hobby', 'esporte', 'futebol', 'tênis', 'natação'],
      
      // Saúde
      'saúde': ['médico', 'dentista', 'hospital', 'clínica', 'farmácia', 'remédio', 'medicamento', 'exame', 'consulta', 'cirurgia', 'tratamento', 'fisioterapia', 'psicólogo', 'psiquiatra', 'oftalmologista', 'cardiologista', 'dermatologista', 'ginecologista', 'pediatra', 'ortopedista', 'laboratório', 'raio-x', 'ultrassom', 'ressonância', 'tomografia', 'vacina', 'plano de saúde', 'convênio', 'unimed', 'bradesco saúde', 'amil', 'sulamerica'],
      
      // Educação
      'educação': ['escola', 'faculdade', 'universidade', 'curso', 'aula', 'professor', 'mensalidade', 'matrícula', 'material escolar', 'livro didático', 'caderno', 'caneta', 'lápis', 'mochila', 'uniforme', 'transporte escolar', 'lanche escolar', 'formatura', 'diploma', 'certificado', 'idioma', 'inglês', 'espanhol', 'francês', 'alemão', 'informática', 'computação', 'programação'],
      
      // Salário (Receita)
      'salário': ['salário', 'ordenado', 'pagamento', 'pró-labore', 'comissão', 'bonus', 'gratificação', '13º salário', 'férias', 'horas extras', 'adicional', 'trabalho', 'emprego', 'empresa', 'patrão', 'chefe'],
      
      // Investimentos (Receita)
      'investimentos': ['dividendo', 'juros', 'rendimento', 'aplicação', 'poupança', 'cdb', 'lci', 'lca', 'tesouro', 'ações', 'fii', 'fundo', 'bitcoin', 'crypto', 'investimento', 'corretora', 'xp', 'rico', 'clear', 'inter', 'nubank', 'itaú', 'bradesco', 'santander', 'banco do brasil', 'caixa']
    };

    // Procurar por correspondências
    for (const [category, keywords] of Object.entries(categoryMappings)) {
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          setFormData(prev => ({ 
            ...prev, 
            category: category.charAt(0).toUpperCase() + category.slice(1),
            type: ['salário', 'investimentos'].includes(category) ? 'income' : 'expense'
          }));
          return;
        }
      }
    }

    // Se não encontrou correspondência específica, tentar categorias mais gerais
    if (description.includes('receb') || description.includes('salár') || description.includes('pag')) {
      setFormData(prev => ({ ...prev, type: 'income', category: 'Salário' }));
    }
  };

  const getFieldClassName = (fieldName: string) => {
    const baseClasses = "w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white";
    
    if (errors[fieldName as keyof FormErrors]) {
      return `${baseClasses} border-red-500 dark:border-red-400 focus:ring-red-500`;
    }
    
    return `${baseClasses} border-gray-300 dark:border-slate-600`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Editar Transação' : 'Nova Transação'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            aria-label="Tipo de transação"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Forma de Pagamento
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            aria-label="Forma de pagamento"
          >
            <option value="money">Dinheiro/Outros</option>
            <option value="creditCard">Cartão de Crédito</option>
            <option value="debitCard">Cartão de Débito</option>
            <option value="pix">PIX</option>
          </select>
        </div>

        {(formData.paymentMethod === 'creditCard' || formData.paymentMethod === 'debitCard' || formData.paymentMethod === 'pix') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Banco <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bankId}
              onChange={(e) => {
                handleFieldChange('bankId', e.target.value);
                setFormData(prev => ({ 
                  ...prev, 
                  cardId: '' // Reset card selection when bank changes
                }));
              }}
              className={getFieldClassName('bankId')}
              aria-label="Banco"
              required

              aria-describedby={errors.bankId ? 'bankId-error' : undefined}
            >
              <option value="">Selecione um banco</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.id}>{bank.name}</option>
              ))}
            </select>
            {errors.bankId && (
              <div id="bankId-error" className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.bankId}
              </div>
            )}
          </div>
        )}

        {(formData.paymentMethod === 'creditCard' || formData.paymentMethod === 'debitCard') && formData.bankId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cartão <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.cardId}
              onChange={(e) => handleFieldChange('cardId', e.target.value)}
              className={getFieldClassName('cardId')}
              aria-label="Cartão"
              required

              aria-describedby={errors.cardId ? 'cardId-error' : undefined}
            >
              <option value="">Selecione um cartão</option>
              {cards
                .filter(card => card.bankId === formData.bankId && card.isActive)
                .map(card => (
                  <option key={card.id} value={card.id}>
                    Crédito/Débito - {card.lastFourDigits}
                  </option>
                ))}
            </select>
            {errors.cardId && (
              <div id="cardId-error" className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.cardId}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Valor (R$) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => handleFieldChange('amount', e.target.value)}
            className={getFieldClassName('amount')}
            placeholder="0,00"
            aria-label="Valor"
            required
            
            aria-describedby={errors.amount ? 'amount-error' : undefined}
          />
          {errors.amount && (
            <div id="amount-error" className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.amount}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categoria
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            aria-label="Categoria"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subcategoria
          </label>
          <select
            value={formData.subcategory}
            onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            aria-label="Subcategoria"
          >
            {subcategories.map(subcategory => (
              <option key={subcategory} value={subcategory}>{subcategory}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className={`${getFieldClassName('description')} pr-10`}
              placeholder="Descrição da transação"
              aria-label="Descrição"
              required

              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            <button
              type="button"
              onClick={suggestCategory}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-600 p-1"
              title="Sugerir categoria automaticamente"
              aria-label="Sugerir categoria automaticamente"
            >
              <Wand2 className="w-4 h-4" />
            </button>
          </div>
          {errors.description && (
            <div id="description-error" className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            💡 Clique na varinha para sugerir categoria automaticamente
          </p>
        </div>

        <div className="flex flex-row space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              className="mr-2"
              aria-label="Transação recorrente"
            />
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Transação recorrente?</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isInstallment}
              onChange={(e) => setFormData(prev => ({ ...prev, isInstallment: e.target.checked }))}
              className="mr-2"
              disabled={formData.isRecurring}
              aria-label="Compra parcelada"
            />
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Compra Parcelada?</span>
          </label>
        </div>

        {formData.isRecurring && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Limite (opcional)
            </label>
            <input
              type="date"
              value={formData.recurringEndDate}
              onChange={(e) => setFormData(prev => ({ ...prev, recurringEndDate: e.target.value }))}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              min={new Date().toISOString().split('T')[0]}
              aria-label="Data limite da transação recorrente"
              title="Data limite da transação recorrente"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Se não definir uma data limite, a transação será repetida por 12 meses
            </p>
          </div>
        )}

        {formData.isInstallment && !formData.isRecurring && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Parcela Atual
              </label>
              <input
                type="number"
                value={formData.currentInstallment}
                onChange={(e) => setFormData(prev => ({ ...prev, currentInstallment: parseInt(e.target.value) || 1 }))}
                min="1"
                max={formData.totalInstallments}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                aria-label="Parcela atual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total de Parcelas
              </label>
              <input
                type="number"
                value={formData.totalInstallments}
                onChange={(e) => setFormData(prev => ({ ...prev, totalInstallments: parseInt(e.target.value) || 2 }))}
                min="2"
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                aria-label="Total de parcelas"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags (separadas por vírgula)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            placeholder="Separe as tags por vírgula"
            aria-label="Tags"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data e Hora <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            className={getFieldClassName('date')}
            required
            aria-label="Data e hora da transação"
            title="Data e hora da transação"
            
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          {errors.date && (
            <div id="date-error" className="flex items-center mt-1 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.date}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isSubmitting || Object.keys(errors).length > 0}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {transaction ? 'Atualizando...' : 'Salvando...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {transaction ? 'Atualizar' : 'Salvar'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
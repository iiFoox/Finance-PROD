import React, { useState, useEffect } from 'react';
import { X, Wand2 } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { Transaction } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction }) => {
  const { addTransaction, updateTransaction, banks } = useFinance();
  
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'Alimentação',
    description: '',
    date: new Date().toISOString().slice(0, 16),
    tags: '',
    paymentMethod: 'money' as 'money' | 'creditCard' | 'debitCard' | 'pix',
    bankId: '',
    isInstallment: false,
    currentInstallment: 1,
    totalInstallments: 2,
  });

  const categories = [
    'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 
    'Educação', 'Salário', 'Investimentos', 'Outros'
  ];

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        date: transaction.date.toISOString().slice(0, 16),
        tags: transaction.tags?.join(', ') || '',
        paymentMethod: transaction.paymentMethod || 'money',
        bankId: transaction.bankId || '',
        isInstallment: transaction.isInstallment || false,
        currentInstallment: transaction.installmentDetails?.current || 1,
        totalInstallments: transaction.installmentDetails?.total || 2,
      });
    } else {
      setFormData({
        type: 'expense',
        amount: '',
        category: 'Alimentação',
        description: '',
        date: new Date().toISOString().slice(0, 16),
        tags: '',
        paymentMethod: 'money',
        bankId: '',
        isInstallment: false,
        currentInstallment: 1,
        totalInstallments: 2,
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    const transactionData = {
      type: formData.type,
      amount,
      category: formData.category,
      description: formData.description,
      date: new Date(formData.date),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      paymentMethod: formData.paymentMethod,
      bankId: formData.paymentMethod === 'creditCard' ? formData.bankId : undefined,
      isInstallment: formData.isInstallment,
      installmentDetails: formData.isInstallment ? {
        current: formData.currentInstallment,
        total: formData.totalInstallments,
        groupId: transaction?.installmentDetails?.groupId || crypto.randomUUID(),
      } : undefined,
    };

    if (transaction) {
      updateTransaction(transaction.id, transactionData);
    } else {
      if (formData.isInstallment && !transaction) {
        // Create multiple transactions for installments
        const singleAmount = amount / formData.totalInstallments;
        const baseDate = new Date(formData.date);
        const groupId = crypto.randomUUID();
        
        for (let i = 0; i < formData.totalInstallments; i++) {
          const installmentDate = new Date(baseDate);
          installmentDate.setMonth(installmentDate.getMonth() + i);
          
          addTransaction({
            ...transactionData,
            amount: singleAmount,
            description: `${formData.description} (${i + 1}/${formData.totalInstallments})`,
            date: installmentDate,
            installmentDetails: {
              current: i + 1,
              total: formData.totalInstallments,
              groupId,
            },
          });
        }
      } else {
        addTransaction(transactionData);
      }
    }
    
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-1"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Forma de Pagamento
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="money">Dinheiro/Outros</option>
              <option value="creditCard">Cartão de Crédito</option>
              <option value="debitCard">Cartão de Débito</option>
              <option value="pix">PIX</option>
            </select>
          </div>

          {formData.paymentMethod === 'creditCard' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banco/Cartão
              </label>
              <select
                value={formData.bankId}
                onChange={(e) => setFormData(prev => ({ ...prev, bankId: e.target.value }))}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                required
              >
                <option value="">Selecione um banco</option>
                {banks.map(bank => (
                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="mr-2"
                />
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Despesa</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="mr-2"
                />
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Receita</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 pr-10 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                placeholder="Ex: Almoço no restaurante"
                required
              />
              <button
                type="button"
                onClick={suggestCategory}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-600 p-1"
                title="Sugerir categoria automaticamente"
              >
                <Wand2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              💡 Clique na varinha para sugerir categoria automaticamente
            </p>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isInstallment}
                onChange={(e) => setFormData(prev => ({ ...prev, isInstallment: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Compra Parcelada?</span>
            </label>
          </div>

          {formData.isInstallment && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parcela Atual
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.currentInstallment}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentInstallment: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total de Parcelas
                </label>
                <input
                  type="number"
                  min="2"
                  value={formData.totalInstallments}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalInstallments: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
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
              placeholder="trabalho, urgente, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data
            </label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base"
            >
              {transaction ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
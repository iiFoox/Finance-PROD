import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { Card, Bank } from '../types';
import { useFinance } from '../contexts/FinanceContext';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank?: Bank | null;
}

const CardModal: React.FC<CardModalProps> = ({ isOpen, onClose, bank }) => {
  const { addCard, updateCard, deleteCard, cards } = useFinance();
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [formData, setFormData] = useState({
    lastFourDigits: '',
    cardType: (bank?.type === 'credit' ? 'credit' : 'debit') as 'credit' | 'debit',
    isActive: true,
  });

  useEffect(() => {
    if (editingCard) {
      setFormData({
        lastFourDigits: editingCard.lastFourDigits,
        cardType: editingCard.cardType,
        isActive: editingCard.isActive,
      });
    } else {
      setFormData({
        lastFourDigits: '',
        cardType: (bank?.type === 'credit' ? 'credit' : 'debit') as 'credit' | 'debit',
        isActive: true,
      });
    }
  }, [editingCard, bank]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bank || !formData.lastFourDigits || formData.lastFourDigits.length !== 4) {
      return;
    }

    try {
      if (editingCard) {
        await updateCard(editingCard.id, {
          lastFourDigits: formData.lastFourDigits,
          cardType: formData.cardType,
          isActive: formData.isActive,
        });
      } else {
        await addCard({
          bankId: bank.id,
          lastFourDigits: formData.lastFourDigits,
          cardType: formData.cardType,
          isActive: formData.isActive,
        });
      }
      
      setEditingCard(null);
      setFormData({
        lastFourDigits: '',
        cardType: 'credit',
        isActive: true,
      });
    } catch (error) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
  };

  const handleDelete = async (cardId: string) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await deleteCard(cardId);
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingCard(null);
    setFormData({
      lastFourDigits: '',
      cardType: 'credit',
      isActive: true,
    });
  };

  const bankCards = cards.filter(card => card.bankId === bank?.id);

  if (!isOpen || !bank) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: bank.color }}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
                {editingCard ? 'Editar Cartão' : 'Gerenciar Cartões'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{bank.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
              </h3>
              
                             <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Últimos 4 dígitos
                   </label>
                   <input
                     type="text"
                     value={formData.lastFourDigits}
                     onChange={(e) => setFormData(prev => ({ 
                       ...prev, 
                       lastFourDigits: e.target.value.replace(/\D/g, '').slice(0, 4)
                     }))}
                     className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                     placeholder="1234"
                     maxLength={4}
                     required
                   />
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                     Tipo: Crédito/Débito
                   </p>
                 </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        isActive: e.target.checked
                      }))}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Cartão ativo</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  {editingCard && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingCard ? 'Atualizar' : 'Adicionar'} Cartão</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de cartões */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Cartões Cadastrados ({bankCards.length})
              </h3>
              
              {bankCards.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Nenhum cartão cadastrado</p>
                  <p className="text-sm mt-1">Adicione um cartão usando o formulário ao lado.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {bankCards.map((card) => (
                    <div
                      key={card.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        card.isActive 
                          ? 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:shadow-md' 
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          card.cardType === 'credit' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        <div>
                                                  <div className="font-medium text-gray-900 dark:text-white">
                          Crédito/Débito - {card.lastFourDigits}
                        </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {card.isActive ? 'Ativo' : 'Inativo'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(card)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(card.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal; 
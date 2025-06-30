import React, { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';
import { useFinance } from '../contexts/FinanceContext';
import { Transaction } from '../types';
import { Edit, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface DragDropTransactionsProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const DragDropTransactions: React.FC<DragDropTransactionsProps> = ({ 
  transactions, 
  onEdit, 
  onDelete 
}) => {
  const { reorderTransactions, banks } = useFinance();
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (tableBodyRef.current) {
      const sortable = Sortable.create(tableBodyRef.current, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'opacity-50',
        chosenClass: 'sortable-chosen',
        dragClass: 'shadow-lg',
        onEnd: (evt) => {
          const oldIndex = evt.oldIndex;
          const newIndex = evt.newIndex;
          
          if (oldIndex !== undefined && newIndex !== undefined) {
            const reorderedTransactions = [...transactions];
            const [removed] = reorderedTransactions.splice(oldIndex, 1);
            reorderedTransactions.splice(newIndex, 0, removed);
            reorderTransactions(reorderedTransactions);
          }
        },
      });

      return () => {
        sortable.destroy();
      };
    }
  }, [transactions, reorderTransactions]);

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (date: Date) => 
    date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getBankName = (bankId?: string) => {
    if (!bankId) return 'Dinheiro';
    const bank = banks.find(b => b.id === bankId);
    return bank?.name || 'Banco não encontrado';
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'creditCard': return 'Cartão de Crédito';
      case 'debitCard': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      default: return 'Dinheiro';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium">Nenhuma transação encontrada</p>
          <p className="text-sm">Adicione uma nova transação para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-8">
              <GripVertical className="w-4 h-4" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Data/Hora
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Pagamento
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody ref={tableBodyRef} className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {transactions.map((transaction) => (
            <tr 
              key={transaction.id} 
              className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-move"
              data-id={transaction.id}
            >
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="drag-handle cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <GripVertical className="w-4 h-4" />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {formatDate(transaction.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                <div>
                  <div className="font-medium">{transaction.description}</div>
                  {transaction.isInstallment && transaction.installmentDetails && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Parcela {transaction.installmentDetails.current}/{transaction.installmentDetails.total}
                    </div>
                  )}
                  {transaction.tags && transaction.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {transaction.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {transaction.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                <div>
                  <div>{getPaymentMethodLabel(transaction.paymentMethod)}</div>
                  {transaction.bankId && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getBankName(transaction.bankId)}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <span className={transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => onEdit(transaction)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DragDropTransactions;
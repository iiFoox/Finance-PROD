import React, { useState } from 'react';
import { Plus, CreditCard, Landmark, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import BankModal from '../components/BankModal';
import { Bank } from '../types';

const BanksPage: React.FC = () => {
  const { 
    banks, 
    deleteBank, 
    transactions, 
    selectedYear, 
    selectedMonth,
    getBankInvoice 
  } = useFinance();
  
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [selectedBankInvoice, setSelectedBankInvoice] = useState<string | null>(null);

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank);
    setShowBankModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banco? Todas as transações associadas perderão a referência.')) {
      deleteBank(id);
    }
  };

  const handleCloseModal = () => {
    setShowBankModal(false);
    setEditingBank(null);
  };

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getBankIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <CreditCard className="w-6 h-6" />;
      case 'debit':
        return <CreditCard className="w-6 h-6" />;
      default:
        return <Landmark className="w-6 h-6" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      default: return 'Conta Corrente';
    }
  };

  const viewInvoice = (bankId: string) => {
    setSelectedBankInvoice(bankId);
  };

  const selectedInvoice = selectedBankInvoice ? getBankInvoice(selectedBankInvoice, selectedMonth, selectedYear) : null;
  const selectedBankData = selectedBankInvoice ? banks.find(b => b.id === selectedBankInvoice) : null;

  if (selectedBankInvoice && selectedInvoice && selectedBankData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedBankInvoice(null)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-2"
          >
            <span>← Voltar para Bancos</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Fatura - {selectedBankData.name}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: selectedBankData.color }}
              >
                {getBankIcon(selectedBankData.type)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {selectedBankData.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total da Fatura</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(selectedInvoice.totalAmount)}
              </p>
              {selectedBankData.creditLimit && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Limite: {formatCurrency(selectedBankData.creditLimit)}
                </p>
              )}
            </div>
          </div>

          {selectedInvoice.transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma transação nesta fatura</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {selectedInvoice.transactions
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {transaction.date.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.isInstallment && transaction.installmentDetails && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Parcela {transaction.installmentDetails.current}/{transaction.installmentDetails.total}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600 dark:text-red-400">
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Meus Bancos e Cartões</h2>
          <p className="text-gray-600 dark:text-gray-400">Gerencie seus bancos, cartões e faturas</p>
        </div>
        <button
          onClick={() => setShowBankModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Banco</span>
        </button>
      </div>

      {banks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-gray-100 dark:border-slate-700">
          <Landmark className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            Nenhum banco cadastrado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Adicione seus bancos e cartões para organizar melhor suas finanças
          </p>
          <button
            onClick={() => setShowBankModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Adicionar Primeiro Banco
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((bank) => {
            const currentMonthTransactions = transactions.filter(t => 
              t.bankId === bank.id && 
              t.date.getFullYear() === selectedYear && 
              t.date.getMonth() === selectedMonth
            );
            
            const totalSpent = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
            const usagePercentage = bank.creditLimit ? (totalSpent / bank.creditLimit) * 100 : 0;

            return (
              <div key={bank.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: bank.color }}
                    >
                      {getBankIcon(bank.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {bank.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getTypeLabel(bank.type)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewInvoice(bank.id)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Ver Fatura"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(bank)}
                      className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bank.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Gasto no Mês
                    </span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(totalSpent)}
                    </span>
                  </div>

                  {bank.type === 'credit' && bank.creditLimit && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Limite Disponível
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(bank.creditLimit - totalSpent)}
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            usagePercentage > 90 ? 'bg-red-500' : 
                            usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>0%</span>
                        <span>{usagePercentage.toFixed(1)}% usado</span>
                        <span>100%</span>
                      </div>

                      {bank.closingDay && bank.dueDay && (
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Fecha dia {bank.closingDay}</span>
                          </div>
                          <span>Vence dia {bank.dueDay}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => viewInvoice(bank.id)}
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Ver Detalhes da Fatura
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BankModal 
        isOpen={showBankModal}
        onClose={handleCloseModal}
        bank={editingBank}
      />
    </div>
  );
};

export default BanksPage;
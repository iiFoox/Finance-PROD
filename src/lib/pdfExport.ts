import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Bank } from '../types';

interface ExportOptions {
  title: string;
  subtitle?: string;
  transactions: Transaction[];
  bank?: Bank;
  startDate?: Date;
  endDate?: Date;
  totalIncome?: number;
  totalExpenses?: number;
}

export const exportTransactionsToPDF = ({
  title,
  subtitle,
  transactions,
  bank,
  startDate,
  endDate,
  totalIncome,
  totalExpenses
}: ExportOptions) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Configurações de estilo
  const primaryColor = '#3B82F6';
  const secondaryColor = '#6B7280';
  const successColor = '#10B981';
  const dangerColor = '#EF4444';

  // Título
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });

  // Subtítulo (se houver)
  if (subtitle) {
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor);
    doc.text(subtitle, pageWidth / 2, 30, { align: 'center' });
  }

  // Informações do banco (se houver)
  let yPos = subtitle ? 45 : 35;
  if (bank) {
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text(`Banco: ${bank.name}`, 14, yPos);
    if (bank.type === 'credit') {
      doc.text(`Limite: ${formatCurrency(bank.creditLimit || 0)}`, 14, yPos + 7);
      doc.text(`Vencimento: Dia ${bank.dueDay}`, 14, yPos + 14);
      yPos += 21;
    } else {
      yPos += 7;
    }
  }

  // Período (se houver)
  if (startDate && endDate) {
    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.text(
      `Período: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`,
      14,
      yPos
    );
    yPos += 7;
  }

  // Totais (se houver)
  if (totalIncome !== undefined && totalExpenses !== undefined) {
    const balance = totalIncome - totalExpenses;
    
    doc.setFontSize(12);
    doc.setTextColor(successColor);
    doc.text(`Total Receitas: ${formatCurrency(totalIncome)}`, 14, yPos + 7);
    
    doc.setTextColor(dangerColor);
    doc.text(`Total Despesas: ${formatCurrency(totalExpenses)}`, 14, yPos + 14);
    
    doc.setTextColor(balance >= 0 ? successColor : dangerColor);
    doc.text(`Saldo: ${formatCurrency(balance)}`, 14, yPos + 21);
    
    yPos += 28;
  }

  // Tabela de transações
  const tableData = transactions.map(t => [
    t.date.toLocaleDateString('pt-BR'),
    t.description,
    t.category,
    t.paymentMethod === 'creditCard' ? 'Cartão de Crédito' :
    t.paymentMethod === 'debitCard' ? 'Cartão de Débito' :
    t.paymentMethod === 'pix' ? 'PIX' : 'Dinheiro/Outros',
    t.type === 'income' ? formatCurrency(t.amount) : '',
    t.type === 'expense' ? formatCurrency(t.amount) : '',
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Data', 'Descrição', 'Categoria', 'Pagamento', 'Receita', 'Despesa']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: '#FFFFFF',
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Data
      1: { cellWidth: 'auto' }, // Descrição
      2: { cellWidth: 35 }, // Categoria
      3: { cellWidth: 35 }, // Pagamento
      4: { cellWidth: 25, halign: 'right' }, // Receita
      5: { cellWidth: 25, halign: 'right' }, // Despesa
    },
    alternateRowStyles: {
      fillColor: '#F9FAFB',
    },
    margin: { top: 10 },
  });

  // Rodapé
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(secondaryColor);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR')}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Salvar o PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}; 
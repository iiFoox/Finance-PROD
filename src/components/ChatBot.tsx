import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
  isSuccess?: boolean;
}

interface ChatBotProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const {
    transactions,
    banks,
    budgets,
    goals,
    getCurrentMonthTransactions,
    getCurrentMonthBalance,
    addTransaction,
    addBudget,
    addGoal,
    addBank,
    addNotification,
    selectedYear,
    selectedMonth
  } = useFinance();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! 👋 Sou seu assistente financeiro inteligente. Posso ajudar você a:\n\n💰 Adicionar transações e receitas\n📊 Consultar saldos e gastos\n🎯 Criar orçamentos e metas\n📈 Analisar seus hábitos financeiros\n🏦 Gerenciar bancos e cartões\n\nComo posso ajudar você hoje?',
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGemini = async (prompt: string, isJson = false) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Chave da API do Gemini não configurada. Verifique o arquivo .env');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const payload: any = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
    
    if (isJson) {
      payload.generationConfig.responseMimeType = "application/json";
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`Erro na API: ${response.status}`);
      }

      const result = await response.json();
     
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const textResponse = result.candidates[0].content.parts[0].text.trim();
        
        if (isJson) {
          try {
            return JSON.parse(textResponse);
          } catch(e) {
            console.error("Failed to parse JSON response from AI", textResponse);
            return { type: 'clarification', response: 'Desculpe, não consegui processar sua solicitação. Pode reformular?' };
          }
        }
        
        return textResponse;
      } else {
        console.warn("Gemini response is empty or has an unexpected structure:", result);
        throw new Error('Resposta vazia da API');
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  };

  const getFinancialContext = () => {
    try {
      const currentTransactions = getCurrentMonthTransactions();
      const currentBalance = getCurrentMonthBalance();
      const totalIncome = currentTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = currentTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      const categoryExpenses = currentTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      return {
        currentBalance: Number(currentBalance) || 0,
        totalIncome: Number(totalIncome) || 0,
        totalExpenses: Number(totalExpenses) || 0,
        transactionCount: currentTransactions.length,
        categoryExpenses,
        banks: banks.map(b => ({ id: b.id, name: b.name, type: b.type })),
        budgets: budgets.map(b => ({ category: b.category, target: b.targetAmount, month: b.month })),
        goals: goals.map(g => ({ title: g.title, target: g.targetAmount, current: g.currentAmount, category: g.category })),
        selectedMonth: selectedMonth + 1,
        selectedYear,
        recentTransactions: currentTransactions.slice(0, 3).map(t => ({
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
          date: t.date.toLocaleDateString('pt-BR')
        }))
      };
    } catch (error) {
      console.error('Erro ao obter contexto financeiro:', error);
      return {
        currentBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        transactionCount: 0,
        categoryExpenses: {},
        banks: [],
        budgets: [],
        goals: [],
        selectedMonth: selectedMonth + 1,
        selectedYear,
        recentTransactions: []
      };
    }
  };

  const smartCategorizeDescription = (description: string): { category: string; type: 'income' | 'expense' } => {
    const desc = description.toLowerCase();
    
    // Mapeamento inteligente de palavras-chave para categorias
    const categoryMappings = {
      // Alimentação
      'Alimentação': {
        keywords: ['ifood', 'uber eats', 'rappi', 'mcdonalds', 'burger king', 'kfc', 'subway', 'pizza', 'restaurante', 'lanchonete', 'padaria', 'açougue', 'mercado', 'supermercado', 'feira', 'hortifruti', 'comida', 'almoço', 'jantar', 'café', 'bebida', 'cerveja', 'refrigerante', 'água', 'leite', 'pão', 'carne', 'frango', 'peixe', 'verdura', 'fruta', 'doce', 'chocolate', 'sorvete', 'delivery', 'entrega'],
        type: 'expense' as const
      },
      
      // Transporte
      'Transporte': {
        keywords: ['uber', 'cabify', '99', 'taxi', 'ônibus', 'metro', 'trem', 'gasolina', 'etanol', 'diesel', 'combustível', 'posto', 'shell', 'petrobras', 'ipiranga', 'br', 'estacionamento', 'pedágio', 'vinheta', 'multa', 'detran', 'ipva', 'seguro auto', 'mecânico', 'oficina', 'pneu', 'óleo', 'revisão', 'carro', 'moto', 'bicicleta', 'patinete', 'transporte público', 'bilhete único', 'cartão transporte'],
        type: 'expense' as const
      },
      
      // Moradia
      'Moradia': {
        keywords: ['aluguel', 'condomínio', 'iptu', 'luz', 'energia', 'água', 'gás', 'internet', 'telefone', 'celular', 'tv', 'streaming', 'netflix', 'amazon prime', 'spotify', 'limpeza', 'faxina', 'porteiro', 'segurança', 'reforma', 'pintura', 'eletricista', 'encanador', 'pedreiro', 'móveis', 'decoração', 'casa', 'apartamento'],
        type: 'expense' as const
      },
      
      // Lazer
      'Lazer': {
        keywords: ['cinema', 'teatro', 'show', 'festa', 'balada', 'bar', 'pub', 'clube', 'academia', 'ginásio', 'piscina', 'parque', 'zoológico', 'museu', 'exposição', 'viagem', 'hotel', 'pousada', 'passagem', 'avião', 'rodoviária', 'turismo', 'passeio', 'diversão', 'entretenimento', 'jogo', 'videogame', 'livro', 'revista', 'jornal', 'hobby', 'esporte', 'futebol', 'tênis', 'natação'],
        type: 'expense' as const
      },
      
      // Saúde
      'Saúde': {
        keywords: ['médico', 'dentista', 'hospital', 'clínica', 'farmácia', 'remédio', 'medicamento', 'exame', 'consulta', 'cirurgia', 'tratamento', 'fisioterapia', 'psicólogo', 'psiquiatra', 'oftalmologista', 'cardiologista', 'dermatologista', 'ginecologista', 'pediatra', 'ortopedista', 'laboratório', 'raio-x', 'ultrassom', 'ressonância', 'tomografia', 'vacina', 'plano de saúde', 'convênio', 'unimed', 'bradesco saúde', 'amil', 'sulamerica'],
        type: 'expense' as const
      },
      
      // Educação
      'Educação': {
        keywords: ['escola', 'faculdade', 'universidade', 'curso', 'aula', 'professor', 'mensalidade', 'matrícula', 'material escolar', 'livro didático', 'caderno', 'caneta', 'lápis', 'mochila', 'uniforme', 'transporte escolar', 'lanche escolar', 'formatura', 'diploma', 'certificado', 'idioma', 'inglês', 'espanhol', 'francês', 'alemão', 'informática', 'computação', 'programação'],
        type: 'expense' as const
      },
      
      // Salário (Receita)
      'Salário': {
        keywords: ['salário', 'ordenado', 'pagamento', 'pró-labore', 'comissão', 'bonus', 'gratificação', '13º salário', 'férias', 'horas extras', 'adicional', 'trabalho', 'emprego', 'empresa', 'patrão', 'chefe'],
        type: 'income' as const
      },
      
      // Investimentos (Receita)
      'Investimentos': {
        keywords: ['dividendo', 'juros', 'rendimento', 'aplicação', 'poupança', 'cdb', 'lci', 'lca', 'tesouro', 'ações', 'fii', 'fundo', 'bitcoin', 'crypto', 'investimento', 'corretora', 'xp', 'rico', 'clear', 'inter', 'nubank', 'itaú', 'bradesco', 'santander', 'banco do brasil', 'caixa'],
        type: 'income' as const
      }
    };

    // Procurar por correspondências
    for (const [category, data] of Object.entries(categoryMappings)) {
      for (const keyword of data.keywords) {
        if (desc.includes(keyword)) {
          return { category, type: data.type };
        }
      }
    }

    // Padrão: despesa em "Outros"
    return { category: 'Outros', type: 'expense' };
  };

  const executeAction = async (actionData: any) => {
    try {
      console.log('Executando ação:', actionData);
      
      switch (actionData.action) {
        case 'add_transaction':
          // Validar dados obrigatórios
          if (!actionData.amount || !actionData.description) {
            throw new Error('Dados incompletos para criar a transação');
          }

          // Categorização inteligente se não foi especificada
          let category = actionData.category;
          let type = actionData.transactionType;
          
          if (!category || !type) {
            const smartCategory = smartCategorizeDescription(actionData.description);
            category = category || smartCategory.category;
            type = type || smartCategory.type;
          }

          const transactionData = {
            type: type as 'income' | 'expense',
            amount: Number(actionData.amount),
            category: String(category),
            description: String(actionData.description),
            date: actionData.date ? new Date(actionData.date) : new Date(),
            paymentMethod: (actionData.paymentMethod || 'money') as 'money' | 'creditCard' | 'debitCard' | 'pix',
            bankId: actionData.bankId || undefined
          };

          console.log('Dados da transação:', transactionData);
          
          await addTransaction(transactionData);
          
          await addNotification({
            title: 'Transação Adicionada via Chat',
            message: `${type === 'income' ? 'Receita' : 'Despesa'} de R$ ${actionData.amount.toFixed(2)} adicionada`,
            type: 'success',
            date: new Date(),
            read: false
          });
          
          return `✅ Transação adicionada com sucesso!\n\n💰 ${type === 'income' ? 'Receita' : 'Despesa'} de R$ ${Number(actionData.amount).toFixed(2)}\n📂 Categoria: ${category}\n📝 Descrição: ${actionData.description}\n\nVocê pode ver a transação na página de Transações! 🎉`;

        case 'add_budget':
          if (!actionData.category || !actionData.amount) {
            throw new Error('Dados incompletos para criar o orçamento');
          }

          const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
          await addBudget({
            category: String(actionData.category),
            targetAmount: Number(actionData.amount),
            month: monthKey,
            alertThreshold: Number(actionData.alertThreshold) || 80
          });
          return `🎯 Orçamento criado com sucesso!\n\n💰 R$ ${Number(actionData.amount).toFixed(2)} para ${actionData.category}\n📅 Mês: ${selectedMonth + 1}/${selectedYear}\n⚠️ Alerta em: ${actionData.alertThreshold || 80}%`;

        case 'add_goal':
          if (!actionData.title || !actionData.amount || !actionData.targetDate) {
            throw new Error('Dados incompletos para criar a meta');
          }

          await addGoal({
            title: String(actionData.title),
            description: String(actionData.description || ''),
            targetAmount: Number(actionData.amount),
            currentAmount: Number(actionData.currentAmount) || 0,
            targetDate: new Date(actionData.targetDate),
            category: String(actionData.category),
            priority: (actionData.priority || 'medium') as 'low' | 'medium' | 'high',
            isCompleted: false
          });
          return `🎯 Meta "${actionData.title}" criada com sucesso!\n\n💰 Objetivo: R$ ${Number(actionData.amount).toFixed(2)}\n📂 Categoria: ${actionData.category}\n📅 Data alvo: ${new Date(actionData.targetDate).toLocaleDateString('pt-BR')}`;

        case 'add_bank':
          if (!actionData.name || !actionData.type) {
            throw new Error('Dados incompletos para adicionar o banco');
          }

          await addBank({
            name: String(actionData.name),
            color: String(actionData.color) || '#3B82F6',
            type: actionData.type as 'credit' | 'debit' | 'account',
            creditLimit: actionData.creditLimit ? Number(actionData.creditLimit) : undefined,
            closingDay: actionData.closingDay ? Number(actionData.closingDay) : undefined,
            dueDay: actionData.dueDay ? Number(actionData.dueDay) : undefined
          });
          return `🏦 Banco/Cartão "${actionData.name}" adicionado com sucesso!\n\n📋 Tipo: ${actionData.type === 'credit' ? 'Cartão de Crédito' : actionData.type === 'debit' ? 'Cartão de Débito' : 'Conta Corrente'}`;

        default:
          throw new Error('Ação não reconhecida');
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const context = getFinancialContext();
      
      // Primeiro, determinar se é uma ação ou consulta
      const actionPrompt = `
Você é um assistente financeiro inteligente. Analise a mensagem e determine se o usuário quer EXECUTAR uma ação ou fazer uma CONSULTA.

Mensagem: "${currentInput}"

IMPORTANTE: Responda SEMPRE em JSON válido.

Para ADICIONAR TRANSAÇÃO (despesa/receita/gasto), use:
{
  "type": "action",
  "action": "add_transaction",
  "transactionType": "expense" ou "income",
  "amount": valor_numerico,
  "category": "Alimentação" ou "Transporte" ou "Moradia" ou "Lazer" ou "Saúde" ou "Educação" ou "Salário" ou "Investimentos" ou "Outros",
  "description": "descrição_clara",
  "paymentMethod": "money"
}

CATEGORIZAÇÃO INTELIGENTE:
- iFood, Uber Eats, restaurante, comida → Alimentação
- Uber, taxi, gasolina, ônibus → Transporte  
- Aluguel, luz, água, internet → Moradia
- Cinema, bar, viagem → Lazer
- Médico, farmácia, remédio → Saúde
- Curso, escola, livro → Educação
- Salário, pagamento, trabalho → Salário (income)
- Dividendo, juros, investimento → Investimentos (income)

Para CRIAR ORÇAMENTO, use:
{
  "type": "action", 
  "action": "add_budget",
  "category": "categoria",
  "amount": valor_numerico,
  "alertThreshold": 80
}

Para CRIAR META, use:
{
  "type": "action",
  "action": "add_goal", 
  "title": "título_da_meta",
  "amount": valor_numerico,
  "category": "categoria",
  "targetDate": "2024-12-31",
  "priority": "medium"
}

Para CONSULTAS (ver saldo, analisar gastos, etc), use:
{
  "type": "query"
}

Se não entender, use:
{
  "type": "clarification"
}

Exemplos:
- "gastei 50 reais no ifood" → add_transaction (expense, Alimentação)
- "recebi meu salário de 3000" → add_transaction (income, Salário)
- "qual meu saldo?" → query
- "crie um orçamento de 500 para alimentação" → add_budget
`;

      const actionResult = await callGemini(actionPrompt, true);
      console.log('Resultado da análise:', actionResult);
      
      if (actionResult?.type === 'action') {
        try {
          // Executar a ação
          const executionResult = await executeAction(actionResult);
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: executionResult,
            timestamp: new Date(),
            isSuccess: true
          };
          setMessages(prev => [...prev, assistantMessage]);
          
        } catch (actionError) {
          console.error('Erro na execução da ação:', actionError);
          
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `❌ Erro ao executar a ação: ${actionError.message}\n\nTente reformular sua solicitação ou verifique se todos os dados necessários foram fornecidos.`,
            timestamp: new Date(),
            isError: true
          };
          setMessages(prev => [...prev, errorMessage]);
        }
        
      } else {
        // Consulta ou esclarecimento
        const responsePrompt = `
Você é um assistente financeiro amigável e inteligente. Responda à pergunta usando os dados fornecidos.

Dados financeiros (${context.selectedMonth}/${context.selectedYear}):
- Saldo atual: R$ ${context.currentBalance.toFixed(2)}
- Receitas: R$ ${context.totalIncome.toFixed(2)}
- Despesas: R$ ${context.totalExpenses.toFixed(2)}
- Transações: ${context.transactionCount}

Gastos por categoria:
${Object.entries(context.categoryExpenses).map(([cat, amount]) => `- ${cat}: R$ ${amount.toFixed(2)}`).join('\n') || 'Nenhum gasto'}

Bancos: ${context.banks.map(b => b.name).join(', ') || 'Nenhum'}
Orçamentos: ${context.budgets.length} ativos
Metas: ${context.goals.length} definidas

Pergunta: "${currentInput}"

Responda de forma natural, útil e amigável. Use emojis. Se o usuário quiser adicionar algo, ofereça ajuda específica.

Exemplos de respostas úteis:
- Para "qual meu saldo": "Seu saldo atual é R$ X,XX. Você teve R$ Y em receitas e R$ Z em despesas este mês."
- Para "onde gastei mais": "Sua maior categoria de gastos foi X com R$ Y,YY, representando Z% do total."
- Para "como adicionar gasto": "Para adicionar um gasto, você pode dizer algo como 'gastei 50 reais no supermercado' ou 'paguei 30 reais de uber'."
`;

        const response = await callGemini(responsePrompt);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response || 'Desculpe, não consegui processar sua solicitação. Pode tentar reformular?',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      let errorContent = 'Desculpe, ocorreu um erro ao processar sua mensagem. ';
      
      if (error.message.includes('não configurada')) {
        errorContent += 'A API do Gemini não está configurada corretamente.';
      } else if (error.message.includes('Erro na API')) {
        errorContent += 'Problema na comunicação com a IA. Tente novamente.';
      } else {
        errorContent += 'Tente reformular sua solicitação.';
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Verificar se a API está configurada
  const isApiConfigured = !!import.meta.env.VITE_GEMINI_API_KEY;

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-50 animate-pulse"
        title="Abrir Chat com IA"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md lg:max-w-lg h-[70vh] sm:h-[600px] bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base">Assistente Financeiro</h3>
            <p className="text-xs text-blue-100">
              {isApiConfigured ? '🟢 Online' : '🔴 API não configurada'}
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* API Warning */}
      {!isApiConfigured && (
        <div className="bg-yellow-900/20 border-b border-yellow-800 p-2 sm:p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            <p className="text-xs text-yellow-300">
              API do Gemini não configurada. Verifique o arquivo .env
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-600' 
                  : message.isError
                  ? 'bg-red-600'
                  : message.isSuccess
                  ? 'bg-green-600'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : message.isError ? (
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : message.isSuccess ? (
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </div>
              <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.isError
                  ? 'bg-red-900/20 border border-red-800 text-red-200'
                  : message.isSuccess
                  ? 'bg-green-900/20 border border-green-800 text-green-200'
                  : 'bg-slate-700 text-gray-100'
              }`}>
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className="text-xs opacity-70 mt-1 sm:mt-2">
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="bg-slate-700 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-400" />
                  <span className="text-xs sm:text-sm text-gray-300">Processando...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isApiConfigured ? "Ex: gastei 50 reais no ifood" : "Configure a API primeiro..."}
            disabled={isLoading || !isApiConfigured}
            className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder-gray-400 text-xs sm:text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || !isApiConfigured}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Powered by Gemini AI • {isApiConfigured ? 'Pronto para usar' : 'Configuração necessária'}
        </p>
      </div>
    </div>
  );
};

export default ChatBot;
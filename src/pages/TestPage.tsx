import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🎉 Página de Teste Funcionando!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Se você está vendo esta página, o roteamento está funcionando!
        </p>
        <div className="mt-8">
          <a 
            href="/" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Voltar para Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage; 
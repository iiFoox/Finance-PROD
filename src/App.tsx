import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Página de teste muito simples
const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 TESTE FUNCIONANDO!</h1>
      <p>Se você vê isso, o roteamento está ok!</p>
      <a href="/">Voltar</a>
    </div>
  );
};

// Página inicial simples
const HomePage: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🏠 HOME PAGE</h1>
      <p>Página inicial funcionando!</p>
      <a href="/test">Ir para Teste</a>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<div>404 - Página não encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;
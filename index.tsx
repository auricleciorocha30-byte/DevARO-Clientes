import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('DevARO CRM: Iniciando aplicação no ambiente Vercel...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Erro crítico: Elemento #root não encontrado no DOM.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('DevARO CRM: Aplicação renderizada com sucesso.');
  } catch (error) {
    console.error("Erro durante a renderização inicial:", error);
  }
}

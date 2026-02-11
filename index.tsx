import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Falha ao renderizar App:", error);
    container.innerHTML = `
      <div style="padding: 20px; color: red;">
        <h1>Erro Crítico</h1>
        <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      </div>
    `;
  }
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

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
      <div style="padding: 20px; color: red; font-family: sans-serif; text-align: center;">
        <h1>Erro Crítico DevARO</h1>
        <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <button onclick="location.reload()" style="padding: 10px 20px; border-radius: 8px; border: none; bg: #2563eb; color: white; cursor: pointer;">Recarregar</button>
      </div>
    `;
  }
}

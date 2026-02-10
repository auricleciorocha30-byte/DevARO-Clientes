import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientModal from './components/ClientModal';
import { Client, ClientStatus, View } from './types';
import { INITIAL_CLIENTS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('devaro_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    localStorage.setItem('devaro_clients', JSON.stringify(clients));
  }, [clients]);

  const handleAddOrEditClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (editingClient) {
      setClients(prev => prev.map(c => 
        c.id === editingClient.id 
          ? { ...c, ...clientData } 
          : c
      ));
    } else {
      const newClient: Client = {
        ...clientData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      setClients([...clients, newClient]);
    }
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Deseja realmente remover este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const handleUpdateStatus = (id: string, status: ClientStatus) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const testingAlertsCount = clients.filter(client => {
    if (client.status !== ClientStatus.TESTING) return false;
    const diffDays = (new Date().getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 5 && diffDays <= 7;
  }).length;

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard clients={clients} />;
      case 'clients':
        return (
          <ClientList 
            clients={clients} 
            onAdd={() => { setEditingClient(null); setIsModalOpen(true); }} 
            onEdit={handleEditClick}
            onDelete={handleDeleteClient}
            onUpdateStatus={handleUpdateStatus}
          />
        );
      case 'settings':
        return (
          <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-900">Configurações DevARO</h2>
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Link de Pagamento Padrão</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    defaultValue="https://pay.devaro.com/checkout" 
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                    Salvar
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Este link será usado como base para as mensagens enviadas aos clientes.</p>
              </div>
              
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-sm font-medium text-blue-800">Sobre o Sistema</p>
                <p className="text-xs text-blue-600 mt-1">Versão 1.0.0. Gestão manual de assinaturas focada em Apps DevARO.</p>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard clients={clients} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar currentView={view} setView={setView} />
      
      <main className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {view === 'dashboard' ? 'Painel Geral' : 
               view === 'clients' ? 'Gerenciar Clientes' : 'Configurações'}
            </h1>
            <p className="text-slate-500">Bem-vindo de volta ao centro de controle DevARO.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setView('dashboard')}
              className="relative p-2 bg-white rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <Bell size={20} className="text-slate-600" />
              {testingAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold">
                  {testingAlertsCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-xl shadow-sm border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                AR
              </div>
              <span className="text-sm font-semibold text-slate-700">Admin DevARO</span>
            </div>
          </div>
        </header>

        {renderContent()}

        {isModalOpen && (
          <ClientModal 
            onClose={() => { setIsModalOpen(false); setEditingClient(null); }} 
            onSave={handleAddOrEditClient}
            initialData={editingClient}
          />
        )}
      </main>
    </div>
  );
};

export default App;
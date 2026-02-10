
import React, { useState, useEffect } from 'react';
import { Bell, Info } from 'lucide-react';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import ClientList from './components/ClientList.tsx';
import ClientModal from './components/ClientModal.tsx';
import { Client, ClientStatus, View } from './types.ts';
import { INITIAL_CLIENTS } from './constants.ts';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('devaro_clients_data');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch (e) {
      console.error("Failed to load clients from localStorage", e);
      return INITIAL_CLIENTS;
    }
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    localStorage.setItem('devaro_clients_data', JSON.stringify(clients));
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
      case 'automations':
        return (
          <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-slate-300">
             <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Info className="text-blue-500" size={32} />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Painel de Automações</h2>
             <p className="text-slate-500 max-w-md mx-auto">
               Aqui você poderá configurar gatilhos automáticos para enviar mensagens no dia anterior ao vencimento e após 2 dias de atraso.
             </p>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6">Configurações DevARO</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold">Link de Pagamento Padrão</p>
                </div>
                <input type="text" className="bg-white border rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500" defaultValue="https://pay.devaro.com/checkout" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold">Notificações por E-mail</p>
                  <p className="text-sm text-slate-500">Enviar cópia das automações para o admin.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center px-1">
                   <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                </div>
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
               view === 'clients' ? 'Gerenciar Clientes' : 
               view === 'automations' ? 'Automações Inteligentes' : 'Configurações'}
            </h1>
            <p className="text-slate-500">Bem-vindo ao CRM DevARO - Gestão de Apps Mensais.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div 
              onClick={() => setView('dashboard')}
              className="relative p-2 bg-white rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
              title="Alertas de Teste"
            >
              <Bell size={20} className="text-slate-600" />
              {testingAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
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

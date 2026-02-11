import React, { useState, useEffect, useRef } from 'react';
import { Bell, Download, Upload, ShieldCheck, AlertTriangle, Menu, Check } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientModal from './components/ClientModal';
import { Client, ClientStatus, View } from './types';
import { INITIAL_CLIENTS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLinkSaved, setIsLinkSaved] = useState(false);
  
  // Estados persistidos
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('devaro_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [paymentLink, setPaymentLink] = useState(() => {
    return localStorage.getItem('devaro_payment_link') || 'https://pay.devaro.com/checkout';
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efeitos de persistência automática para clientes
  useEffect(() => {
    localStorage.setItem('devaro_clients', JSON.stringify(clients));
  }, [clients]);

  const handleSavePaymentLink = () => {
    localStorage.setItem('devaro_payment_link', paymentLink);
    setIsLinkSaved(true);
    setTimeout(() => setIsLinkSaved(false), 2000);
  };

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

  const handleExportBackup = () => {
    try {
      const dataStr = JSON.stringify(clients, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `devaro_backup_${new Date().toISOString().split('T')[0]}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      alert('Erro ao gerar backup.');
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        if (Array.isArray(importedData)) {
          if (confirm(`Restaurar backup substituirá dados atuais. Continuar?`)) {
            setClients(importedData);
            alert('Backup restaurado!');
          }
        }
      } catch (error) {
        alert('Erro ao importar.');
      }
    };
    reader.readAsText(file);
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
            paymentLink={paymentLink}
          />
        );
      case 'settings':
        return (
          <div className="max-w-2xl space-y-6 pb-20">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-6 text-slate-900">Configurações DevARO</h2>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Link de Pagamento Padrão</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    placeholder="https://..."
                  />
                  <button 
                    onClick={handleSavePaymentLink}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      isLinkSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isLinkSaved ? <><Check size={18} /> Salvo</> : 'Salvar'}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-slate-400">Este link será incluído nas mensagens automáticas enviadas aos clientes.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-slate-900">Dados e Segurança</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleExportBackup} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl active:scale-95 transition-all hover:bg-slate-100">
                  <Download size={18} /> Backup JSON
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white text-sm font-bold rounded-xl active:scale-95 transition-all hover:bg-amber-600">
                  <Upload size={18} /> Restaurar Backup
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard clients={clients} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-x-hidden">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-300">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 lg:p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 bg-slate-100 text-slate-600 rounded-xl active:scale-95"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {view === 'dashboard' ? 'Início' : view === 'clients' ? 'Clientes' : 'Ajustes'}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div onClick={() => setView('dashboard')} className="relative p-2.5 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">
                <Bell size={20} className="text-slate-600" />
                {testingAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold animate-pulse">
                    {testingAlertsCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 pr-3 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">AR</div>
                <span className="text-xs font-bold text-slate-700 hidden sm:block">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1">
          {renderContent()}
        </div>

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
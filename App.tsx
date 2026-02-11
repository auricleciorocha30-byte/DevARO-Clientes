import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Check } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientModal from './components/ClientModal';
import CatalogAdmin from './components/CatalogAdmin';
import CatalogShowcase from './components/CatalogShowcase';
import { Client, ClientStatus, View, Product, CatalogConfig } from './types';
import { INITIAL_CLIENTS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLinkSaved, setIsLinkSaved] = useState(false);
  
  // Estados persistidos com segurança
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('devaro_clients');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch (e) {
      console.error("Erro ao carregar clientes:", e);
      return INITIAL_CLIENTS;
    }
  });

  const [paymentLink, setPaymentLink] = useState(() => {
    return localStorage.getItem('devaro_payment_link') || 'https://pay.devaro.com/checkout';
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('devaro_products');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
      return [];
    }
  });

  const [catalogConfig, setCatalogConfig] = useState<CatalogConfig>(() => {
    try {
      const saved = localStorage.getItem('devaro_catalog_config');
      return saved ? JSON.parse(saved) : { 
        address: 'Rua DevARO, 123 - Centro', 
        whatsapp: '5511999999999',
        companyName: 'DevARO Apps' 
      };
    } catch (e) {
      return { 
        address: 'Rua DevARO, 123 - Centro', 
        whatsapp: '5511999999999',
        companyName: 'DevARO Apps' 
      };
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [initialClientData, setInitialClientData] = useState<Partial<Client> | null>(null);

  useEffect(() => {
    localStorage.setItem('devaro_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('devaro_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('devaro_catalog_config', JSON.stringify(catalogConfig));
  }, [catalogConfig]);

  const handleSavePaymentLink = () => {
    localStorage.setItem('devaro_payment_link', paymentLink);
    setIsLinkSaved(true);
    setTimeout(() => setIsLinkSaved(false), 2000);
  };

  const handleAddOrEditClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (editingClient) {
      setClients(prev => prev.map(c => 
        c.id === editingClient.id ? { ...c, ...clientData } : c
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
    setInitialClientData(null);
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

  const handleAddProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setProducts([...products, newProd]);
  };

  const handleDeleteProduct = (id: string) => {
    if(confirm('Remover produto do encarte?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSelectProductFromShowcase = (product: Product) => {
    setInitialClientData({
      appName: product.name,
      monthlyValue: product.price,
      status: ClientStatus.TESTING
    });
    setIsModalOpen(true);
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard clients={clients} />;
      case 'clients':
        return (
          <ClientList 
            clients={clients} 
            onAdd={() => { setEditingClient(null); setInitialClientData(null); setIsModalOpen(true); }} 
            onEdit={handleEditClick}
            onDelete={handleDeleteClient}
            onUpdateStatus={handleUpdateStatus}
            paymentLink={paymentLink}
          />
        );
      case 'catalog':
        return (
          <CatalogAdmin 
            products={products}
            config={catalogConfig}
            onSaveConfig={setCatalogConfig}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            onPreview={() => setView('showcase')}
          />
        );
      case 'showcase':
        return (
          <CatalogShowcase 
            products={products}
            config={catalogConfig}
            onBack={() => setView('catalog')}
            onSelectProduct={handleSelectProductFromShowcase}
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
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard clients={clients} />;
    }
  };

  const testingAlertsCount = clients.filter(client => {
    if (client.status !== ClientStatus.TESTING) return false;
    const diffDays = (new Date().getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 5 && diffDays <= 7;
  }).length;

  return (
    <div className={`min-h-screen flex bg-slate-50 text-slate-900 overflow-x-hidden ${view === 'showcase' ? 'flex-col' : ''}`}>
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${view === 'showcase' ? '' : 'lg:ml-64'}`}>
        {view !== 'showcase' && (
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
                  {view === 'dashboard' ? 'Início' : view === 'clients' ? 'Clientes' : view === 'catalog' ? 'Encarte Digital' : 'Ajustes'}
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
              </div>
            </div>
          </header>
        )}

        <div className={`${view === 'showcase' ? '' : 'p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1'}`}>
          {renderContent()}
        </div>

        {isModalOpen && (
          <ClientModal 
            onClose={() => { setIsModalOpen(false); setEditingClient(null); setInitialClientData(null); }} 
            onSave={handleAddOrEditClient}
            initialData={editingClient || (initialClientData as Client)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
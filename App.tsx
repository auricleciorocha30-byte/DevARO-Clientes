import React, { useState, useEffect } from 'react';
import { Bell, Menu, Check, Save } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientModal from './components/ClientModal';
import CatalogAdmin from './components/CatalogAdmin';
import CatalogShowcase from './components/CatalogShowcase';
import { Client, ClientStatus, View, Product, CatalogConfig, GlobalPaymentLinks } from './types';
import { INITIAL_CLIENTS } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('view') as View) || 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLinkSaved, setIsLinkSaved] = useState(false);
  
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('devaro_clients');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch (e) {
      return INITIAL_CLIENTS;
    }
  });

  const [paymentLinks, setPaymentLinks] = useState<GlobalPaymentLinks>(() => {
    try {
      const saved = localStorage.getItem('devaro_payment_links');
      return saved ? JSON.parse(saved) : {
        link1: 'https://pay.devaro.com/link1',
        link2: '',
        link3: '',
        link4: ''
      };
    } catch (e) {
      return { link1: '', link2: '', link3: '', link4: '' };
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('devaro_products');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
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
      return { address: '', whatsapp: '', companyName: 'DevARO Apps' };
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [initialClientData, setInitialClientData] = useState<Partial<Client> | null>(null);

  // Sincroniza view com URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (view === 'dashboard') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', view);
    }
    window.history.pushState({}, '', url.toString());
  }, [view]);

  useEffect(() => localStorage.setItem('devaro_clients', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('devaro_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('devaro_catalog_config', JSON.stringify(catalogConfig)), [catalogConfig]);
  useEffect(() => localStorage.setItem('devaro_payment_links', JSON.stringify(paymentLinks)), [paymentLinks]);

  const handleSavePaymentLinks = () => {
    localStorage.setItem('devaro_payment_links', JSON.stringify(paymentLinks));
    setIsLinkSaved(true);
    setTimeout(() => setIsLinkSaved(false), 2000);
  };

  const handleAddOrEditClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (editingClient) {
      setClients(prev => prev.map(c => c.id === editingClient.id ? { ...c, ...clientData } : c));
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

  const handleDeleteClient = (id: string) => {
    if (confirm('Deseja realmente remover este cliente?')) setClients(clients.filter(c => c.id !== id));
  };

  const handleAddProduct = (prodData: Omit<Product, 'id'>) => {
    setProducts([...products, { ...prodData, id: Math.random().toString(36).substr(2, 9) }]);
  };

  const handleUpdateProduct = (id: string, prodData: Omit<Product, 'id'>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...prodData } : p));
  };

  const handleSelectProductFromShowcase = (product: Product) => {
    const resolvedLink = paymentLinks[product.paymentLinkId] || paymentLinks.link1;
    setInitialClientData({
      appName: product.name,
      monthlyValue: product.price,
      paymentLink: resolvedLink,
      status: ClientStatus.TESTING
    });
    setIsModalOpen(true);
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard clients={clients} />;
      case 'clients': return (
        <ClientList 
          clients={clients} 
          onAdd={() => { setEditingClient(null); setInitialClientData(null); setIsModalOpen(true); }} 
          onEdit={(c) => { setEditingClient(c); setIsModalOpen(true); }}
          onDelete={handleDeleteClient}
          onUpdateStatus={(id, status) => setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c))}
          paymentLink={paymentLinks.link1}
        />
      );
      case 'catalog': return (
        <CatalogAdmin 
          products={products}
          config={catalogConfig}
          globalLinks={paymentLinks}
          onSaveConfig={setCatalogConfig}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={(id) => confirm('Remover?') && setProducts(products.filter(p => p.id !== id))}
          onPreview={() => setView('showcase')}
        />
      );
      case 'showcase': return (
        <CatalogShowcase 
          products={products}
          config={catalogConfig}
          onBack={() => setView('catalog')}
          onSelectProduct={handleSelectProductFromShowcase}
        />
      );
      case 'settings': return (
        <div className="max-w-3xl space-y-6 pb-20">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-900">Configurações de Pagamento DevARO</h2>
            <p className="text-sm text-slate-500 mb-6">Configure até 4 links globais para associar aos seus produtos.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['link1', 'link2', 'link3', 'link4'] as const).map((key, idx) => (
                <div key={key} className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase">Link de Pagamento {idx + 1}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={paymentLinks[key]}
                    onChange={(e) => setPaymentLinks({...paymentLinks, [key]: e.target.value})}
                    placeholder={`https://checkout.com/plano-${idx + 1}`}
                  />
                </div>
              ))}
            </div>

            <button 
              onClick={handleSavePaymentLinks}
              className={`mt-8 w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isLinkSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLinkSaved ? <Check size={20} /> : <Save size={20} />}
              {isLinkSaved ? 'Configurações Salvas' : 'Salvar Todos os Links'}
            </button>
          </div>
        </div>
      );
      default: return <Dashboard clients={clients} />;
    }
  };

  const testingAlertsCount = clients.filter(client => {
    if (client.status !== ClientStatus.TESTING) return false;
    const diffDays = (new Date().getTime() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 5 && diffDays <= 7;
  }).length;

  return (
    <div className={`min-h-screen flex bg-slate-50 text-slate-900 overflow-x-hidden ${view === 'showcase' ? 'flex-col' : ''}`}>
      {view !== 'showcase' && (
        <Sidebar currentView={view} setView={setView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      )}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${view === 'showcase' ? '' : 'lg:ml-64'}`}>
        {view !== 'showcase' && (
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 lg:p-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-slate-100 text-slate-600 rounded-xl active:scale-95"><Menu size={24} /></button>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{view === 'dashboard' ? 'Início' : view === 'clients' ? 'Clientes' : view === 'catalog' ? 'Encarte' : 'Ajustes'}</h1>
              </div>
              <div className="relative p-2.5 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => setView('dashboard')}>
                <Bell size={20} className="text-slate-600" />
                {testingAlertsCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold animate-pulse">{testingAlertsCount}</span>}
              </div>
            </div>
          </header>
        )}
        <div className={`${view === 'showcase' ? '' : 'p-4 lg:p-8 max-w-7xl mx-auto w-full flex-1'}`}>{renderContent()}</div>
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
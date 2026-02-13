import React, { useState, useEffect } from 'react';
import { Bell, Menu, Check, Save, Database, Loader2 } from 'lucide-react';
import { initDatabase, NeonService } from './db';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientModal from './components/ClientModal';
import CatalogAdmin from './components/CatalogAdmin';
import CatalogShowcase from './components/CatalogShowcase';
import Login from './components/Login';
import { Client, ClientStatus, View, Product, CatalogConfig, GlobalPaymentLinks } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<View>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('view') as View) || 'dashboard';
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLinkSaved, setIsLinkSaved] = useState(false);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<GlobalPaymentLinks>({
    link1: '', link2: '', link3: '', link4: ''
  });
  const [catalogConfig, setCatalogConfig] = useState<CatalogConfig>({
    address: '', whatsapp: '', companyName: 'DevARO Apps'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [initialClientData, setInitialClientData] = useState<Partial<Client> | null>(null);

  // Auth local (Neon DB Session)
  useEffect(() => {
    const storedUser = localStorage.getItem('devaro_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Sync View with URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (view === 'dashboard') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', view);
    }
    window.history.pushState({}, '', url.toString());
  }, [view]);

  // Carregamento Inicial Neon DB
  useEffect(() => {
    const loadData = async () => {
      // O showcase é a única tela pública
      if (!user && view !== 'showcase') {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        await initDatabase(); // Garante tabelas e usuário padrão
        
        const [dbClients, dbProducts, dbLinks, dbCatalog] = await Promise.all([
          NeonService.getClients(),
          NeonService.getProducts(),
          NeonService.getSettings('payment_links'),
          NeonService.getSettings('catalog_config')
        ]);

        const mappedClients = (dbClients as any[]).map(c => ({
          ...c,
          appName: c.app_name,
          monthlyValue: Number(c.monthly_value),
          dueDay: c.due_day,
          paymentLink: c.payment_link,
          createdAt: c.created_at
        }));

        const mappedProducts = (dbProducts as any[]).map(p => ({
          ...p,
          price: Number(p.price),
          paymentMethods: p.payment_methods,
          paymentLinkId: p.payment_link_id,
          externalLink: p.external_link
        }));

        setClients(mappedClients);
        setProducts(mappedProducts);
        if (dbLinks) setPaymentLinks(dbLinks);
        if (dbCatalog) setCatalogConfig(dbCatalog);
      } catch (err) {
        console.error('Neon Load Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, view]);

  const refreshClients = async () => {
    const dbClients = await NeonService.getClients();
    setClients((dbClients as any[]).map(c => ({
      ...c,
      appName: c.app_name,
      monthlyValue: Number(c.monthly_value),
      dueDay: c.due_day,
      paymentLink: c.payment_link,
      createdAt: c.created_at
    })));
  };

  const refreshProducts = async () => {
    const dbProducts = await NeonService.getProducts();
    setProducts((dbProducts as any[]).map(p => ({
      ...p,
      price: Number(p.price),
      paymentMethods: p.payment_methods,
      paymentLinkId: p.payment_link_id,
      externalLink: p.external_link
    })));
  };

  const handleSavePaymentLinks = async () => {
    await NeonService.setSettings('payment_links', paymentLinks);
    setIsLinkSaved(true);
    setTimeout(() => setIsLinkSaved(false), 2000);
  };

  const handleAddOrEditClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    if (editingClient) {
      await NeonService.updateClient(editingClient.id, clientData);
    } else {
      await NeonService.addClient(clientData);
    }
    await refreshClients();
    setIsModalOpen(false);
    setEditingClient(null);
    setInitialClientData(null);
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Deseja realmente remover este cliente?')) {
      await NeonService.deleteClient(id);
      await refreshClients();
    }
  };

  const handleUpdateStatus = async (id: string, status: ClientStatus) => {
    await NeonService.updateClientStatus(id, status);
    await refreshClients();
  };

  const handleAddProduct = async (prodData: Omit<Product, 'id'>) => {
    await NeonService.addProduct(prodData);
    await refreshProducts();
  };

  const handleUpdateProduct = async (id: string, prodData: Omit<Product, 'id'>) => {
    await NeonService.updateProduct(id, prodData);
    await refreshProducts();
  };

  const handleSelectProductFromShowcase = (product: Product) => {
    const resolvedLink = paymentLinks[product.paymentLinkId || 'link1'] || paymentLinks.link1;
    setInitialClientData({
      appName: product.name,
      monthlyValue: product.price,
      paymentLink: resolvedLink,
      status: ClientStatus.TESTING
    });
    setIsModalOpen(true);
  };

  const handleSaveCatalogConfig = async (config: CatalogConfig) => {
    await NeonService.setSettings('catalog_config', config);
    setCatalogConfig(config);
  };

  const handleLoginSuccess = (userData: any) => {
    localStorage.setItem('devaro_session', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('devaro_session');
    setUser(null);
  };

  if (!user && view !== 'showcase') return <Login onLoginSuccess={handleLoginSuccess} />;

  if (isLoading && view !== 'showcase') return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <Database className="animate-pulse text-indigo-500 mb-4" size={56} />
      <p className="font-bold text-lg">Conectando ao Neon SQL...</p>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard clients={clients} />;
      case 'clients': return (
        <ClientList 
          clients={clients} 
          onAdd={() => { setEditingClient(null); setInitialClientData(null); setIsModalOpen(true); }} 
          onEdit={(c) => { setEditingClient(c); setIsModalOpen(true); }}
          onDelete={handleDeleteClient}
          onUpdateStatus={handleUpdateStatus}
          paymentLink={paymentLinks.link1}
        />
      );
      case 'catalog': return (
        <CatalogAdmin 
          products={products}
          config={catalogConfig}
          globalLinks={paymentLinks}
          onSaveConfig={handleSaveCatalogConfig}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={async (id) => { if(confirm('Remover?')){ await NeonService.deleteProduct(id); refreshProducts(); }}}
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
            <h2 className="text-xl font-bold mb-6 text-slate-900 tracking-tight">Canais de Pagamento (Neon Store)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['link1', 'link2', 'link3', 'link4'] as const).map((key, idx) => (
                <div key={key} className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase">Gateway Canal {idx + 1}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                    value={paymentLinks[key]}
                    onChange={(e) => setPaymentLinks({...paymentLinks, [key]: e.target.value})}
                    placeholder={`https://pay.devaro.com/canal-${idx + 1}`}
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={handleSavePaymentLinks}
              className={`mt-8 w-full md:w-auto px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                isLinkSaved ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isLinkSaved ? <Check size={20} /> : <Save size={20} />}
              {isLinkSaved ? 'Sincronizado no Neon DB' : 'Persistir no Banco de Dados'}
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
        <Sidebar currentView={view} setView={setView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />
      )}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${view === 'showcase' ? '' : 'lg:ml-64'}`}>
        {view !== 'showcase' && (
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 lg:p-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-slate-100 text-slate-600 rounded-xl"><Menu size={24} /></button>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">DevARO Panel</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                  <Database size={12} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase">Neon SQL Auth</span>
                </div>
                <div className="relative p-2.5 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => setView('dashboard')}>
                  <Bell size={20} className="text-slate-600" />
                  {testingAlertsCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-[10px] text-white flex items-center justify-center font-bold">{testingAlertsCount}</span>}
                </div>
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
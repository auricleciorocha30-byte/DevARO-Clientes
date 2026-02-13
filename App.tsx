
import React, { useState, useEffect } from 'react';
import { Menu, Check, Save, Database } from 'lucide-react';
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

  useEffect(() => {
    const storedUser = localStorage.getItem('devaro_session');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (view === 'dashboard') url.searchParams.delete('view');
    else url.searchParams.set('view', view);
    window.history.pushState({}, '', url.toString());
  }, [view]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('App: Sincronizando dados. View:', view);
      await initDatabase(); 
      
      // Se não estiver logado E não for o showcase, para aqui e mostra login
      if (!user && view !== 'showcase') {
        setIsLoading(false);
        return;
      }

      const [dbClients, dbProducts, dbLinks, dbCatalog] = await Promise.all([
        NeonService.getClients(),
        NeonService.getProducts(),
        NeonService.getSettings('payment_links'),
        NeonService.getSettings('catalog_config')
      ]);

      console.log('App: Produtos carregados do Neon:', dbProducts.length);

      setClients((dbClients as any[]).map(c => ({
        ...c,
        appName: c.app_name,
        monthlyValue: Number(c.monthly_value),
        dueDay: c.due_day,
        paymentLink: c.payment_link,
        createdAt: c.created_at
      })));

      setProducts((dbProducts as any[]).map(p => ({
        ...p,
        price: Number(p.price),
        paymentMethods: p.payment_methods || [],
        paymentLinkId: p.payment_link_id,
        externalLink: p.external_link
      })));

      if (dbLinks) setPaymentLinks(dbLinks);
      if (dbCatalog) setCatalogConfig(dbCatalog);
    } catch (err) {
      console.error('App: Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
    console.log('App: Refreshing produtos:', dbProducts.length);
    setProducts((dbProducts as any[]).map(p => ({
      ...p,
      price: Number(p.price),
      paymentMethods: p.payment_methods || [],
      paymentLinkId: p.payment_link_id,
      externalLink: p.external_link
    })));
  };

  const handleAddOrEditClient = async (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      if (editingClient) {
        await NeonService.updateClient(editingClient.id, clientData);
      } else {
        await NeonService.addClient(clientData);
      }
      await refreshClients();
      setIsModalOpen(false);
      setEditingClient(null);
      setInitialClientData(null);
    } catch (e) {
      alert('Erro ao salvar cliente no banco.');
    }
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

  const handleSaveCatalogConfig = async (config: CatalogConfig) => {
    await NeonService.setSettings('catalog_config', config);
    setCatalogConfig(config);
  };

  const handleLogout = () => {
    localStorage.removeItem('devaro_session');
    setUser(null);
  };

  if (isLoading && view !== 'showcase') return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
      <Database className="animate-pulse text-indigo-500 mb-6" size={64} />
      <h2 className="text-2xl font-black mb-2 tracking-tight">SINCRONIZANDO NEON</h2>
      <p className="text-slate-400 font-medium text-sm uppercase tracking-widest">Aguarde a conexão segura...</p>
    </div>
  );

  if (!user && view !== 'showcase') return <Login onLoginSuccess={(u) => { localStorage.setItem('devaro_session', JSON.stringify(u)); setUser(u); }} />;

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
          onSelectProduct={(p) => {
            setInitialClientData({
              appName: p.name,
              monthlyValue: p.price,
              paymentLink: paymentLinks[p.paymentLinkId || 'link1'] || paymentLinks.link1,
              status: ClientStatus.TESTING
            });
            setIsModalOpen(true);
          }}
        />
      );
      case 'settings': return (
        <div className="max-w-3xl space-y-6 pb-20">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-900 tracking-tight">Canais de Pagamento Globais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['link1', 'link2', 'link3', 'link4'] as const).map((key, idx) => (
                <div key={key} className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase">Canal de Gateway {idx + 1}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={paymentLinks[key]}
                    onChange={(e) => setPaymentLinks({...paymentLinks, [key]: e.target.value})}
                    placeholder={`https://pay.devaro.com/checkout-${idx + 1}`}
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={async () => { await NeonService.setSettings('payment_links', paymentLinks); setIsLinkSaved(true); setTimeout(() => setIsLinkSaved(false), 2000); }}
              className={`mt-8 px-8 py-4 rounded-xl font-black transition-all flex items-center gap-2 shadow-lg ${isLinkSaved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'}`}
            >
              {isLinkSaved ? <Check size={24} /> : <Save size={24} />}
              {isLinkSaved ? 'CONFIGURAÇÕES SALVAS' : 'ATUALIZAR GATEWAYS'}
            </button>
          </div>
        </div>
      );
      default: return <Dashboard clients={clients} />;
    }
  };

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
                <h1 className="text-xl font-black text-slate-900 tracking-tight">DevARO <span className="text-indigo-600">Panel</span></h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Neon Connected</span>
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

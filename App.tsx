
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
    try {
      const params = new URLSearchParams(window.location.search);
      return (params.get('view') as View) || 'dashboard';
    } catch {
      return 'dashboard';
    }
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
    // Correção: Envolver pushState em try-catch para evitar erros em blob URLs
    try {
      const url = new URL(window.location.href);
      if (url.protocol === 'blob:') return;

      if (view === 'dashboard') url.searchParams.delete('view');
      else url.searchParams.set('view', view);
      
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      console.warn('History API restrito neste ambiente:', e);
    }
  }, [view]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await initDatabase(); 
      
      const [dbProducts, dbLinks, dbCatalog] = await Promise.all([
        NeonService.getProducts(),
        NeonService.getSettings('payment_links'),
        NeonService.getSettings('catalog_config')
      ]);

      setProducts((dbProducts as any[]).map(p => ({
        ...p,
        price: Number(p.price),
        paymentMethods: p.payment_methods || [],
        paymentLinkId: p.payment_link_id,
        externalLink: p.external_link
      })));

      if (dbLinks) setPaymentLinks(dbLinks);
      if (dbCatalog) setCatalogConfig(dbCatalog);

      if (user) {
        const dbClients = await NeonService.getClients();
        setClients((dbClients as any[]).map(c => ({
          ...c,
          appName: c.app_name,
          monthlyValue: Number(c.monthly_value),
          dueDay: c.due_day,
          paymentLink: c.payment_link,
          createdAt: c.created_at
        })));
      }
    } catch (err) {
      console.error('Falha ao carregar Neon:', err);
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

  const handleAddOrEditClient = async (clientData: any) => {
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
    } catch (e: any) {
      alert(`Erro no banco Neon: ${e.message || 'Verifique se as colunas existem no banco'}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('devaro_session');
    setUser(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard clients={clients} />;
      case 'clients': return (
        <ClientList 
          clients={clients} 
          onAdd={() => { setEditingClient(null); setInitialClientData(null); setIsModalOpen(true); }} 
          onEdit={(c) => { setEditingClient(c); setIsModalOpen(true); }}
          onDelete={async (id) => { if(confirm('Remover?')){ await NeonService.deleteClient(id); refreshClients(); }}}
          onUpdateStatus={async (id, s) => { await NeonService.updateClientStatus(id, s); refreshClients(); }}
          paymentLink={paymentLinks.link1}
        />
      );
      case 'catalog': return (
        <CatalogAdmin 
          products={products}
          config={catalogConfig}
          globalLinks={paymentLinks}
          onSaveConfig={async (c) => { await NeonService.setSettings('catalog_config', c); setCatalogConfig(c); }}
          onAddProduct={async (p) => { await NeonService.addProduct(p); loadData(); }}
          onUpdateProduct={async (id, p) => { await NeonService.updateProduct(id, p); loadData(); }}
          onDeleteProduct={async (id) => { if(confirm('Remover?')){ await NeonService.deleteProduct(id); loadData(); }}}
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
              monthlyValue: Number(p.price),
              paymentLink: paymentLinks[p.paymentLinkId as keyof GlobalPaymentLinks] || paymentLinks.link1,
              status: ClientStatus.TESTING,
              dueDay: 10
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
                  <label className="block text-xs font-black text-slate-400 uppercase">Canal {idx + 1}</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={paymentLinks[key]}
                    onChange={(e) => setPaymentLinks({...paymentLinks, [key]: e.target.value})}
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={async () => { await NeonService.setSettings('payment_links', paymentLinks); setIsLinkSaved(true); setTimeout(() => setIsLinkSaved(false), 2000); }}
              className={`mt-8 px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isLinkSaved ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {isLinkSaved ? <Check size={20} /> : <Save size={20} />}
              {isLinkSaved ? 'Salvo' : 'Salvar Gateways'}
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
                <h1 className="text-xl font-black text-slate-900 tracking-tight">DevARO Panel</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase">Neon SQL</span>
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
            initialData={editingClient || initialClientData}
          />
        )}
      </main>
    </div>
  );
};

export default App;

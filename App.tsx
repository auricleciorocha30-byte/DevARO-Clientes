
import React, { useState, useEffect } from 'react';
import { Menu, Check, Save, Database, Bell } from 'lucide-react';
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
    } catch { return 'dashboard'; }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
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
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.protocol === 'blob:') return;
      if (view === 'dashboard') url.searchParams.delete('view');
      else url.searchParams.set('view', view);
      window.history.pushState({}, '', url.toString());
    } catch (e) {}
  }, [view]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      await initDatabase(); 
      const [dbProducts, dbLinks, dbCatalog] = await Promise.all([
        NeonService.getProducts(),
        NeonService.getSettings('payment_links'),
        NeonService.getSettings('catalog_config')
      ]);

      if (dbProducts) {
        setProducts((dbProducts as any[]).map(p => ({
          ...p, price: Number(p.price),
          paymentMethods: p.payment_methods || [],
          paymentLinkId: p.payment_link_id,
          externalLink: p.external_link
        })));
      }

      if (dbLinks) setPaymentLinks(dbLinks);
      if (dbCatalog) setCatalogConfig(dbCatalog);

      await refreshClients();
    } catch (err) {
      console.error('Falha Neon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user, view]);

  const refreshClients = async () => {
    const dbClients = await NeonService.getClients();
    
    // MAPEAMENTO CRÍTICO: Neon retorna colunas minúsculas (appname, monthlyvalue, etc)
    const mapped = (dbClients as any[]).map(c => ({
      ...c,
      appName: c.appname || 'App Indefinido',
      monthlyValue: Number(c.monthlyvalue || 0),
      dueDay: Number(c.dueday || 10),
      paymentLink: c.payment_link || '',
      createdAt: c.created_at || new Date().toISOString()
    }));
    
    setClients(mapped);
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('devaro_session', JSON.stringify(userData));
  };

  const handleAddOrEditClient = async (clientData: any) => {
    try {
      if (editingClient) {
        await NeonService.updateClient(editingClient.id, clientData);
        showToast('Dados Atualizados!');
      } else {
        await NeonService.addClient(clientData);
        showToast('Cliente Gravado!');
      }
      await refreshClients();
      setIsModalOpen(false);
      setEditingClient(null);
      setInitialClientData(null);
    } catch (e: any) {
      console.error('Erro ao salvar no Neon:', e);
      showToast('Erro ao gravar no banco.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('devaro_session');
    setUser(null);
  };

  const handleUpdateStatus = async (id: string, s: ClientStatus) => {
    try {
      await NeonService.updateClientStatus(id, s);
      // Atualização otimista local para agilidade na UI
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: s } : c));
      showToast('Status atualizado.');
    } catch (error) {
      console.error('Erro ao mudar status:', error);
      showToast('Erro ao atualizar status.', 'error');
      // Reverte se der erro buscando do servidor novamente
      await refreshClients();
    }
  };

  const openPurchaseModal = (p: Product) => {
    setInitialClientData({
      appName: p.name,
      monthlyValue: Number(p.price),
      paymentLink: paymentLinks[p.paymentLinkId as keyof GlobalPaymentLinks] || paymentLinks.link1,
      status: ClientStatus.TESTING,
      dueDay: 10
    });
    setEditingClient(null);
    setIsModalOpen(true);
  };

  if (!user && !isLoading && view !== 'showcase') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard clients={clients} />;
      case 'clients': return (
        <ClientList 
          clients={clients} 
          onAdd={() => { setEditingClient(null); setInitialClientData(null); setIsModalOpen(true); }} 
          onEdit={(c) => { setEditingClient(c); setIsModalOpen(true); }}
          onDelete={async (id) => { if(confirm('Remover definitivamente?')){ await NeonService.deleteClient(id); await refreshClients(); showToast('Removido.'); }}}
          onUpdateStatus={handleUpdateStatus}
          paymentLink={paymentLinks.link1}
        />
      );
      case 'catalog': return (
        <CatalogAdmin 
          products={products}
          config={catalogConfig}
          globalLinks={paymentLinks}
          onSaveConfig={async (c) => { await NeonService.setSettings('catalog_config', c); setCatalogConfig(c); showToast('Identidade salva!'); }}
          onAddProduct={async (p) => { await NeonService.addProduct(p); await loadData(); showToast('Produto no Ar!'); }}
          onUpdateProduct={async (id, p) => { await NeonService.updateProduct(id, p); await loadData(); showToast('Produto atualizado!'); }}
          onDeleteProduct={async (id) => { if(confirm('Retirar do encarte?')){ await NeonService.deleteProduct(id); await loadData(); showToast('Removido.'); }}}
          onPreview={() => setView('showcase')}
        />
      );
      case 'showcase': return (
        <CatalogShowcase 
          products={products}
          config={catalogConfig}
          onBack={() => setView('catalog')}
          onSelectProduct={openPurchaseModal}
        />
      );
      case 'settings': return (
        <div className="max-w-3xl bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h2 className="text-xl font-black mb-6 tracking-tight">Gateways Globais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['link1', 'link2', 'link3', 'link4'] as const).map((key, idx) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Canal de Checkout {idx + 1}</label>
                <input 
                  type="text" 
                  placeholder="Link da sua fatura..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                  value={paymentLinks[key]}
                  onChange={(e) => setPaymentLinks({...paymentLinks, [key]: e.target.value})}
                />
              </div>
            ))}
          </div>
          <button 
            onClick={async () => { await NeonService.setSettings('payment_links', paymentLinks); showToast('Canais atualizados!'); }}
            className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3"
          >
            <Save size={20} /> SALVAR ALTERAÇÕES
          </button>
        </div>
      );
      default: return <Dashboard clients={clients} />;
    }
  };

  const showSidebar = view !== 'showcase';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-x-hidden">
      {notification && (
        <div className={`fixed top-6 right-6 z-[300] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 border ${notification.type === 'success' ? 'bg-green-600 border-green-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
           {notification.type === 'success' ? <Check size={24} /> : <Bell size={24} />}
           <span className="font-bold tracking-tight">{notification.msg}</span>
        </div>
      )}

      {showSidebar && (
        <Sidebar currentView={view} setView={setView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={handleLogout} />
      )}
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showSidebar ? 'lg:ml-64' : ''}`}>
        {showSidebar && (
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 lg:p-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-slate-100 rounded-xl"><Menu size={24} /></button>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">DevARO CRM</h1>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Neon SQL Online</span>
              </div>
            </div>
          </header>
        )}

        <div className={`${showSidebar ? 'p-4 lg:p-8' : ''} max-w-7xl mx-auto w-full flex-1`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64 flex-col gap-4">
               <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sincronizando com Neon...</span>
            </div>
          ) : renderContent()}
        </div>

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

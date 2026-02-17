
import React, { useState, useEffect } from 'react';
import { Menu, Check, Save, Database, Bell, Send, Link as LinkIcon } from 'lucide-react';
import { initDatabase, NeonService } from './db';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientModal from './components/ClientModal';
import CatalogAdmin from './components/CatalogAdmin';
import CatalogShowcase from './components/CatalogShowcase';
import SellersManager from './components/SellersManager';
import AdminMessages from './components/AdminMessages';
import NotificationBell from './components/NotificationBell';
import Login from './components/Login';
import { Client, ClientStatus, View, Product, CatalogConfig, GlobalPaymentLinks, Seller, UserRole, AppMessage } from './types';

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
  
  const [clients, setClients] = useState<Client[]>(() => JSON.parse(localStorage.getItem('cache_clients') || '[]'));
  const [products, setProducts] = useState<Product[]>(() => JSON.parse(localStorage.getItem('cache_products') || '[]'));
  const [sellers, setSellers] = useState<Seller[]>(() => JSON.parse(localStorage.getItem('cache_sellers') || '[]'));
  const [messages, setMessages] = useState<AppMessage[]>([]);
  
  const [paymentLinks, setPaymentLinks] = useState<GlobalPaymentLinks>({ link1: '', link2: '', link3: '', link4: '' });
  const [catalogConfig, setCatalogConfig] = useState<CatalogConfig>({ address: '', whatsapp: '', companyName: 'DevARO Apps' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [initialClientData, setInitialClientData] = useState<Partial<Client> | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('devaro_session');
    if (storedUser) setUser(JSON.parse(storedUser));
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
    if (view === 'seller_register') {
      setIsLoading(false);
      return;
    }

    try {
      await initDatabase(); 
      const [dbProducts, dbLinks, dbCatalog] = await Promise.all([
        NeonService.getProducts(),
        NeonService.getSettings('payment_links'),
        NeonService.getSettings('catalog_config')
      ]);

      if (dbProducts) {
        const mapped = (dbProducts as any[]).map(p => ({
          ...p, price: Number(p.price),
          paymentMethods: p.payment_methods || [],
          paymentLinkId: p.payment_link_id,
          externalLink: p.external_link
        }));
        setProducts(mapped);
        localStorage.setItem('cache_products', JSON.stringify(mapped));
      }

      if (dbLinks) setPaymentLinks(dbLinks);
      if (dbCatalog) setCatalogConfig(dbCatalog);

      if (user) {
        await refreshClients();
        await refreshSellers(); 
        const msgs = await NeonService.getMessages(user.email);
        setMessages(msgs as AppMessage[]);
      }
    } catch (err) {
      console.error('Falha Neon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user, view]);

  const refreshClients = async () => {
    const sellerId = user?.role === 'SELLER' ? user.id : undefined;
    const dbClients = await NeonService.getClients(sellerId);
    const mapped = (dbClients as any[]).map(c => ({
      ...c,
      appName: c.appname || 'App Indefinido',
      monthlyValue: Number(c.monthlyvalue || 0),
      dueDay: Number(c.dueday || 10),
      paymentLink: c.payment_link || '',
      seller_id: c.seller_id,
      createdAt: c.created_at || new Date().toISOString()
    }));
    setClients(mapped);
    localStorage.setItem('cache_clients', JSON.stringify(mapped));
  };

  const refreshSellers = async () => {
    const dbSellers = await NeonService.getSellers();
    setSellers(dbSellers as Seller[]);
    localStorage.setItem('cache_sellers', JSON.stringify(dbSellers));
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('devaro_session', JSON.stringify(userData));
    setView('dashboard');
  };

  const handleAddOrEditClient = async (clientData: any) => {
    try {
      const finalSellerId = user?.role === 'SELLER' ? user.id : (clientData.seller_id || null);
      const dataToSave = { ...clientData, seller_id: finalSellerId };
      
      if (editingClient) {
        await NeonService.updateClient(editingClient.id, dataToSave);
        showToast('Dados Atualizados!');
      } else {
        await NeonService.addClient(dataToSave);
        showToast('Nova Venda Registrada!');
      }
      await refreshClients();
      setIsModalOpen(false);
      setEditingClient(null);
      setInitialClientData(null);
    } catch (e: any) {
      showToast('Erro ao sincronizar venda.', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, s: ClientStatus) => {
    try {
      await NeonService.updateClientStatus(id, s);
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: s } : c));
      showToast('Status atualizado.');
    } catch (error) {
      showToast('Erro de conexão.', 'error');
    }
  };

  const handleCopySellerLink = () => {
    const url = window.location.origin + window.location.pathname + '?view=seller_register';
    navigator.clipboard.writeText(url);
    showToast('Link do portal copiado!');
  };

  // View Externa de Cadastro de Vendedor
  if (view === 'seller_register') {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        isAdminMode={false} 
      />
    );
  }

  // Se não estiver logado e não for catálogo público, mostra Login Admin
  if (!user && !isLoading && view !== 'showcase') {
    return <Login onLoginSuccess={handleLoginSuccess} isAdminMode={true} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'dashboard': return <Dashboard clients={clients} sellers={sellers} userRole={user?.role} />;
      case 'clients': return (
        <ClientList 
          clients={clients} 
          sellers={sellers}
          userRole={user?.role}
          onAdd={() => { setEditingClient(null); setInitialClientData(null); setIsModalOpen(true); }} 
          onEdit={(c) => { setEditingClient(c); setIsModalOpen(true); }}
          onDelete={async (id) => { if(confirm('Excluir venda permanentemente?')){ await NeonService.deleteClient(id); await refreshClients(); showToast('Venda removida.'); }}}
          onUpdateStatus={handleUpdateStatus}
          paymentLink={paymentLinks.link1}
        />
      );
      case 'sellers': 
        if (user?.role !== 'ADMIN') return <Dashboard clients={clients} />;
        return (
          <SellersManager 
            sellers={sellers}
            role={user?.role}
            onAddSeller={async (data) => { await NeonService.registerSeller(data); await refreshSellers(); showToast('Vendedor cadastrado!'); }}
            onUpdateSeller={async (id, data) => { await NeonService.updateSeller(id, data); await refreshSellers(); showToast('Dados salvos!'); }}
            onDeleteSeller={async (id) => { if(confirm('Excluir este vendedor?')){ await NeonService.deleteSeller(id); await refreshSellers(); showToast('Vendedor removido.'); }}}
          />
        );
      case 'messages': 
        if (user?.role !== 'ADMIN') return <Dashboard clients={clients} />;
        return (
          <AdminMessages 
            sellers={sellers}
            onSendMessage={async (c, r) => { await NeonService.addMessage(c, r, user.name); showToast('Mensagem enviada!'); }}
          />
        );
      case 'catalog': return (
        <CatalogAdmin 
          products={products}
          config={catalogConfig}
          globalLinks={paymentLinks}
          role={user?.role}
          onSaveConfig={async (c) => { await NeonService.setSettings('catalog_config', c); setCatalogConfig(c); showToast('Layout atualizado!'); }}
          onAddProduct={async (p) => { await NeonService.addProduct(p); await loadData(); showToast('App publicado!'); }}
          onUpdateProduct={async (id, p) => { await NeonService.updateProduct(id, p); await loadData(); showToast('App atualizado!'); }}
          onDeleteProduct={async (id) => { if(confirm('Remover do catálogo?')){ await NeonService.deleteProduct(id); await loadData(); showToast('App removido.'); }}}
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
      case 'settings': 
        if (user?.role !== 'ADMIN') return <Dashboard clients={clients} />;
        return (
          <div className="max-w-4xl bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black mb-2 tracking-tighter">Canais de Checkout</h2>
            <p className="text-sm text-slate-500 mb-10 font-bold uppercase tracking-tight">Vincule os links globais para os produtos do encarte.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(['link1', 'link2', 'link3', 'link4'] as const).map((key, idx) => (
                <div key={key} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Canal de Pagamento {idx + 1}</label>
                  <input type="text" placeholder="https://pay.exemplo.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 text-sm font-bold focus:ring-4 focus:ring-blue-600/10 outline-none transition-all shadow-inner" value={paymentLinks[key]} onChange={(e) => setPaymentLinks({...paymentLinks, [key]: e.target.value})} />
                </div>
              ))}
            </div>
            <button onClick={async () => { await NeonService.setSettings('payment_links', paymentLinks); showToast('Links salvos!'); }} className="mt-12 px-16 py-6 bg-blue-600 text-white rounded-[28px] font-black text-xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 active:scale-[0.97] transition-all flex items-center gap-4">
              <Save size={28} /> SALVAR CONFIGURAÇÕES
            </button>
          </div>
        );
      default: return <Dashboard clients={clients} sellers={sellers} userRole={user?.role} />;
    }
  };

  const showSidebar = view !== 'showcase' && view !== 'seller_register';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      {notification && (
        <div className={`fixed top-10 right-10 z-[300] px-10 py-6 rounded-[32px] shadow-2xl flex items-center gap-5 animate-in slide-in-from-right-10 border-4 ${notification.type === 'success' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
           <div className="bg-white/20 p-2 rounded-xl">
             {notification.type === 'success' ? <Check size={32} /> : <Bell size={32} />}
           </div>
           <span className="font-black tracking-tight text-xl">{notification.msg}</span>
        </div>
      )}

      {showSidebar && (
        <Sidebar 
          currentView={view} 
          setView={setView} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onLogout={() => { localStorage.removeItem('devaro_session'); setUser(null); setView('dashboard'); }} 
          role={user?.role}
        />
      )}
      
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${showSidebar ? 'lg:ml-72' : ''}`}>
        {showSidebar && (
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 p-8 lg:p-10">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-6">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-4 bg-slate-100 rounded-[20px] active:scale-90 transition-all shadow-sm"><Menu size={28} /></button>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                    DevARO <span className="text-blue-600 font-light not-italic tracking-normal">{user?.role === 'SELLER' ? 'Consultoria' : 'Admin'}</span>
                  </h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestão de Vendas em Nuvem</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <NotificationBell messages={messages} clients={clients} />
                
                {user?.role === 'ADMIN' && (
                  <button 
                    onClick={handleCopySellerLink}
                    className="hidden md:flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-[20px] font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                    title="Link do Portal Vendedor"
                  >
                    <LinkIcon size={18} /> Portal
                  </button>
                )}

                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 border border-blue-100 rounded-2xl shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                    <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">{user?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={`${showSidebar ? 'p-8 lg:p-12' : ''} max-w-7xl mx-auto w-full flex-1`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-[70vh] flex-col gap-8">
               <div className="relative">
                 <div className="w-20 h-20 border-8 border-slate-100 rounded-full"></div>
                 <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin shadow-2xl absolute top-0"></div>
               </div>
               <div className="text-center">
                 <span className="text-slate-400 font-black text-[12px] uppercase tracking-[0.5em] block mb-3">Neon SQL Pipeline</span>
                 <p className="text-slate-900 font-black text-2xl tracking-tight">Sincronizando DevARO...</p>
               </div>
            </div>
          ) : renderContent()}
        </div>

        {isModalOpen && (
          <ClientModal 
            onClose={() => { setIsModalOpen(false); setEditingClient(null); setInitialClientData(null); }} 
            onSave={handleAddOrEditClient}
            initialData={editingClient || initialClientData}
            globalLinks={paymentLinks}
            sellers={sellers}
            userRole={user?.role}
          />
        )}
      </main>
    </div>
  );
};

export default App;

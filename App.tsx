
import React, { useState, useEffect } from 'react';
import { Menu, Check, Save, Database, Bell, Send } from 'lucide-react';
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
        showToast('Venda Atualizada!');
      } else {
        await NeonService.addClient(dataToSave);
        showToast('Venda Registrada!');
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

  if (view === 'seller_register') {
    return (
      <Login 
        onLoginSuccess={handleLoginSuccess} 
        isSellerRegistration={true} 
        onBack={() => setView('dashboard')}
      />
    );
  }

  if (!user && !isLoading && view !== 'showcase') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
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
      case 'sellers': return (
        <SellersManager 
          sellers={sellers}
          role={user?.role}
          onAddSeller={async (data) => { await NeonService.registerSeller(data); await refreshSellers(); showToast('Vendedor cadastrado!'); }}
          onUpdateSeller={async (id, data) => { await NeonService.updateSeller(id, data); await refreshSellers(); showToast('Salvo!'); }}
          onDeleteSeller={async (id) => { if(confirm('Excluir este vendedor?')){ await NeonService.deleteSeller(id); await refreshSellers(); showToast('Vendedor excluído.'); }}}
        />
      );
      case 'messages': return (
        <AdminMessages 
          sellers={sellers}
          onSendMessage={async (c, r) => { await NeonService.addMessage(c, r, user.name); showToast('Alerta enviado!'); }}
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
          onDeleteProduct={async (id) => { if(confirm('Remover do encarte?')){ await NeonService.deleteProduct(id); await loadData(); showToast('Produto removido.'); }}}
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
        <div className="max-w-3xl bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black mb-8 tracking-tight">Canais Globais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(['link1', 'link2', 'link3', 'link4'] as const).map((key, idx) => (
              <div key={key} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Canal {idx + 1}</label>
                <input type="text" placeholder="Cole o link..." className="w-full bg-slate-50 border border-slate-200 rounded-[24px] px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all" value={paymentLinks[key]} onChange={(e) => setPaymentLinks({...paymentLinks, [key]: e.target.value})} />
              </div>
            ))}
          </div>
          <button onClick={async () => { await NeonService.setSettings('payment_links', paymentLinks); showToast('Canais salvos!'); }} className="mt-10 px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3">
            <Save size={24} /> SALVAR CONFIGURAÇÕES
          </button>
        </div>
      );
      default: return <Dashboard clients={clients} sellers={sellers} userRole={user?.role} />;
    }
  };

  const showSidebar = view !== 'showcase' && view !== 'seller_register';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-x-hidden">
      {notification && (
        <div className={`fixed top-8 right-8 z-[300] px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 border ${notification.type === 'success' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
           {notification.type === 'success' ? <Check size={28} /> : <Bell size={28} />}
           <span className="font-black tracking-tight text-lg">{notification.msg}</span>
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
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 p-6 lg:p-8">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-slate-100 rounded-2xl active:scale-90 transition-all"><Menu size={24} /></button>
                <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">DevARO <span className="text-blue-600 font-light not-italic tracking-normal">{user?.role === 'SELLER' ? 'Consultoria' : 'Admin'}</span></h1>
              </div>
              <div className="flex items-center gap-4">
                {user?.role === 'SELLER' && <NotificationBell messages={messages} clients={clients} />}
                {user?.role === 'ADMIN' && (
                   <button 
                    onClick={() => setView('messages')}
                    className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                   >
                     <Send size={24} />
                   </button>
                )}
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{user?.name}</span>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={`${showSidebar ? 'p-6 lg:p-10' : ''} max-w-7xl mx-auto w-full flex-1`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-96 flex-col gap-6">
               <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl"></div>
               <div className="text-center">
                 <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] block mb-2">Neon SQL Sync</span>
                 <p className="text-slate-500 font-bold text-sm">Carregando dados DevARO...</p>
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

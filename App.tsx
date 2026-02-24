
import React, { useState, useEffect, useRef } from 'react';
// Added Loader2 to the lucide-react import list
import { Menu, Check, Save, Database, Bell, Send, Link as LinkIcon, Loader2, Map } from 'lucide-react';
import { initDatabase, NeonService } from './db';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientModal from './components/ClientModal';
import CatalogAdmin from './components/CatalogAdmin';
import CatalogShowcase from './components/CatalogShowcase';
import SellersManager from './components/SellersManager';
import SellersLocation from './components/SellersLocation';
import AdminMessages from './components/AdminMessages';
import NotificationBell from './components/NotificationBell';
import Login from './components/Login';
import { Client, ClientStatus, View, Product, CatalogConfig, GlobalPaymentLinks, Seller, UserRole, AppMessage, SellerPermissions, PaymentFrequency } from './types';

const safeDate = (d: any) => {
  if (!d) return new Date().toISOString();
  if (d instanceof Date) return d.toISOString();
  return String(d);
};

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
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [messages, setMessages] = useState<AppMessage[]>([]);
  
  const [paymentLinks, setPaymentLinks] = useState<GlobalPaymentLinks>({ link1: '', link2: '', link3: '', link4: '' });
  const [catalogConfig, setCatalogConfig] = useState<CatalogConfig>({ address: '', whatsapp: '', companyName: 'DevARO Apps' });
  const [sellerPermissions, setSellerPermissions] = useState<SellerPermissions>({ canDeleteClients: false });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [initialClientData, setInitialClientData] = useState<Partial<Client> | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Efeito para rastreamento de localização em tempo real (Consultores)
  useEffect(() => {
    if (user?.role === 'SELLER') {
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              await NeonService.updateSellerLocation(user.id, latitude, longitude);
            } catch (err) {
              console.error('Erro ao atualizar localização:', err);
            }
          },
          (error) => {
            console.warn('Erro GPS:', error.message);
          },
          { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
        );
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user]);

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
      const [dbProducts, dbLinks, dbCatalog, dbPermissions] = await Promise.all([
        NeonService.getProducts(),
        NeonService.getSettings('payment_links'),
        NeonService.getSettings('catalog_config'),
        NeonService.getSettings('seller_permissions')
      ]);

      if (dbProducts) {
        const mapped = (dbProducts as any[]).map(p => ({
          ...p, price: Number(p.price),
          paymentMethods: p.payment_methods || [],
          paymentLinkId: p.payment_link_id,
          externalLink: p.external_link
        }));
        setProducts(mapped);
      }

      if (dbLinks) setPaymentLinks(dbLinks);
      if (dbCatalog) setCatalogConfig(dbCatalog);
      if (dbPermissions) setSellerPermissions(dbPermissions);

      if (user) {
        await refreshClients();
        await refreshSellers(); 
        await refreshMessages();
      }
    } catch (err) {
      console.error('Falha Neon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const refreshClients = async () => {
    const sellerId = user?.role === 'SELLER' ? user.id : undefined;
    const dbClients = await NeonService.getClients(sellerId);
    const mapped = (dbClients as any[]).map(c => ({
      ...c,
      appName: c.appname || 'App Indefinido',
      monthlyValue: Number(c.monthlyvalue || 0),
      paymentFrequency: (c.payment_frequency || 'MONTHLY').toUpperCase() as PaymentFrequency,
      dueDay: Number(c.dueday || 10),
      paymentLink: c.payment_link || '',
      address: c.address || '',
      saleDate: safeDate(c.sale_date || c.created_at),
      seller_id: c.seller_id,
      createdAt: safeDate(c.created_at)
    }));
    setClients(mapped);
  };

  const refreshSellers = async () => {
    const dbSellers = await NeonService.getSellers();
    setSellers(dbSellers as Seller[]);
  };

  const refreshMessages = async () => {
    if (!user) return;
    const msgs = await NeonService.getMessages(user.email);
    setMessages(msgs as AppMessage[]);
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
      showToast('Erro ao salvar venda.', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, s: ClientStatus) => {
    try {
      await NeonService.updateClientStatus(id, s);
      setClients(prev => prev.map(c => c.id === id ? { ...c, status: s } : c));
      showToast('Status modificado.');
    } catch (error) {
      showToast('Erro ao atualizar status.', 'error');
    }
  };

  const handleCopySellerLink = () => {
    const url = window.location.origin + window.location.pathname + '?view=seller_register';
    navigator.clipboard.writeText(url);
    showToast('Link do Portal de Recrutamento Copiado!');
  };

  if (view === 'seller_register') {
    return <Login onLoginSuccess={handleLoginSuccess} isAdminMode={false} />;
  }

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
          sellerPermissions={sellerPermissions}
          onAdd={() => { setEditingClient(null); setInitialClientData(null); setIsModalOpen(true); }} 
          onEdit={(c) => { setEditingClient(c); setIsModalOpen(true); }}
          onDelete={async (id) => { if(confirm('Remover esta venda?')){ await NeonService.deleteClient(id); await refreshClients(); showToast('Venda removida.'); }}}
          onUpdateStatus={handleUpdateStatus}
          paymentLink={paymentLinks.link1}
        />
      );
      case 'sellers': 
        if (user?.role !== 'ADMIN') return <Dashboard clients={clients} userRole={user?.role} />;
        return (
          <SellersManager 
            sellers={sellers}
            role={user?.role}
            onAddSeller={async (data) => { await NeonService.registerSeller(data); await refreshSellers(); showToast('Vendedor adicionado!'); }}
            onUpdateSeller={async (id, data) => { await NeonService.updateSeller(id, data); await refreshSellers(); showToast('Dados salvos!'); }}
            onDeleteSeller={async (id) => { if(confirm('Excluir vendedor?')){ await NeonService.deleteSeller(id); await refreshSellers(); showToast('Vendedor removido.'); }}}
          />
        );
      case 'sellers_location':
        if (user?.role !== 'ADMIN') return <Dashboard clients={clients} userRole={user?.role} />;
        return <SellersLocation sellers={sellers} />;
      case 'messages': 
        if (user?.role !== 'ADMIN') return <Dashboard clients={clients} userRole={user?.role} />;
        return (
          <AdminMessages 
            sellers={sellers}
            onSendMessage={async (c, r) => { await NeonService.addMessage(c, r, user.name); await refreshMessages(); showToast('Alerta enviado!'); }}
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
          onUpdateProduct={async (id, p) => { await NeonService.updateProduct(id, p); await loadData(); showToast('App editado!'); }}
          onDeleteProduct={async (id) => { if(confirm('Remover do catálogo?')){ await NeonService.deleteProduct(id); await loadData(); showToast('Produto removido.'); }}}
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
        if (user?.role !== 'ADMIN') return <Dashboard clients={clients} userRole={user?.role} />;
        return (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100">
              <h2 className="text-4xl font-black mb-2 tracking-tighter">Canais de Checkout</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {(['link1', 'link2', 'link3', 'link4'] as const).map((key, idx) => (
                  <div key={key} className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Global {idx + 1}</label>
                    <input type="text" placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-5 text-sm font-bold focus:ring-4 focus:ring-blue-600/10 outline-none transition-all" value={paymentLinks[key]} onChange={(e) => setPaymentLinks({...paymentLinks, [key]: e.target.value})} />
                  </div>
                ))}
              </div>
              <button onClick={async () => { await NeonService.setSettings('payment_links', paymentLinks); showToast('Canais atualizados!'); }} className="mt-12 px-12 py-6 bg-blue-600 text-white rounded-[28px] font-black text-xl shadow-2xl shadow-blue-500/40 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-4">
                <Save size={28} /> SALVAR LINKS
              </button>
            </div>

            <div className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100">
              <h2 className="text-4xl font-black mb-2 tracking-tighter">Administração</h2>
              <p className="text-slate-500 font-medium mb-8">Gerencie permissões globais da equipe de consultoria.</p>
              
              <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${sellerPermissions.canDeleteClients ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Database size={28} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900">Exclusão de Vendas</h4>
                    <p className="text-sm text-slate-500 font-medium">Permitir que vendedores apaguem registros de clientes.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSellerPermissions(prev => ({ ...prev, canDeleteClients: !prev.canDeleteClients }))}
                  className={`w-20 h-10 rounded-full transition-all flex items-center px-1.5 ${sellerPermissions.canDeleteClients ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-7 h-7 bg-white rounded-full shadow-lg transform transition-transform ${sellerPermissions.canDeleteClients ? 'translate-x-10' : ''}`} />
                </button>
              </div>

              <button 
                onClick={async () => { await NeonService.setSettings('seller_permissions', sellerPermissions); showToast('Permissões atualizadas!'); }} 
                className="mt-12 px-12 py-6 bg-slate-900 text-white rounded-[28px] font-black text-xl shadow-2xl shadow-slate-900/40 hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-4"
              >
                <Database size={28} /> SALVAR PERMISSÕES
              </button>
            </div>
          </div>
        );
      default: return <Dashboard clients={clients} sellers={sellers} userRole={user?.role} />;
    }
  };

  const showSidebar = (view as string) !== 'showcase' && (view as string) !== 'seller_register';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
      {notification && (
        <div className={`fixed top-10 right-10 z-[300] px-10 py-6 rounded-[32px] shadow-2xl flex items-center gap-5 animate-in slide-in-from-right-10 border-4 ${notification.type === 'success' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
           <span className="font-black tracking-tight text-xl">{notification.msg}</span>
        </div>
      )}

      {showSidebar && (
        <Sidebar 
          currentView={view} 
          setView={setView} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onLogout={() => { 
            localStorage.removeItem('devaro_session'); 
            setUser(null); 
            setView('dashboard');
            window.location.reload(); // Force reload to ensure clean state
          }} 
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
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    DevARO <span className="text-blue-600 font-light">{user?.role === 'SELLER' ? 'Consultor' : 'Admin'}</span>
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <NotificationBell messages={messages} clients={clients} sellers={sellers} userRole={user?.role} onMessageDeleted={refreshMessages} />
                {user?.role === 'ADMIN' && (
                  <button onClick={handleCopySellerLink} className="hidden md:flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all">
                    <LinkIcon size={18} /> Portal
                  </button>
                )}
                <div className="hidden sm:block text-right">
                  <span className="text-[11px] font-black text-blue-700 uppercase block">{user?.name}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">{user?.role}</span>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={`${showSidebar ? 'p-8 lg:p-12' : ''} max-w-7xl mx-auto w-full flex-1`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-[70vh]">
               <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
          ) : renderContent()}
        </div>
      </main>

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
    </div>
  );
};

export default App;

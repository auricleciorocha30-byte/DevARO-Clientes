
import React from 'react';
import { LayoutDashboard, Users, Settings, Code2, X, ShoppingBag, LogOut, UserCheck, Send } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  role?: 'ADMIN' | 'SELLER';
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose, onLogout, role }) => {
  const isAdmin = role === 'ADMIN';

  const menuItems = [
    { id: 'dashboard' as View, label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'clients' as View, label: 'Minhas Vendas', icon: Users },
    { id: 'catalog' as View, label: 'Catálogo & Links', icon: ShoppingBag },
    { id: 'messages' as View, label: 'Enviar Alertas', icon: Send, hidden: !isAdmin },
    { id: 'sellers' as View, label: 'Gestão Vendedores', icon: UserCheck, hidden: !isAdmin },
    { id: 'settings' as View, label: 'Configurações', icon: Settings, hidden: !isAdmin },
  ].filter(item => !item.hidden);

  const handleNavClick = (view: View) => {
    setView(view);
    if (window.innerWidth < 1024) onClose();
  };

  if (currentView === 'showcase' || currentView === 'seller_register') return null;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in" onClick={onClose} />}
      <aside className={`fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col shadow-2xl z-[110] transition-transform duration-300 w-72 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 transform hover:rotate-6 transition-transform"><Code2 size={24} /></div>
            <div>
              <span className="font-black text-2xl tracking-tighter italic block">DevARO</span>
              <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">{role === 'ADMIN' ? 'Admin Panel' : 'Consultoria'}</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors active:scale-90"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-6 space-y-3 mt-6 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => handleNavClick(item.id)} 
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all active:scale-[0.98] group relative ${isActive ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 translate-x-1' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-r-full shadow-lg" />}
                <Icon size={22} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                <span className="font-black text-sm tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-6 border-t border-slate-800/50 bg-slate-900/50 space-y-5">
          <button onClick={() => confirm('Deseja realmente encerrar sua sessão?') && onLogout()} className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-black text-sm active:scale-95 group">
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" /> Encerrar Sessão
          </button>
          <div className="px-6 text-center lg:text-left">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">DevARO CRM Cloud</p>
            <p className="text-slate-600 text-[9px] font-bold mt-1">Infrastructure v1.5.5</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

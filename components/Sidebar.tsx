
import React from 'react';
import { LayoutDashboard, Users, Settings, Code2, X, ShoppingBag, LogOut, UserCheck } from 'lucide-react';
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
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients' as View, label: 'Minhas Vendas', icon: Users },
    { id: 'catalog' as View, label: 'Apps & Links', icon: ShoppingBag }, // Agora visível para todos
    { id: 'sellers' as View, label: 'Vendedores', icon: UserCheck, hidden: !isAdmin },
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
        <div className="p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20"><Code2 size={24} /></div>
            <span className="font-bold text-2xl tracking-tight">DevARO</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 active:scale-90"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-5 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all active:scale-[0.98] ${isActive ? 'bg-blue-600 text-white shadow-xl translate-x-1' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
                <Icon size={22} />
                <span className="font-bold text-base">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 space-y-4">
          <button onClick={() => confirm('Sair do sistema?') && onLogout()} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold active:scale-95">
            <LogOut size={22} /> Sair do Painel
          </button>
          <div className="px-5">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Neon SQL Infrastructure</p>
            <p className="text-slate-400 text-xs font-medium">Cache Memory Active</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

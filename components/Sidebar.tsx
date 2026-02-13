import React from 'react';
import { LayoutDashboard, Users, Settings, Code2, X, ShoppingBag, LogOut } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose, onLogout }) => {
  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients' as View, label: 'Clientes', icon: Users },
    { id: 'catalog' as View, label: 'Encarte Digital', icon: ShoppingBag },
    { id: 'settings' as View, label: 'Configurações', icon: Settings },
  ];

  const handleNavClick = (view: View) => {
    setView(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogoutClick = () => {
    if (confirm('Deseja realmente sair do sistema DevARO?')) {
      onLogout();
    }
  };

  if (currentView === 'showcase') return null;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col shadow-2xl z-[110]
        transition-transform duration-300 ease-in-out w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Code2 size={24} />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">DevARO</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-800 rounded-xl text-slate-400 active:scale-90 transition-all">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-5 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 active:scale-[0.98] ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon size={22} className={isActive ? 'animate-pulse' : ''} />
                <span className="font-bold text-base">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-800 bg-slate-900/50 space-y-4">
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all font-bold active:scale-95"
          >
            <LogOut size={22} />
            Sair do Painel
          </button>

          <div className="px-5">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">Painel Neon SQL</p>
            <p className="text-slate-400 text-xs font-medium">v1.4.0 • Local Session</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
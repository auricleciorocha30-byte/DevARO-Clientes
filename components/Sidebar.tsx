import React from 'react';
import { LayoutDashboard, Users, Settings, Code2, X } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients' as View, label: 'Clientes', icon: Users },
    { id: 'settings' as View, label: 'Configurações', icon: Settings },
  ];

  const handleNavClick = (view: View) => {
    setView(view);
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col shadow-xl z-50
        transition-transform duration-300 ease-in-out w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <Code2 size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">DevARO</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-800 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="flex flex-col gap-1">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Suporte DevARO</p>
            <p className="text-slate-400 text-xs">ajuda@devaro.com</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
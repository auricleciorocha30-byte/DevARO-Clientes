
import React, { useState, useEffect } from 'react';
import { Bell, Info, Calendar, UserCheck, X } from 'lucide-react';
import { AppMessage, Client, ClientStatus } from '../types';

interface NotificationBellProps {
  messages: AppMessage[];
  clients: Client[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({ messages, clients }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    
    const overdueClients = clients.filter(c => 
      c.status !== ClientStatus.PAUSED && 
      (c.dueDay === currentDay || c.status === ClientStatus.LATE)
    ).map(c => ({
      id: `client-${c.id}`,
      type: 'warning',
      title: 'Vencimento Hoje',
      content: `O cliente ${c.name} tem um vencimento hoje no valor de R$ ${c.monthlyValue.toFixed(2)}.`,
      icon: Calendar,
      date: new Date().toISOString()
    }));

    const appMsgs = messages.map(m => ({
      id: `msg-${m.id}`,
      type: m.receiver_email ? 'private' : 'general',
      title: m.receiver_email ? 'Mensagem Direta' : 'Aviso Geral',
      content: m.content,
      sender: m.sender_name,
      icon: m.receiver_email ? UserCheck : Info,
      date: m.created_at
    }));

    setNotifications([...overdueClients, ...appMsgs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, [messages, clients]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95 shadow-sm"
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[190]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white border border-slate-100 rounded-[32px] shadow-2xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                Central de Alertas <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">{notifications.length}</span>
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X size={18} /></button>
            </div>
            <div className="max-h-[450px] overflow-y-auto p-2">
              {notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div key={notif.id} className={`p-4 rounded-2xl mb-2 flex gap-4 transition-all hover:scale-[1.01] ${notif.type === 'warning' ? 'bg-amber-50 border border-amber-100' : 'bg-white border border-slate-50 hover:bg-slate-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm leading-none mb-1">{notif.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{notif.content}</p>
                      {notif.sender && <p className="text-[9px] font-black text-blue-600 uppercase mt-2">De: {notif.sender}</p>}
                    </div>
                  </div>
                );
              })}
              {notifications.length === 0 && (
                <div className="py-12 text-center">
                  <Bell size={48} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-400 font-bold text-sm">Sem alertas no momento.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

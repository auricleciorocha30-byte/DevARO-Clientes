
import React, { useState, useEffect } from 'react';
import { Bell, Info, Calendar, UserCheck, X, AlertCircle } from 'lucide-react';
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
    
    // Alertas de Vencimento
    const overdueClients = clients.filter(c => 
      c.status !== ClientStatus.PAUSED && 
      (c.dueDay === currentDay || c.status === ClientStatus.LATE)
    ).map(c => ({
      id: `client-${c.id}`,
      type: 'warning',
      title: c.dueDay === currentDay ? 'Vencimento Hoje' : 'Cobrança Pendente',
      content: `O cliente ${c.name} (${c.appName}) tem vencimento programado para o valor de R$ ${c.monthlyValue.toFixed(2)}.`,
      icon: Calendar,
      date: new Date().toISOString()
    }));

    // Mensagens do Admin
    const adminMsgs = messages.map(m => ({
      id: `msg-${m.id}`,
      type: m.receiver_email ? 'private' : 'general',
      title: m.receiver_email ? 'Mensagem Privada' : 'Aviso Geral DevARO',
      content: m.content,
      sender: m.sender_name,
      icon: m.receiver_email ? UserCheck : Info,
      date: m.created_at
    }));

    const allNotifications = [...overdueClients, ...adminMsgs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setNotifications(allNotifications);
  }, [messages, clients]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95 shadow-sm"
      >
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-black">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[190]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-80 sm:w-[400px] bg-white border border-slate-100 rounded-[32px] shadow-2xl z-[200] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">Central de Alertas</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">DevARO Consultoria</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X size={18} /></button>
            </div>
            <div className="max-h-[450px] overflow-y-auto p-4 space-y-3">
              {notifications.map((notif) => {
                const Icon = notif.icon;
                return (
                  <div key={notif.id} className={`p-4 rounded-3xl flex gap-4 transition-all ${notif.type === 'warning' ? 'bg-amber-50 border border-amber-100' : 'bg-blue-50/20 border border-blue-50 hover:bg-blue-50/40'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm mb-1">{notif.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{notif.content}</p>
                      {notif.sender && <p className="text-[9px] font-black text-blue-600 uppercase mt-2 tracking-widest">Enviado por: Administrador</p>}
                    </div>
                  </div>
                );
              })}
              {notifications.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={40} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">Nenhum alerta para exibir.</p>
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

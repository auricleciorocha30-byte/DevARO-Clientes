
import React, { useState, useEffect } from 'react';
import { Bell, Info, Calendar, UserCheck, X, AlertCircle, Trash2, Clock } from 'lucide-react';
import { AppMessage, Client, ClientStatus } from '../types';
import { NeonService } from '../db';

interface NotificationBellProps {
  messages: AppMessage[];
  clients: Client[];
  onMessageDeleted: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ messages, clients, onMessageDeleted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Alertas de Vencimento
    const overdueClients = clients.filter(c => {
      if (c.status === ClientStatus.PAUSED) return false;
      if (c.status === ClientStatus.LATE) return true;

      const due = new Date();
      due.setDate(c.dueDay);
      // Se o dia de vencimento já passou neste mês, assumimos que é para o próximo (mas aqui queremos alertar ANTES)
      // Mas se hoje é 30 e vence dia 1, precisamos tratar.
      
      // Simplificação: Verifica se é hoje ou amanhã
      const todayDay = today.getDate();
      const tomorrow = new Date(today);
      tomorrow.setDate(todayDay + 1);
      const tomorrowDay = tomorrow.getDate();

      return c.dueDay === todayDay || c.dueDay === tomorrowDay;
    }).map(c => {
      const isLate = c.status === ClientStatus.LATE;
      const isToday = c.dueDay === currentDay;
      
      return {
        id: `client-${c.id}`,
        type: 'warning',
        title: isLate ? 'Cliente em Atraso' : (isToday ? 'Vencimento Hoje' : 'Vence Amanhã'),
        content: `O cliente ${c.name} (${c.appName}) ${isLate ? 'está com pagamento atrasado' : (isToday ? 'tem vencimento hoje' : 'vence amanhã')}. Valor: R$ ${c.monthlyValue.toFixed(2)}.`,
        icon: Calendar,
        date: new Date().toISOString()
      };
    });

    // Alertas de Período de Teste
    const trialClients = clients
      .filter(c => c.status === ClientStatus.TESTING)
      .map(c => {
        const saleDate = c.saleDate ? new Date(c.saleDate) : new Date(c.createdAt);
        const trialEndDate = new Date(saleDate);
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        
        const diffTime = trialEndDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 2 && diffDays >= 0) {
          return {
            id: `trial-${c.id}`,
            type: 'warning',
            title: 'Período de Teste Acabando',
            content: `O período de teste do cliente ${c.name} encerra em ${diffDays === 0 ? 'hoje' : diffDays + ' dias'}.`,
            icon: Clock,
            date: new Date().toISOString(),
            deletable: false,
            sender: undefined,
            realId: undefined
          };
        }
        return null;
      })
      .filter((n): n is NonNullable<typeof n> => n !== null);

    // Mensagens do Admin
    const adminMsgs = messages.map(m => ({
      id: `msg-${m.id}`,
      realId: m.id,
      type: m.receiver_email ? 'private' : 'general',
      title: m.receiver_email ? 'Mensagem Privada' : 'Aviso Geral DevARO',
      content: m.content,
      sender: m.sender_name,
      icon: m.receiver_email ? UserCheck : Info,
      date: m.created_at,
      deletable: true
    }));

    const allNotifications = [...overdueClients, ...trialClients, ...adminMsgs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setNotifications(allNotifications);
  }, [messages, clients]);

  const handleDeleteMessage = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await NeonService.deleteMessage(id);
      onMessageDeleted();
    } catch (err) {
      console.error('Erro ao excluir mensagem:', err);
    }
  };

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
                  <div key={notif.id} className={`p-4 rounded-3xl flex gap-4 transition-all relative group ${notif.type === 'warning' ? 'bg-amber-50 border border-amber-100' : 'bg-blue-50/20 border border-blue-50 hover:bg-blue-50/40'}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-slate-900 text-sm mb-1">{notif.title}</h4>
                        {notif.deletable && (
                           <button 
                            onClick={(e) => handleDeleteMessage(e, notif.realId)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                           >
                             <Trash2 size={14} />
                           </button>
                        )}
                      </div>
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

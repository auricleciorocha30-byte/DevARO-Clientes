
import React, { useState } from 'react';
import { Send, Users, User, ShieldAlert, Loader2 } from 'lucide-react';
import { Seller } from '../types';

interface AdminMessagesProps {
  sellers: Seller[];
  onSendMessage: (content: string, receiverEmail: string | null) => Promise<void>;
}

const AdminMessages: React.FC<AdminMessagesProps> = ({ sellers, onSendMessage }) => {
  const [content, setContent] = useState('');
  const [receiverEmail, setReceiverEmail] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSending(true);
    try {
      await onSendMessage(content, receiverEmail);
      setContent('');
      alert('Mensagem enviada com sucesso!');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Painel de Comunicação</h2>
        <p className="text-sm text-slate-500 font-medium mb-8">Envie comunicados para toda a equipe ou alertas diretos para um e-mail específico.</p>

        <form onSubmit={handleSend} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destinatário</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="button" 
                onClick={() => setReceiverEmail(null)}
                className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black text-sm ${receiverEmail === null ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-200'}`}
              >
                <Users size={20} /> TODA A EQUIPE
              </button>
              <select 
                className={`flex-1 py-4 px-4 rounded-2xl border-2 transition-all font-black text-sm outline-none ${receiverEmail !== null ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                value={receiverEmail || ''}
                onChange={(e) => setReceiverEmail(e.target.value || null)}
              >
                <option value="">SELECIONAR VENDEDOR...</option>
                {sellers.filter(s => s.approved).map(s => (
                  <option key={s.id} value={s.email}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Conteúdo da Notificação</label>
            <textarea 
              required
              rows={4}
              placeholder="Digite o aviso que aparecerá no sininho do vendedor..."
              className="w-full bg-slate-50 border border-slate-200 rounded-[32px] px-8 py-6 outline-none focus:ring-4 focus:ring-blue-600/10 text-slate-900 font-medium transition-all"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button 
              disabled={isSending}
              className="px-12 py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-blue-500/40 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-3 disabled:bg-slate-300"
            >
              {isSending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              ENVIAR ALERTA
            </button>
          </div>
        </form>
      </div>

      <div className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex items-center gap-4">
        <div className="p-3 bg-amber-600 text-white rounded-2xl">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest">Aviso de Segurança</h4>
          <p className="text-amber-700 text-sm font-medium">As mensagens enviadas ficam registradas e são visíveis instantaneamente para os destinatários logados.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;

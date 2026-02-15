
import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, DollarSign, Clock, ShieldCheck, Info } from 'lucide-react';
import { Client, ClientStatus } from '../types';

interface ClientModalProps {
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Partial<Client> | null;
}

const ClientModal: React.FC<ClientModalProps> = ({ onClose, onSave, initialData }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    appName: '',
    monthlyValue: 0,
    dueDay: 10,
    status: ClientStatus.ACTIVE,
    paymentLink: '',
  });

  const [isTrial, setIsTrial] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: (initialData as any).name || prev.name,
        email: (initialData as any).email || prev.email,
        whatsapp: (initialData as any).whatsapp || prev.whatsapp,
        address: (initialData as any).address || prev.address,
        appName: initialData.appName || prev.appName,
        monthlyValue: Number(initialData.monthlyValue) || prev.monthlyValue,
        dueDay: (initialData as any).dueDay || prev.dueDay,
        status: initialData.status || prev.status,
        paymentLink: initialData.paymentLink || prev.paymentLink,
      }));
      setIsTrial(initialData.status === ClientStatus.TESTING);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const finalData = {
        ...formData,
        status: isTrial ? ClientStatus.TESTING : formData.status
      };
      await onSave(finalData);
    } catch (err) {
      console.error('Erro no Modal ao salvar:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all overflow-y-auto">
      <div 
        className="bg-white w-full sm:max-w-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 flex flex-col rounded-t-[32px] sm:rounded-3xl my-auto"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {initialData && (initialData as any).id ? 'Editar Cadastro' : 'Finalizar Pedido'}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">DevARO Cloud Infrastructure</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all active:scale-90"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto pb-10 sm:pb-8">
          {/* AVISO IMPORTANTE SOBRE COBRANÇA */}
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-[24px] flex items-start gap-4 shadow-sm">
             <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                <Info size={24} />
             </div>
             <div>
                <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">Atenção ao Pagamento</h4>
                <p className="text-blue-700/80 text-xs font-bold leading-relaxed mt-1">
                  Não cobraremos nenhum valor agora. Após finalizar este pedido, um de nossos colaboradores entrará em contato pelo número informado para fechar a venda e configurar seu app.
                </p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu Nome / Nome da Empresa</label>
              <input
                required
                type="text"
                placeholder="Ex: Restaurante do João"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-base font-medium text-slate-900"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contato</label>
                <input
                  required
                  type="tel"
                  placeholder="85 99999-9999"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Principal</label>
                <input
                  type="email"
                  placeholder="email@cliente.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-[24px] space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-blue-600" />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumo da Solução</label>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">App Selecionado</label>
                  <input
                    readOnly
                    type="text"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-slate-900 font-bold"
                    value={formData.appName}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Investimento Mensal</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={16} />
                    <input
                      readOnly
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-slate-900 font-black"
                      value={`R$ ${formData.monthlyValue.toFixed(2)}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-indigo-900">Testar Gratuitamente</p>
                  <p className="text-[10px] text-indigo-700 font-bold uppercase">Liberar 7 dias de avaliação</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsTrial(!isTrial)}
                className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${isTrial ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${isTrial ? 'translate-x-6' : ''}`} />
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg hover:bg-blue-700 active:scale-[0.97] transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  ENVIANDO PEDIDO...
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  SOLICITAR ATENDIMENTO
                </>
              )}
            </button>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase mt-4 tracking-widest">
              Ao clicar, você concorda que nossa equipe entrará em contato.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;

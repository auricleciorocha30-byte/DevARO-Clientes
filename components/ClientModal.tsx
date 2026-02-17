
import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, DollarSign, Clock, ShieldCheck, Info, Link as LinkIcon, UserCircle, Calendar } from 'lucide-react';
import { Client, ClientStatus, GlobalPaymentLinks, Seller } from '../types';

interface ClientModalProps {
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Partial<Client> | null;
  globalLinks: GlobalPaymentLinks;
  sellers: Seller[];
  userRole?: string;
}

const ClientModal: React.FC<ClientModalProps> = ({ onClose, onSave, initialData, globalLinks, sellers, userRole }) => {
  const isAdmin = userRole === 'ADMIN';
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
    seller_id: '' as string | null
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
        dueDay: (initialData as any).dueDay || prev.dueDay || 10,
        status: initialData.status || prev.status,
        paymentLink: initialData.paymentLink || prev.paymentLink || globalLinks.link1,
        seller_id: (initialData as any).seller_id || prev.seller_id
      }));
      setIsTrial(initialData.status === ClientStatus.TESTING);
    } else {
      setFormData(prev => ({ ...prev, paymentLink: globalLinks.link1 }));
    }
  }, [initialData, globalLinks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const finalData = {
        ...formData,
        status: isTrial ? ClientStatus.TESTING : formData.status,
        seller_id: formData.seller_id || null
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
              {initialData && (initialData as any).id ? 'Editar Venda' : 'Novo Pedido de App'}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {isAdmin ? 'Painel Administrativo DevARO' : 'Cadastro de Consultor'}
            </p>
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
          <div className="space-y-4">
            {isAdmin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <UserCircle size={12} /> Atribuir a Vendedor
                </label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 font-bold"
                  value={formData.seller_id || ''}
                  onChange={(e) => setFormData({...formData, seller_id: e.target.value || null})}
                >
                  <option value="">Venda Direta (Sem Vendedor)</option>
                  {sellers.filter(s => s.approved && s.active).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Cliente</label>
              <input
                required
                type="text"
                placeholder="Ex: Pizzaria do Bairro"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-base font-bold text-slate-900"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                <input
                  required
                  type="tel"
                  placeholder="85 99999-9999"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 font-bold"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input
                  type="email"
                  placeholder="email@cliente.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-[24px] space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-blue-600" />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plano do Aplicativo</label>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome do App</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: App Delivery"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-slate-900 font-bold focus:ring-2 focus:ring-blue-600"
                    value={formData.appName}
                    onChange={(e) => setFormData({...formData, appName: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Valor Mensal</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={16} />
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-slate-900 font-black focus:ring-2 focus:ring-blue-600"
                      value={formData.monthlyValue}
                      onChange={(e) => setFormData({...formData, monthlyValue: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              {/* DUA DAY FIELD - dia do vencimento */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Calendar size={12} /> Dia do Vencimento (1-31)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="31"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl outline-none text-slate-900 font-black focus:ring-2 focus:ring-blue-600"
                  value={formData.dueDay}
                  onChange={(e) => setFormData({...formData, dueDay: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <LinkIcon size={12} /> Canal de Checkout
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['link1', 'link2', 'link3', 'link4'] as const).map((key, idx) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({...formData, paymentLink: globalLinks[key]})}
                      disabled={!globalLinks[key]}
                      className={`px-3 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${
                        formData.paymentLink === globalLinks[key] && globalLinks[key] !== ''
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' 
                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                      } ${!globalLinks[key] ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      Canal {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-indigo-900">Período de Teste</p>
                  <p className="text-[10px] text-indigo-700 font-bold uppercase">Ativar modo cortesia (7 dias)</p>
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
              className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg hover:bg-blue-700 active:scale-[0.97] transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 disabled:bg-slate-300"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  SALVANDO...
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  {initialData && (initialData as any).id ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR VENDA'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;

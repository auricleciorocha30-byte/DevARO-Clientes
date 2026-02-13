
import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, DollarSign } from 'lucide-react';
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
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(formData);
      // O fechamento ocorre no App.tsx após sucesso
    } catch (e) {
      console.error('Erro no Modal ao salvar:', e);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
      <div 
        className="bg-white w-full sm:max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[95vh] flex flex-col rounded-t-[32px] sm:rounded-3xl"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {initialData && (initialData as any).id ? 'Editar Cadastro' : 'Novo Cliente'}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">DevARO Neon Infrastructure</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all active:scale-90"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto pb-10 sm:pb-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <input
                required
                type="text"
                placeholder="Ex: Pedro Henrique"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-base font-medium text-slate-900"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail</label>
                <input
                  required
                  type="email"
                  placeholder="cliente@email.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-base text-slate-900"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
                <input
                  required
                  type="tel"
                  placeholder="DDD + Número"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-base text-slate-900"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
            </div>

            <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[24px]">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-4">Informações do Aplicativo</label>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nome do App</label>
                  <input
                    required
                    type="text"
                    placeholder="Ex: Gestor Plus"
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    value={formData.appName}
                    onChange={(e) => setFormData({...formData, appName: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Valor Mensal (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                    <input
                      required
                      type="number"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-bold"
                      value={formData.monthlyValue}
                      onChange={(e) => setFormData({...formData, monthlyValue: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade / Região</label>
              <input
                required
                type="text"
                placeholder="Ex: São Paulo - SP"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-base text-slate-900"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dia Vencimento</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="31"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold"
                    value={formData.dueDay}
                    onChange={(e) => setFormData({...formData, dueDay: parseInt(e.target.value)})}
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link de Pagamento</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 truncate text-slate-900"
                    value={formData.paymentLink}
                    onChange={(e) => setFormData({...formData, paymentLink: e.target.value})}
                  />
               </div>
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
                  GRAVANDO NO NEON...
                </>
              ) : (
                <>
                  <CheckCircle2 size={24} />
                  SALVAR REGISTRO
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

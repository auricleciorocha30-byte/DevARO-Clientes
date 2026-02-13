
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Client, ClientStatus } from '../types';

interface ClientModalProps {
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  initialData?: Partial<Client> | null;
}

const ClientModal: React.FC<ClientModalProps> = ({ onClose, onSave, initialData }) => {
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
        monthlyValue: initialData.monthlyValue || prev.monthlyValue,
        dueDay: (initialData as any).dueDay || prev.dueDay,
        status: initialData.status || prev.status,
        paymentLink: initialData.paymentLink || prev.paymentLink,
      }));
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
      <div 
        className="bg-white w-full sm:max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[92vh] sm:max-h-[95vh] flex flex-col rounded-t-3xl sm:rounded-2xl"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {initialData && (initialData as any).id ? 'Editar Cliente' : 'Finalizar Solicitação'}
            </h3>
            <p className="text-xs text-slate-500 sm:hidden">Preencha seus dados abaixo</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto pb-10 sm:pb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome do Cliente</label>
              <input
                required
                type="text"
                placeholder="Ex: João da Silva"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">E-mail</label>
                <input
                  required
                  type="email"
                  placeholder="cliente@email.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp</label>
                <input
                  required
                  type="tel"
                  placeholder="55..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <label className="block text-[10px] font-black text-blue-400 uppercase mb-2">Resumo do App</label>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">{formData.appName || 'Selecionando...'}</span>
                <span className="text-blue-600 font-black">R$ {formData.monthlyValue.toFixed(2)}</span>
              </div>
            </div>

            {!initialData?.appName && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome do Aplicativo</label>
                <input
                  required
                  type="text"
                  placeholder="Nome do app"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base"
                  value={formData.appName}
                  onChange={(e) => setFormData({...formData, appName: e.target.value})}
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30 uppercase tracking-tight"
            >
              Confirmar Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;

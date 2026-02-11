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
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: (initialData as Client).name || '',
        email: (initialData as Client).email || '',
        whatsapp: (initialData as Client).whatsapp || '',
        address: (initialData as Client).address || '',
        appName: initialData.appName || '',
        monthlyValue: initialData.monthlyValue || 0,
        dueDay: (initialData as Client).dueDay || 10,
        status: initialData.status || ClientStatus.ACTIVE,
      });
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
              {initialData && (initialData as Client).id ? 'Editar Cliente' : 'Solicitar Produto'}
            </h3>
            <p className="text-xs text-slate-500 sm:hidden">Preencha seus dados para cadastro</p>
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Seu Nome Completo</label>
              <input
                required
                type="text"
                placeholder="Ex: João Silva"
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
                  placeholder="seu@email.com"
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
                  placeholder="5511..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Endereço (Cidade/Bairro)</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
              <label className="block text-[10px] font-black text-blue-400 uppercase mb-2">Produto Selecionado</label>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">{formData.appName || 'Selecione um app'}</span>
                <span className="text-blue-600 font-black">R$ {formData.monthlyValue.toFixed(2)}</span>
              </div>
            </div>

            {!initialData?.appName && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome do Aplicativo</label>
                <input
                  required
                  type="text"
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
              Finalizar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
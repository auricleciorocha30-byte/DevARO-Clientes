import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Client, ClientStatus } from '../types';

interface ClientModalProps {
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  initialData?: Client | null;
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
        name: initialData.name,
        email: initialData.email,
        whatsapp: initialData.whatsapp,
        address: initialData.address || '',
        appName: initialData.appName,
        monthlyValue: initialData.monthlyValue,
        dueDay: initialData.dueDay,
        status: initialData.status,
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
              {initialData ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>
            <p className="text-xs text-slate-500 sm:hidden">Preencha os campos abaixo</p>
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome Completo</label>
              <input
                required
                type="text"
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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Endereço Completo</label>
              <input
                required
                type="text"
                placeholder="Rua, Número, Bairro..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Valor (R$)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base"
                  value={formData.monthlyValue}
                  onChange={(e) => setFormData({...formData, monthlyValue: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Vencimento</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="31"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base"
                  value={formData.dueDay}
                  onChange={(e) => setFormData({...formData, dueDay: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status da Assinatura</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-base appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as ClientStatus})}
              >
                <option value={ClientStatus.ACTIVE}>Ativo (Em Dia)</option>
                <option value={ClientStatus.LATE}>Inadimplente</option>
                <option value={ClientStatus.PAUSED}>Pausado</option>
                <option value={ClientStatus.TESTING}>Em Teste (7 dias)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/30"
            >
              {initialData ? 'Atualizar Cliente' : 'Confirmar Cadastro'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-slate-500 font-semibold sm:hidden"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Client, ClientStatus } from '../types.ts';

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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <h3 className="text-xl font-bold text-slate-900">
            {initialData ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
              <input
                required
                type="email"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp</label>
              <input
                required
                type="tel"
                placeholder="5511..."
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço Completo</label>
            <input
              required
              type="text"
              placeholder="Rua, Número, Bairro, Cidade - UF"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Aplicativo</label>
            <input
              required
              type="text"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.appName}
              onChange={(e) => setFormData({...formData, appName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Valor Mensal (R$)</label>
              <input
                required
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.monthlyValue}
                onChange={(e) => setFormData({...formData, monthlyValue: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Dia de Vencimento</label>
              <input
                required
                type="number"
                min="1"
                max="31"
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.dueDay}
                onChange={(e) => setFormData({...formData, dueDay: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
            <select
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as ClientStatus})}
            >
              <option value={ClientStatus.ACTIVE}>Ativo (Em Dia)</option>
              <option value={ClientStatus.LATE}>Inadimplente</option>
              <option value={ClientStatus.PAUSED}>Pausado</option>
              <option value={ClientStatus.TESTING}>Em Teste (7 dias)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 mt-4"
          >
            {initialData ? 'Atualizar Dados' : 'Salvar Cliente'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;

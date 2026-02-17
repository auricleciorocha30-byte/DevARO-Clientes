
import React, { useState } from 'react';
import { UserPlus, CheckCircle, XCircle, Trash2, Edit3, Mail, MapPin, Copy, Check, Search, UserCheck } from 'lucide-react';
import { Seller } from '../types';

interface SellersManagerProps {
  sellers: Seller[];
  onUpdateSeller: (id: string, data: any) => Promise<void>;
  onDeleteSeller: (id: string) => Promise<void>;
  onAddSeller: (data: any) => Promise<void>;
}

const SellersManager: React.FC<SellersManagerProps> = ({ sellers, onUpdateSeller, onDeleteSeller, onAddSeller }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });

  const handleCopyLink = () => {
    const url = window.location.origin + window.location.pathname + '?view=seller_register';
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = sellers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddSeller({ ...formData, approved: true });
    setIsAdding(false);
    setFormData({ name: '', email: '', password: '', address: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar vendedor..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" 
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleCopyLink} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-4 rounded-2xl font-bold border transition-all ${copied ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {copied ? <Check size={20} /> : <Copy size={20} />} {copied ? 'Copiado' : 'Link de Cadastro'}
          </button>
          <button onClick={() => setIsAdding(true)} className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
            <UserPlus size={20} /> Novo Vendedor
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-xl animate-in zoom-in-95">
          <h3 className="text-lg font-black mb-4">Cadastrar Vendedor Manualmente</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Nome do Vendedor" className="px-4 py-3 bg-slate-50 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <input required type="email" placeholder="E-mail (Usuário)" className="px-4 py-3 bg-slate-50 border rounded-xl" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" placeholder="Senha" className="px-4 py-3 bg-slate-50 border rounded-xl" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <input placeholder="Endereço" className="px-4 py-3 bg-slate-50 border rounded-xl" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <div className="sm:col-span-2 flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">SALVAR</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 bg-slate-100 rounded-xl font-bold">CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(seller => (
          <div key={seller.id} className={`bg-white p-6 rounded-3xl border shadow-sm transition-all ${!seller.approved ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${seller.approved ? 'bg-blue-50 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{seller.name}</h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                    {seller.approved ? <span className="text-green-600">Aprovado</span> : <span className="text-amber-600">Aguardando Aprovação</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => onDeleteSeller(seller.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Mail size={14} /> {seller.email}
              </div>
              {seller.address && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <MapPin size={14} /> {seller.address}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!seller.approved ? (
                <button 
                  onClick={() => onUpdateSeller(seller.id, { ...seller, approved: true })}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-2xl font-bold text-xs shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                >
                  <UserCheck size={16} /> APROVAR AGORA
                </button>
              ) : (
                <button 
                  onClick={() => onUpdateSeller(seller.id, { ...seller, active: !seller.active })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 ${seller.active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}
                >
                  {seller.active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  {seller.active ? 'BLOQUEAR' : 'DESBLOQUEAR'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellersManager;

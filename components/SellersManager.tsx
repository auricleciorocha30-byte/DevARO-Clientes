
import React, { useState } from 'react';
import { UserPlus, CheckCircle, XCircle, Trash2, Edit3, Mail, MapPin, Copy, Check, Search, UserCheck, X, ShieldAlert, UserX, UserCheck2, ExternalLink } from 'lucide-react';
import { Seller } from '../types';

interface SellersManagerProps {
  sellers: Seller[];
  onUpdateSeller: (id: string, data: any) => Promise<void>;
  onDeleteSeller: (id: string) => Promise<void>;
  onAddSeller: (data: any) => Promise<void>;
  role?: 'ADMIN' | 'SELLER';
}

const SellersManager: React.FC<SellersManagerProps> = ({ sellers, onUpdateSeller, onDeleteSeller, onAddSeller, role }) => {
  const isAdmin = role === 'ADMIN';
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });

  const filtered = sellers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSeller) {
      await onUpdateSeller(editingSeller.id, { ...editingSeller, ...formData });
      setEditingSeller(null);
    } else {
      await onAddSeller({ ...formData, approved: true, active: true }); 
    }
    setIsAdding(false);
    setFormData({ name: '', email: '', password: '', address: '' });
  };

  const openPortal = () => {
    const url = window.location.origin + window.location.pathname + '?portal=seller';
    window.open(url, '_blank');
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar vendedor..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium" 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={openPortal} 
            className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100"
          >
            <ExternalLink size={20} /> Ver Portal Externo
          </button>
          <button 
            onClick={() => { setIsAdding(true); setEditingSeller(null); setFormData({ name: '', email: '', password: '', address: '' }); }} 
            className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            <UserPlus size={20} /> Cadastrar Vendedor
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[40px] border-2 border-blue-100 shadow-2xl animate-in zoom-in-95 sticky top-24 z-20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900">{editingSeller ? 'Editar Vendedor' : 'Cadastro Manual de Vendedor'}</h3>
            <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome Completo</label>
              <input required placeholder="Nome do vendedor" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">E-mail (Usuário)</label>
              <input required type="email" placeholder="email@vendedor.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{editingSeller ? 'Nova Senha (deixe em branco para manter)' : 'Senha de Acesso'}</label>
              <input required={!editingSeller} type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Endereço / Cidade</label>
              <input placeholder="Cidade - UF" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-4 border-t border-slate-100">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-[0.98] transition-all">
                {editingSeller ? 'ATUALIZAR DADOS' : 'FINALIZAR CADASTRO'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(seller => (
          <div key={seller.id} className={`bg-white p-7 rounded-[40px] border shadow-sm transition-all hover:shadow-lg ${!seller.approved ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'}`}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${seller.approved ? (seller.active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500') : 'bg-amber-100 text-amber-600'}`}>
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 leading-none mb-1">{seller.name}</h4>
                  <div className="flex items-center gap-2">
                    {!seller.approved ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase bg-amber-100 px-2 py-0.5 rounded-full"><ShieldAlert size={10} /> Pendente</span>
                    ) : (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${seller.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {seller.active ? 'Ativo' : 'Acesso Bloqueado'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingSeller(seller); setFormData({ name: seller.name, email: seller.email, password: '', address: seller.address }); setIsAdding(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Edit3 size={18} /></button>
                <button onClick={() => confirm('Excluir este vendedor permanentemente?') && onDeleteSeller(seller.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
              </div>
            </div>

            <div className="space-y-2 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                <Mail size={14} className="text-slate-400" /> {seller.email}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                <MapPin size={14} className="text-slate-400" /> {seller.address || 'Local não informado'}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {!seller.approved ? (
                <button 
                  onClick={() => onUpdateSeller(seller.id, { ...seller, approved: true, active: true })}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-green-600/20 active:scale-95 transition-all"
                >
                  <UserCheck2 size={16} /> ACEITAR E APROVAR
                </button>
              ) : (
                <button 
                  onClick={() => onUpdateSeller(seller.id, { ...seller, active: !seller.active })}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs transition-all active:scale-95 ${seller.active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-600 text-white shadow-lg shadow-green-600/20'}`}
                >
                  {seller.active ? <UserX size={16} /> : <UserCheck size={16} />}
                  {seller.active ? 'BLOQUEAR ACESSO' : 'REATIVAR VENDEDOR'}
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
             <UserCheck size={64} className="mx-auto text-slate-100 mb-4" />
             <p className="text-slate-400 font-bold">Nenhum registro encontrado.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default SellersManager;

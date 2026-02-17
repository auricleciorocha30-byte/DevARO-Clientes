
import React, { useState } from 'react';
import { UserPlus, CheckCircle, XCircle, Trash2, Edit3, Mail, MapPin, Search, X, ShieldAlert, UserX, UserCheck2, ExternalLink, Loader2, Key } from 'lucide-react';
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
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });

  const filtered = sellers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingActionId('submit');
    try {
      if (editingSeller) {
        await onUpdateSeller(editingSeller.id, { ...editingSeller, ...formData });
        setEditingSeller(null);
      } else {
        await onAddSeller({ ...formData, approved: true, active: true }); 
      }
      setIsAdding(false);
      setFormData({ name: '', email: '', password: '', address: '' });
    } finally {
      setLoadingActionId(null);
    }
  };

  const openPortal = () => {
    const url = window.location.origin + window.location.pathname + '?view=seller_register';
    window.open(url, '_blank');
  };

  const handleToggleActive = async (seller: Seller) => {
    setLoadingActionId(seller.id);
    try {
      await onUpdateSeller(seller.id, { ...seller, active: !seller.active });
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleApprove = async (seller: Seller) => {
    setLoadingActionId(seller.id);
    try {
      await onUpdateSeller(seller.id, { ...seller, approved: true, active: true });
    } finally {
      setLoadingActionId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header com botões solicitados */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col xl:flex-row gap-6 xl:items-center justify-between">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
          <input 
            type="text" 
            placeholder="Pesquisar vendedor por nome ou e-mail..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[28px] outline-none focus:ring-2 focus:ring-blue-600 font-bold text-lg transition-all" 
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={openPortal} 
            className="px-8 py-5 bg-slate-900 text-white rounded-[28px] font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
          >
            <ExternalLink size={24} /> Link do Portal
          </button>
          <button 
            onClick={() => { setIsAdding(true); setEditingSeller(null); setFormData({ name: '', email: '', password: '', address: '' }); }} 
            className="px-10 py-5 bg-blue-600 text-white rounded-[28px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/40 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <UserPlus size={24} /> Cadastrar Vendedor
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-10 rounded-[48px] border-4 border-blue-50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] animate-in zoom-in-95 sticky top-28 z-40">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                <UserPlus size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingSeller ? 'Alterar Dados do Vendedor' : 'Cadastro Manual de Vendedor'}</h3>
            </div>
            <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all active:scale-90"><X size={24} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input required placeholder="Ex: Marcos Vendas" className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (Usuário de Login)</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input required type="email" placeholder="vendedor@email.com" className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{editingSeller ? 'Mudar Senha (deixe em branco para não alterar)' : 'Senha de Acesso'}</label>
              <div className="relative">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input required={!editingSeller} type="password" placeholder="••••••••" className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço / Cidade / UF</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input placeholder="Cidade - Estado" className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
            </div>
            <div className="md:col-span-2 flex gap-4 pt-6 border-t border-slate-50">
              <button disabled={loadingActionId === 'submit'} type="submit" className="flex-1 bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                {loadingActionId === 'submit' ? <Loader2 className="animate-spin" size={24} /> : (editingSeller ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR CADASTRO')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(seller => (
          <div key={seller.id} className={`bg-white p-8 rounded-[40px] border shadow-sm transition-all hover:shadow-xl ${!seller.approved ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'}`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-2xl shadow-inner ${seller.approved ? (seller.active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500') : 'bg-amber-100 text-amber-600'}`}>
                  {seller.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight mb-1">{seller.name}</h4>
                  <div className="flex items-center gap-2">
                    {!seller.approved ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 uppercase bg-amber-100 px-3 py-1 rounded-full border border-amber-200"><ShieldAlert size={12} /> AGUARDANDO APROVAÇÃO</span>
                    ) : (
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${seller.active ? 'bg-green-100 text-green-600 border-green-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                        {seller.active ? 'Colaborador Ativo' : 'Acesso Bloqueado'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingSeller(seller); setFormData({ name: seller.name, email: seller.email, password: '', address: seller.address }); setIsAdding(true); }} 
                  className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-2xl border border-slate-100 active:scale-90"
                  title="Editar dados"
                >
                  <Edit3 size={20} />
                </button>
                <button 
                  onClick={() => confirm('Excluir este vendedor permanentemente? Todas as vendas vinculadas a ele ficarão órfãs.') && onDeleteSeller(seller.id)} 
                  className="p-3 bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-2xl border border-slate-100 active:scale-90"
                  title="Excluir cadastro"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-8 bg-slate-50/50 p-5 rounded-3xl border border-slate-100/50">
              <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                <Mail size={16} className="text-slate-400" /> {seller.email}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                <MapPin size={16} className="text-slate-400" /> {seller.address || 'Local não informado'}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {!seller.approved ? (
                <button 
                  disabled={loadingActionId === seller.id}
                  onClick={() => handleApprove(seller)}
                  className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-green-600/20 active:scale-95 transition-all hover:bg-green-700 disabled:bg-slate-300"
                >
                  {loadingActionId === seller.id ? <Loader2 className="animate-spin" size={20} /> : <UserCheck2 size={20} />}
                  ACEITAR E LIBERAR ACESSO
                </button>
              ) : (
                <button 
                  disabled={loadingActionId === seller.id}
                  onClick={() => handleToggleActive(seller)}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:bg-slate-300 ${seller.active ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100' : 'bg-green-600 text-white shadow-xl shadow-green-600/20 hover:bg-green-700'}`}
                >
                  {loadingActionId === seller.id ? <Loader2 className="animate-spin" size={20} /> : (seller.active ? <UserX size={20} /> : <UserCheck2 size={20} />)}
                  {seller.active ? 'BANIR / BLOQUEAR' : 'REATIVAR ACESSO'}
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="col-span-full py-28 text-center bg-white rounded-[48px] border-4 border-dashed border-slate-50">
             <UserPlus size={80} className="mx-auto text-slate-100 mb-6" />
             <p className="text-slate-400 font-black text-xl">Nenhum consultor encontrado.</p>
             <p className="text-slate-300 font-bold text-sm mt-1 uppercase tracking-widest">Clique em Cadastrar Vendedor para começar</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default SellersManager;

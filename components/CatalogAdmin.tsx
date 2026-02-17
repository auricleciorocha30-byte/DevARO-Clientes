
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, MapPin, Check, ShoppingBag, Link as LinkIcon, Copy, X, ExternalLink, Loader2 } from 'lucide-react';
import { Product, CatalogConfig, PaymentMethod, GlobalPaymentLinks } from '../types';

interface CatalogAdminProps {
  products: Product[];
  config: CatalogConfig;
  globalLinks: GlobalPaymentLinks;
  onSaveConfig: (config: CatalogConfig) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onPreview: () => void;
  role?: 'ADMIN' | 'SELLER';
}

const CatalogAdmin: React.FC<CatalogAdminProps> = ({ 
  products, 
  config, 
  globalLinks,
  onSaveConfig, 
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onPreview,
  role
}) => {
  const isAdmin = role === 'ADMIN';
  const [localConfig, setLocalConfig] = useState(config);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    photo: '',
    paymentMethods: [PaymentMethod.PIX],
    paymentLinkId: 'link1',
    externalLink: ''
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, photo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (product: Product) => {
    if (!isAdmin) return;
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price,
      photo: product.photo,
      paymentMethods: product.paymentMethods,
      paymentLinkId: product.paymentLinkId || 'link1',
      externalLink: product.externalLink || ''
    });
    setShowProductForm(true);
  };

  const resetForm = () => {
    setShowProductForm(false);
    setEditingProductId(null);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      photo: '',
      paymentMethods: [PaymentMethod.PIX],
      paymentLinkId: 'link1',
      externalLink: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      if (editingProductId) {
        await onUpdateProduct(editingProductId, newProduct);
      } else {
        await onAddProduct(newProduct);
      }
      resetForm();
    } catch (error: any) {
      console.error('Falha ao salvar:', error);
      alert('Erro ao salvar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = (product: Product) => {
    const link = globalLinks[product.paymentLinkId as keyof GlobalPaymentLinks] || 'Link não configurado';
    navigator.clipboard.writeText(link);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{isAdmin ? 'Configuração do Encarte' : 'Catálogo de Apps DevARO'}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin ? 'Gerencie os produtos e identidade da loja.' : 'Escolha um app abaixo para copiar o link de divulgação.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onPreview} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
              <ExternalLink size={18} /> Ver Encarte Online
            </button>
          </div>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome da Empresa</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={localConfig.companyName} onChange={e => setLocalConfig({...localConfig, companyName: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Endereço de Exibição</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={localConfig.address} onChange={e => setLocalConfig({...localConfig, address: e.target.value})} />
            </div>
            <button onClick={() => onSaveConfig(localConfig)} className="md:col-span-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl active:scale-95 transition-all">
              Salvar Dados do Encarte
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Apps Cadastrados</h2>
          {isAdmin && !showProductForm && <button onClick={() => setShowProductForm(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-xl active:scale-95 shadow-lg"><Plus size={18} /> Novo App</button>}
        </div>

        {isAdmin && showProductForm && (
          <div className="mb-8 bg-white p-8 rounded-[40px] shadow-2xl border-2 border-blue-100 animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black">{editingProductId ? 'Editar Dados do App' : 'Lançar Novo App'}</h3>
              <button onClick={resetForm} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                  <input required placeholder="Nome do Aplicativo" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <textarea required rows={3} placeholder="Breve descrição dos recursos" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">R$</span>
                    <input required type="number" step="0.01" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-black" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-3">Vincular Link de Checkout (Global)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['link1', 'link2', 'link3', 'link4'] as const).map((id, idx) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setNewProduct({...newProduct, paymentLinkId: id})}
                          className={`px-3 py-3 rounded-xl text-[11px] font-black border transition-all ${newProduct.paymentLinkId === id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'}`}
                        >
                          CANAL {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                      {newProduct.photo ? <img src={newProduct.photo} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={32} />}
                    </div>
                    <label className="cursor-pointer px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                      MUDAR FOTO
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                  </div>
               </div>
               <div className="md:col-span-2 flex gap-3 pt-6 border-t border-slate-50">
                  <button disabled={isSaving} type="submit" className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                    {isSaving ? <Loader2 className="animate-spin" size={24} /> : (editingProductId ? 'SALVAR ALTERAÇÕES' : 'LANÇAR APLICATIVO')}
                  </button>
               </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-slate-50 relative overflow-hidden">
                {product.photo ? (
                  <img src={product.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ShoppingBag size={64} />
                  </div>
                )}
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => handleEditClick(product)} className="p-2.5 bg-white/95 backdrop-blur rounded-2xl shadow-lg text-blue-600 hover:bg-white active:scale-90 transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => onDeleteProduct(product.id)} className="p-2.5 bg-white/95 backdrop-blur rounded-2xl shadow-lg text-red-600 hover:bg-white active:scale-90 transition-all"><Trash2 size={18} /></button>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-slate-900 text-lg line-clamp-1">{product.name}</h4>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Assinatura</span>
                    <span className="text-blue-600 font-black text-2xl">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={() => handleCopyLink(product)}
                    className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-lg active:scale-95 ${copiedId === product.id ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-blue-600'}`}
                  >
                    {copiedId === product.id ? <Check size={16} /> : <Copy size={16} />}
                    {copiedId === product.id ? 'COPIADO' : 'COPIAR LINK'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogAdmin;

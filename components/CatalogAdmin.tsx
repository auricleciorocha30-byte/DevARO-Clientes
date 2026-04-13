
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, Check, ShoppingBag, Copy, X, ExternalLink, Loader2, Tag, Filter, Video, CreditCard, Banknote, QrCode } from 'lucide-react';
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
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: '',
    description: '',
    price: 0,
    photo: '',
    videoUrls: [],
    pixQrCode: '',
    paymentMethods: [PaymentMethod.PIX],
    paymentLinkId: 'link1',
    externalLink: ''
  });

  const categories = Array.from(new Set(products.map(p => p.category || 'Geral')));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, photo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('O vídeo deve ter no máximo 50MB para upload direto. Para vídeos maiores, use um link externo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, videoUrls: [...(newProduct.videoUrls || []), reader.result as string] });
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = (index: number) => {
    const updated = [...(newProduct.videoUrls || [])];
    updated.splice(index, 1);
    setNewProduct({ ...newProduct, videoUrls: updated });
  };

  const handlePixUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProduct({ ...newProduct, pixQrCode: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    setNewProduct(prev => {
      const methods = prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method];
      return { ...prev, paymentMethods: methods };
    });
  };

  const handleEditClick = (product: Product) => {
    if (!isAdmin) return;
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      category: product.category || '',
      description: product.description,
      price: product.price,
      photo: product.photo,
      videoUrls: product.videoUrls || (product.videoUrl ? [product.videoUrl] : []),
      pixQrCode: product.pixQrCode || '',
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
      category: '',
      description: '',
      price: 0,
      photo: '',
      videoUrls: [],
      pixQrCode: '',
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

  const handleCopyShowcaseLink = (product: Product) => {
    const url = window.location.origin + window.location.pathname + '?view=showcase&product=' + product.id;
    navigator.clipboard.writeText(url);
    setCopiedId('showcase-' + product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredProducts = categoryFilter === 'Todas' 
    ? products 
    : products.filter(p => (p.category || 'Geral') === categoryFilter);

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{isAdmin ? 'Configuração do Encarte' : 'Catálogo de Apps DevARO'}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin ? 'Gerencie os produtos, categorias e identidade da loja.' : 'Escolha um app abaixo para copiar o link de divulgação.'}
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
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={localConfig.companyName} onChange={e => setLocalConfig({...localConfig, companyName: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Endereço de Exibição</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={localConfig.address} onChange={e => setLocalConfig({...localConfig, address: e.target.value})} />
            </div>
            <button onClick={() => onSaveConfig(localConfig)} className="md:col-span-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl active:scale-95 transition-all">
              Salvar Dados do Encarte
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Apps Cadastrados</h2>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full">
               <Filter size={14} className="text-slate-400" />
               <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase text-slate-600 outline-none"
               >
                 <option value="Todas">Filtrar Categoria</option>
                 {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>
            </div>
          </div>
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome do Aplicativo</label>
                    <input required placeholder="Ex: Gestor de Delivery" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1"><Tag size={10} /> Categoria</label>
                    <input required placeholder="Ex: Gestão, Vendas, Delivery..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Descrição Curta</label>
                    <textarea required rows={3} placeholder="Breve descrição dos recursos" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-medium" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  </div>

                  <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase block">Formas de Pagamento</label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.values(PaymentMethod).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => togglePaymentMethod(method)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${newProduct.paymentMethods.includes(method) ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'}`}
                        >
                          {method === PaymentMethod.PIX && <QrCode size={14} />}
                          {method === PaymentMethod.CARD && <CreditCard size={14} />}
                          {method === PaymentMethod.CASH && <Banknote size={14} />}
                          {method === PaymentMethod.LINK && <ExternalLink size={14} />}
                          {method === PaymentMethod.DELIVERY && <ShoppingBag size={14} />}
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Valor da Assinatura</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black">R$</span>
                      <input required type="number" step="0.01" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-black" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                        {newProduct.photo ? <img src={newProduct.photo} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={24} />}
                      </div>
                      <label className="flex-1 cursor-pointer px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm text-center">
                        UPLOAD FOTO
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      </label>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                        {newProduct.pixQrCode ? <img src={newProduct.pixQrCode} className="w-full h-full object-cover" /> : <QrCode className="text-slate-300" size={24} />}
                      </div>
                      <label className="flex-1 cursor-pointer px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm text-center">
                        UPLOAD QR PIX
                        <input type="file" className="hidden" accept="image/*" onChange={handlePixUpload} />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                          {newProduct.videoUrls?.length ? <Video className="text-blue-600" size={24} /> : <Video className="text-slate-300" size={24} />}
                        </div>
                        <label className="flex-1 cursor-pointer px-4 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm text-center">
                          UPLOAD VÍDEO (MAX 50MB)
                          <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} />
                        </label>
                      </div>

                      {newProduct.videoUrls && newProduct.videoUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newProduct.videoUrls.map((v, idx) => (
                            <div key={idx} className="relative w-16 h-16 bg-black rounded-lg overflow-hidden group">
                              {v.startsWith('data:') ? (
                                <video src={v} className="w-full h-full object-cover opacity-50" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white text-[8px] break-all p-1 text-center">Link Externo</div>
                              )}
                              <button type="button" onClick={() => removeVideo(idx)} className="absolute inset-0 flex items-center justify-center bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Ou cole link do vídeo (YouTube/Vimeo/MP4)" 
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 text-[10px] font-bold" 
                          id="videoLinkInput"
                        />
                        <button 
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('videoLinkInput') as HTMLInputElement;
                            if (input.value) {
                              setNewProduct({ ...newProduct, videoUrls: [...(newProduct.videoUrls || []), input.value] });
                              input.value = '';
                            }
                          }}
                          className="px-4 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px]"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
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
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-300 flex flex-col">
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
                    <button 
                      onClick={() => { if(confirm('Remover este app definitivamente?')) onDeleteProduct(product.id) }} 
                      className="p-2.5 bg-white/95 backdrop-blur rounded-2xl shadow-lg text-red-600 hover:bg-white active:scale-90 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
                <div className="absolute bottom-4 left-4">
                   <span className="px-3 py-1 bg-slate-900/80 backdrop-blur text-white text-[9px] font-black uppercase rounded-lg tracking-widest border border-white/10">
                     {product.category || 'Geral'}
                   </span>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-slate-900 text-lg line-clamp-1">{product.name}</h4>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-6 font-medium leading-relaxed">{product.description}</p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Assinatura</span>
                    <span className="text-blue-600 font-black text-2xl">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleCopyShowcaseLink(product)}
                      className={`w-full px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${copiedId === 'showcase-' + product.id ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-blue-600'}`}
                    >
                      {copiedId === 'showcase-' + product.id ? <Check size={16} /> : <Copy size={16} />}
                      {copiedId === 'showcase-' + product.id ? 'COPIADO' : 'LINK DO ENCARTE'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
             <Filter size={64} className="mx-auto text-slate-100 mb-4" />
             <p className="text-slate-400 font-bold">Nenhum app encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogAdmin;

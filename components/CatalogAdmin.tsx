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
}

const CatalogAdmin: React.FC<CatalogAdminProps> = ({ 
  products, 
  config, 
  globalLinks,
  onSaveConfig, 
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onPreview
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setIsSaving(true);
    try {
      if (editingProductId) {
        await onUpdateProduct(editingProductId, newProduct);
      } else {
        await onAddProduct(newProduct);
      }
      resetForm();
    } catch (error) {
      alert('Erro ao salvar o produto no banco de dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Configurações do Encarte */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Configuração do Encarte</h2>
            <p className="text-xs text-slate-500 mt-1">Personalize como os clientes verão seus produtos.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
             <button onClick={() => {
                const url = window.location.origin + window.location.pathname + '?view=showcase';
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
             }} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
            <button onClick={onPreview} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold border border-blue-100 active:scale-95">
              <ExternalLink size={16} /> Ver Online
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nome da Empresa</label>
            <input type="text" placeholder="Ex: DevARO Apps" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={localConfig.companyName} onChange={e => setLocalConfig({...localConfig, companyName: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Endereço de Exibição</label>
            <input type="text" placeholder="Cidade - Estado" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={localConfig.address} onChange={e => setLocalConfig({...localConfig, address: e.target.value})} />
          </div>
        </div>
        <button onClick={() => onSaveConfig(localConfig)} className="mt-6 w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-600/20">
          Salvar Identidade
        </button>
      </div>

      {/* Meus Produtos */}
      <div>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-bold text-slate-900">Meus Produtos</h2>
          {!showProductForm && <button onClick={() => setShowProductForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl active:scale-95 shadow-md"><Plus size={18} /> Novo</button>}
        </div>

        {showProductForm && (
          <div className="mb-8 bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingProductId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={resetForm} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input required placeholder="Nome do App/Produto" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <textarea required rows={3} placeholder="Descrição curta para o encarte" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input required type="number" step="0.01" placeholder="0,00" className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">Vincular Link de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['link1', 'link2', 'link3', 'link4'] as const).map((id, idx) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setNewProduct({...newProduct, paymentLinkId: id})}
                          className={`px-3 py-2.5 rounded-lg text-xs font-bold border transition-all ${newProduct.paymentLinkId === id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200'}`}
                        >
                          Plano {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-2">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {newProduct.photo ? <img src={newProduct.photo} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={24} />}
                    </div>
                    <div>
                      <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors inline-block">
                        Selecionar Imagem
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-50">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-slate-400"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'SALVAR PRODUTO'}
                </button>
                <button type="button" onClick={resetForm} className="px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm group hover:shadow-md transition-all">
              <div className="h-44 bg-slate-50 relative overflow-hidden">
                {product.photo ? (
                  <img src={product.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ShoppingBag size={48} />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => handleEditClick(product)} className="p-2 bg-white/95 backdrop-blur rounded-xl shadow-lg text-blue-600 hover:bg-white active:scale-90 transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => onDeleteProduct(product.id)} className="p-2 bg-white/95 backdrop-blur rounded-xl shadow-lg text-red-600 hover:bg-white active:scale-90 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 line-clamp-1">{product.name}</h4>
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">
                    Link {(product.paymentLinkId || 'link1').replace('link', '')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 min-h-[32px]">{product.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Mensalidade</span>
                    <span className="text-blue-600 font-black text-lg">R$ {product.price.toFixed(2)}</span>
                  </div>
                  <ShoppingBag className="text-slate-100" size={24} />
                </div>
              </div>
            </div>
          ))}
          
          {products.length === 0 && !showProductForm && (
            <button onClick={() => setShowProductForm(true)} className="aspect-[4/3] rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/30 transition-all group">
               <Plus className="group-hover:scale-110 transition-transform" size={32} />
               <span className="font-bold">Adicionar Primeiro Item</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogAdmin;
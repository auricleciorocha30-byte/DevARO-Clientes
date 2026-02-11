import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, MapPin, Check, ShoppingBag, Link as LinkIcon, Copy, X, ExternalLink } from 'lucide-react';
import { Product, CatalogConfig, PaymentMethod, GlobalPaymentLinks } from '../types';

interface CatalogAdminProps {
  products: Product[];
  config: CatalogConfig;
  globalLinks: GlobalPaymentLinks;
  onSaveConfig: (config: CatalogConfig) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
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
      paymentLinkId: product.paymentLinkId,
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

  return (
    <div className="space-y-8 pb-20">
      {/* Configurações do Encarte */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-slate-900">Identidade Visual do Encarte</h2>
          <div className="flex items-center gap-3">
             <button onClick={() => {
                const url = window.location.origin + window.location.pathname + '?view=showcase';
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
             }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
            <button onClick={onPreview} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold border border-blue-100"><ExternalLink size={16} /> Ver Online</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Nome da Empresa" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={localConfig.companyName} onChange={e => setLocalConfig({...localConfig, companyName: e.target.value})} />
          <input type="text" placeholder="Endereço" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={localConfig.address} onChange={e => setLocalConfig({...localConfig, address: e.target.value})} />
        </div>
        <button onClick={() => onSaveConfig(localConfig)} className="mt-4 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all">Salvar Identidade</button>
      </div>

      {/* Formulário de Produto */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Produtos e Planos</h2>
          {!showProductForm && <button onClick={() => setShowProductForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg"><Plus size={18} /> Novo Item</button>}
        </div>

        {showProductForm && (
          <div className="mb-8 bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingProductId ? 'Editar Plano' : 'Novo Plano'}</h3>
              <button onClick={resetForm} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              editingProductId ? onUpdateProduct(editingProductId, newProduct) : onAddProduct(newProduct);
              resetForm();
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input required placeholder="Nome do App/Produto" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <textarea required rows={3} placeholder="Descrição" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                  <input required type="number" step="0.01" placeholder="Valor Mensal" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="block text-xs font-black text-slate-400 uppercase mb-3">Escolha o Link de Pagamento</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['link1', 'link2', 'link3', 'link4'] as const).map((id, idx) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setNewProduct({...newProduct, paymentLinkId: id})}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${newProduct.paymentLinkId === id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
                        >
                          Link {idx + 1}
                        </button>
                      ))}
                    </div>
                    {newProduct.paymentLinkId && (
                      <p className="mt-2 text-[10px] text-slate-400 truncate">URL: {globalLinks[newProduct.paymentLinkId] || 'Não configurado'}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {newProduct.photo ? <img src={newProduct.photo} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={24} />}
                    </div>
                    <label className="cursor-pointer px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">Upload Foto<input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} /></label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Salvar Plano</button>
                <button type="button" onClick={resetForm} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm group relative">
              <div className="h-40 bg-slate-50 relative overflow-hidden">
                {product.photo && <img src={product.photo} className="w-full h-full object-cover" />}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => handleEditClick(product)} className="p-2 bg-white/90 rounded-lg shadow-sm text-blue-600 hover:bg-white"><Edit2 size={14} /></button>
                  <button onClick={() => onDeleteProduct(product.id)} className="p-2 bg-white/90 rounded-lg shadow-sm text-red-600 hover:bg-white"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 mb-1">{product.name}</h4>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-blue-600 font-black text-sm">R$ {product.price.toFixed(2)}</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">Link {product.paymentLinkId.replace('link', '')}</span>
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
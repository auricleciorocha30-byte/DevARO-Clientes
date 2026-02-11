
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Image as ImageIcon, MapPin, MessageSquare, ExternalLink, Smartphone, DollarSign, Check, ShoppingBag } from 'lucide-react';
import { Product, CatalogConfig, PaymentMethod } from '../types';

interface CatalogAdminProps {
  products: Product[];
  config: CatalogConfig;
  onSaveConfig: (config: CatalogConfig) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onPreview: () => void;
}

const CatalogAdmin: React.FC<CatalogAdminProps> = ({ 
  products, 
  config, 
  onSaveConfig, 
  onAddProduct, 
  onDeleteProduct,
  onPreview
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    photo: '',
    paymentMethods: [PaymentMethod.PIX],
    paymentLink: ''
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const current = [...newProduct.paymentMethods];
    if (current.includes(method)) {
      setNewProduct({ ...newProduct, paymentMethods: current.filter(m => m !== method) });
    } else {
      setNewProduct({ ...newProduct, paymentMethods: [...current, method] });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct(newProduct);
    setShowProductForm(false);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      photo: '',
      paymentMethods: [PaymentMethod.PIX],
      paymentLink: ''
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Configurações do Encarte */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Configurações do Encarte</h2>
          <button 
            onClick={onPreview}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline"
          >
            <ExternalLink size={16} /> Ver Encarte Público
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Endereço da Empresa</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={localConfig.address}
                onChange={e => setLocalConfig({...localConfig, address: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">WhatsApp de Suporte</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="tel"
                placeholder="5511..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={localConfig.whatsapp}
                onChange={e => setLocalConfig({...localConfig, whatsapp: e.target.value})}
              />
            </div>
          </div>
        </div>
        <button 
          onClick={() => onSaveConfig(localConfig)}
          className="mt-6 w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
        >
          Salvar Identidade
        </button>
      </div>

      {/* Seção de Produtos */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Meus Produtos e Apps <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{products.length}</span>
          </h2>
          <button 
            onClick={() => setShowProductForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus size={18} /> Adicionar
          </button>
        </div>

        {showProductForm && (
          <div className="mb-8 bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-4">Novo Produto</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Produto/App</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição Curta</label>
                    <textarea 
                      required
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      value={newProduct.description}
                      onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor Mensal (R$)</label>
                      <input 
                        required
                        type="number"
                        step="0.01"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Foto do Produto</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {newProduct.photo ? (
                          <img src={newProduct.photo} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="text-slate-300" size={32} />
                        )}
                      </div>
                      <label className="cursor-pointer px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">
                        Upload
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Formas de Pagamento</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(PaymentMethod).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => togglePaymentMethod(method)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                            newProduct.paymentMethods.includes(method)
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-slate-200 text-slate-500'
                          }`}
                        >
                          {newProduct.paymentMethods.includes(method) && <Check size={14} />}
                          {method === PaymentMethod.LINK ? 'Link de Pagamento' : method === PaymentMethod.PIX ? 'Pix' : 'No Ato'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {newProduct.paymentMethods.includes(PaymentMethod.LINK) && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">URL do Link de Pagamento</label>
                      <input 
                        type="text"
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        value={newProduct.paymentLink}
                        onChange={e => setNewProduct({...newProduct, paymentLink: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30">Cadastrar Produto</button>
                <button type="button" onClick={() => setShowProductForm(false)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm group">
              <div className="h-48 bg-slate-50 relative overflow-hidden">
                {product.photo ? (
                  <img src={product.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-slate-200" size={64} />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => onDeleteProduct(product.id)} className="p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 active:scale-95 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-black shadow-lg">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-slate-900 mb-1">{product.name}</h4>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{product.description}</p>
                <div className="flex flex-wrap gap-1">
                  {product.paymentMethods.map(m => (
                    <span key={m} className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && !showProductForm && (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
               <ShoppingBag className="mx-auto text-slate-200 mb-4" size={48} />
               <p className="text-slate-400 font-bold">Nenhum produto no seu encarte ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogAdmin;

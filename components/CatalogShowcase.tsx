import React from 'react';
import { ShoppingBag, MessageSquare, MapPin, CheckCircle2, ShoppingCart, ExternalLink } from 'lucide-react';
import { Product, CatalogConfig } from '../types';

interface CatalogShowcaseProps {
  products: Product[];
  config: CatalogConfig;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
}

const CatalogShowcase: React.FC<CatalogShowcaseProps> = ({ products, config, onBack, onSelectProduct }) => {
  const handleAction = (product: Product) => {
    if (product.externalLink && product.externalLink.trim() !== '') {
      // Abre o link externo em uma nova aba
      const url = product.externalLink.startsWith('http') 
        ? product.externalLink 
        : `https://${product.externalLink}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Comportamento padrão: abre o formulário de cadastro interno
      onSelectProduct(product);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-20">
      {/* Header do Encarte */}
      <header className="w-full bg-blue-600 text-white p-6 md:p-10 text-center relative rounded-b-[40px] shadow-xl shadow-blue-500/20 max-w-4xl">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-xl">
             <ShoppingBag size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">{config.companyName || 'DevARO Digital'}</h1>
            <p className="text-blue-100 text-sm opacity-80 mt-1">Nossas Soluções e Apps</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-bold text-blue-50">
           <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
             <MapPin size={14} /> {config.address || 'São Paulo - SP'}
           </div>
           <a 
             href={`https://wa.me/${config.whatsapp}`}
             target="_blank"
             className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-full shadow-lg active:scale-95 transition-all"
           >
             <MessageSquare size={14} /> Falar no WhatsApp
           </a>
        </div>
      </header>

      {/* Lista de Produtos */}
      <main className="w-full max-w-2xl px-4 mt-8 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-800">Principais Ofertas</h2>
          <span className="text-xs font-bold text-slate-400">{products.length} itens</span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-[32px] overflow-hidden shadow-md border border-slate-100 flex flex-col">
              <div className="h-64 relative bg-slate-100">
                {product.photo ? (
                  <img src={product.photo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <ShoppingBag size={80} />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                   <div className="bg-white/90 backdrop-blur-md text-blue-600 px-4 py-2 rounded-2xl font-black text-lg shadow-xl">
                     R$ {product.price.toFixed(2)}<span className="text-[10px] font-bold text-slate-400 ml-1">/mês</span>
                   </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                   <CheckCircle2 className="text-green-500" size={18} />
                   <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                </div>
                <p className="text-slate-500 leading-relaxed mb-6">{product.description}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Pagamento via</span>
                    <div className="flex gap-1 mt-1">
                      {product.paymentMethods.map(m => (
                        <span key={m} className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAction(product)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
                  >
                    {product.externalLink ? <ExternalLink size={18} /> : <ShoppingCart size={18} />}
                    {product.externalLink ? 'SAIBAR MAIS' : 'EU QUERO!'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-20 text-center">
            <ShoppingCart className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-400 font-bold">Nenhum produto disponível no momento.</p>
          </div>
        )}

        <div className="py-10 text-center space-y-2">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">DevARO CRM & Encartes</p>
           <p className="text-[10px] text-slate-300">© 2024 Todos os direitos reservados</p>
        </div>
      </main>
    </div>
  );
};

export default CatalogShowcase;
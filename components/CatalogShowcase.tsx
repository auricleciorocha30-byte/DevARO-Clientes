
import React from 'react';
import { ShoppingBag, MessageSquare, MapPin, CheckCircle2, ShoppingCart, ExternalLink, X } from 'lucide-react';
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
      const url = product.externalLink.startsWith('http') 
        ? product.externalLink 
        : `https://${product.externalLink}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      onSelectProduct(product);
    }
  };

  // Detecta se é o acesso público direto via URL
  const params = new URLSearchParams(window.location.search);
  const isPublicUrl = params.get('view') === 'showcase' && !window.opener && window.history.length <= 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-20 relative animate-in fade-in duration-500">
      {/* Botão de Fechar (X): Substituindo o "Voltar" */}
      {!isPublicUrl && (
        <button 
          onClick={onBack}
          title="Fechar Encarte"
          className="fixed top-6 right-6 z-[70] p-4 bg-white/90 backdrop-blur-md shadow-2xl rounded-full text-slate-900 hover:bg-white active:scale-90 transition-all border border-slate-200 flex items-center justify-center"
        >
          <X size={24} strokeWidth={3} />
        </button>
      )}

      {/* Header do Encarte */}
      <header className="w-full bg-blue-600 text-white p-6 md:p-12 text-center relative rounded-b-[48px] shadow-2xl shadow-blue-500/20 max-w-4xl">
        <div className="flex flex-col items-center gap-5">
          <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center text-blue-600 shadow-2xl transform hover:rotate-6 transition-transform">
             <ShoppingBag size={48} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{config.companyName || 'DevARO Digital'}</h1>
            <p className="text-blue-100 text-sm font-medium opacity-90 mt-1 uppercase tracking-widest">Nossas Soluções e Apps</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-black text-blue-50">
           <div className="flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
             <MapPin size={16} /> {config.address || 'Atendimento em Todo Brasil'}
           </div>
           <a 
             href={`https://wa.me/${config.whatsapp}`}
             target="_blank"
             rel="noopener noreferrer"
             className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full shadow-xl active:scale-95 transition-all hover:bg-green-600 border border-green-400"
           >
             <MessageSquare size={16} /> Falar no WhatsApp
           </a>
        </div>
      </header>

      {/* Lista de Produtos */}
      <main className="w-full max-w-2xl px-4 mt-12 space-y-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-black text-slate-900">Catálogo de Apps</h2>
          <div className="flex items-center gap-2 bg-slate-200/50 px-3 py-1 rounded-lg">
            <span className="text-[10px] font-black text-slate-500 uppercase">{products.length} {products.length === 1 ? 'Produto' : 'Produtos'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-[40px] overflow-hidden shadow-xl border border-slate-100 flex flex-col hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="h-72 relative bg-slate-50 group">
                {product.photo ? (
                  <img src={product.photo} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-100">
                    <ShoppingBag size={100} />
                  </div>
                )}
                <div className="absolute bottom-6 right-6">
                   <div className="bg-white/95 backdrop-blur-md text-blue-600 px-6 py-3 rounded-2xl font-black text-2xl shadow-2xl border border-blue-50 flex items-baseline gap-1">
                     <span className="text-xs font-bold text-slate-400 mr-1">R$</span>{product.price.toFixed(2)}<span className="text-xs font-bold text-slate-400 ml-1">/mês</span>
                   </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-3">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <h3 className="text-2xl font-black text-slate-900 leading-none">{product.name}</h3>
                </div>
                <p className="text-slate-500 font-medium leading-relaxed mb-8 text-lg">{product.description}</p>
                
                <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pague com</span>
                    <div className="flex gap-1.5 mt-1">
                      {product.paymentMethods.length > 0 ? product.paymentMethods.map(m => (
                        <span key={m} className="text-[10px] font-black uppercase bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                          {m}
                        </span>
                      )) : (
                        <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-400 px-3 py-1 rounded-full border border-slate-200">
                          PIX / Cartão
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAction(product)}
                    className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-black rounded-[20px] shadow-2xl shadow-blue-500/40 active:scale-95 transition-all hover:bg-blue-700 hover:shadow-blue-500/60"
                  >
                    {product.externalLink ? <ExternalLink size={20} /> : <ShoppingCart size={20} />}
                    <span className="tracking-tight">{product.externalLink ? 'SAIBA MAIS' : 'SOLICITAR AGORA'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <ShoppingCart className="mx-auto text-slate-100 mb-6" size={80} />
            <p className="text-slate-400 font-black text-xl">Catálogo em atualização...</p>
            <p className="text-slate-300 text-sm mt-2">Volte em instantes para ver nossas ofertas.</p>
          </div>
        )}

        <div className="py-12 text-center space-y-3">
           <div className="w-12 h-1 bg-slate-200 mx-auto rounded-full mb-6"></div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">DevARO Cloud Solutions</p>
           <p className="text-[10px] text-slate-300 font-bold">Desenvolvido com Neon PostgreSQL</p>
        </div>
      </main>
    </div>
  );
};

export default CatalogShowcase;

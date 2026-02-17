
import React, { useState, useEffect } from 'react';
import { MapPin, Search, RefreshCcw, User, Clock, Navigation, ExternalLink, Globe } from 'lucide-react';
import { Seller } from '../types';
import { NeonService } from '../db';

interface SellersLocationProps {
  sellers: Seller[];
}

const SellersLocation: React.FC<SellersLocationProps> = ({ sellers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [localSellers, setLocalSellers] = useState<Seller[]>(sellers);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshLocations = async () => {
    setIsRefreshing(true);
    try {
      const dbSellers = await NeonService.getSellers();
      setLocalSellers(dbSellers as Seller[]);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshLocations, 30000); // Polling cada 30s
    return () => clearInterval(interval);
  }, []);

  const filtered = localSellers.filter(s => 
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    s.approved && s.active
  );

  const selectedSeller = selectedSellerId ? localSellers.find(s => s.id === selectedSellerId) : null;

  const getTimeDifference = (dateStr?: string) => {
    if (!dateStr) return 'Nunca visto';
    const lastSeen = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours} horas`;
    return lastSeen.toLocaleDateString();
  };

  const getGoogleMapsLink = (sellers: Seller[]) => {
    const coords = sellers.filter(s => s.lat && s.lng);
    if (coords.length === 0) return null;
    
    if (coords.length === 1) {
        return `https://www.google.com/maps?q=${coords[0].lat},${coords[0].lng}`;
    }
    
    // Para múltiplos, usamos o marcador do primeiro ou apenas abrimos o maps
    return `https://www.google.com/maps/search/?api=1&query=${coords[0].lat},${coords[0].lng}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Painel Lateral de Controle */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">Equipe em Campo</h3>
              <button 
                onClick={refreshLocations}
                className={`p-2 rounded-xl transition-all ${isRefreshing ? 'bg-blue-100 text-blue-600 animate-spin' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <RefreshCcw size={18} />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Filtrar vendedor..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-sm"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <button 
                onClick={() => setSelectedSellerId(null)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all border text-left ${selectedSellerId === null ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
              >
                <Globe size={18} />
                <span className="font-black text-xs uppercase tracking-tight">Ver Todos no Mapa</span>
              </button>
              
              {filtered.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setSelectedSellerId(s.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border text-left ${selectedSellerId === s.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedSellerId === s.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-sm truncate max-w-[120px]">{s.name}</p>
                      <p className={`text-[9px] font-bold uppercase ${selectedSellerId === s.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {s.lat ? 'Localizado' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  {s.lat && <div className={`w-2 h-2 rounded-full animate-pulse ${selectedSellerId === s.id ? 'bg-white' : 'bg-green-500'}`} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visualização do Mapa */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden h-[600px] relative">
            {/* Overlay de Informação do Mapa */}
            <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md p-5 rounded-[28px] border border-slate-100 shadow-2xl min-w-[280px]">
              {selectedSeller ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <User size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 leading-tight">{selectedSeller.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase">
                        <Clock size={12} /> {getTimeDifference(selectedSeller.last_seen)}
                      </div>
                    </div>
                  </div>
                  {selectedSeller.lat ? (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                       <p className="text-[10px] text-slate-500 font-medium">Coordenadas: {selectedSeller.lat.toFixed(6)}, {selectedSeller.lng?.toFixed(6)}</p>
                       <a 
                        href={getGoogleMapsLink([selectedSeller]) || '#'} 
                        target="_blank" 
                        className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                       >
                         <Navigation size={14} /> Abrir no Google Maps
                       </a>
                    </div>
                  ) : (
                    <p className="text-xs text-red-500 font-bold py-2 bg-red-50 rounded-xl px-4 text-center">Aguardando sinal de GPS...</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-900">Monitoramento da Frota</h4>
                  <p className="text-xs text-slate-500 font-medium">Visualizando todos os {filtered.filter(s => s.lat).length} consultores ativos agora.</p>
                  <a 
                    href={getGoogleMapsLink(filtered) || '#'} 
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all"
                  >
                    <ExternalLink size={14} /> Link do Rastreio Coletivo
                  </a>
                </div>
              )}
            </div>

            {/* Iframe do Mapa (Utilizando a API de Embed do Google) */}
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              {selectedSeller && selectedSeller.lat ? (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=SUA_CHAVE_GOOGLE_MAPS_AQUI&q=${selectedSeller.lat},${selectedSeller.lng}&zoom=15`}
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-center p-10 space-y-6">
                   <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <MapPin size={48} className="text-blue-300 animate-bounce" />
                   </div>
                   <div>
                     <p className="text-slate-900 font-black text-xl">Mapa de Atividade em Tempo Real</p>
                     <p className="text-slate-400 text-sm font-medium mt-2 max-w-sm mx-auto">Selecione um consultor à esquerda para focar na localização exata ou veja o histórico global da equipe.</p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      {filtered.filter(s => s.lat).map(s => (
                        <div key={s.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-black text-xs">
                             {s.name.charAt(0)}
                           </div>
                           <div className="text-left">
                             <p className="text-[10px] font-black text-slate-900 uppercase truncate w-24">{s.name}</p>
                             <p className="text-[9px] text-slate-400 font-bold italic">{getTimeDifference(s.last_seen)}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-indigo-900 text-white p-6 rounded-[32px] shadow-2xl shadow-indigo-500/30 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                   <Navigation size={24} className="text-indigo-200" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-[0.2em] opacity-60">Status de Rede DevARO</h4>
                  <p className="font-bold text-lg leading-tight">Sistema de rastreamento via Neon DB ativo e sincronizado.</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellersLocation;

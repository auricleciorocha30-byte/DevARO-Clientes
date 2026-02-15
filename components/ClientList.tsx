
import React, { useState } from 'react';
import { Search, Plus, MessageCircle, Trash2, Users, ChevronDown, Edit2, Loader2, MessageSquare } from 'lucide-react';
import { Client, ClientStatus } from '../types';
import { generatePersonalizedMessage } from '../services/geminiService';

interface ClientListProps {
  clients: Client[];
  onAdd: () => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ClientStatus) => Promise<void>;
  paymentLink: string;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onAdd, onEdit, onDelete, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.appName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReminder = async (client: Client) => {
    setIsGenerating(client.id);
    const type = client.status === ClientStatus.LATE ? 'overdue' : 'reminder';
    const msgLink = client.paymentLink || 'https://pay.devaro.com';
    let message = await generatePersonalizedMessage(client, type, msgLink);
    
    const url = `https://wa.me/${client.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsGenerating(null);
  };

  const handleStatusChange = async (clientId: string, status: ClientStatus) => {
    setActiveMenu(null);
    setUpdatingStatusId(clientId);
    try {
      await onUpdateStatus(clientId, status);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const statusConfig = {
    [ClientStatus.ACTIVE]: { label: 'Ativo', class: 'bg-green-100 text-green-700 border-green-200' },
    [ClientStatus.LATE]: { label: 'Em Atraso', class: 'bg-red-100 text-red-700 border-red-200' },
    [ClientStatus.PAUSED]: { label: 'Pausado', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    [ClientStatus.TESTING]: { label: 'Em Teste', class: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por cliente ou app..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" 
          />
        </div>
        <button 
          onClick={onAdd} 
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{client.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{client.appName} • R$ {client.monthlyValue.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Seletor de Status Melhorado */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === client.id ? null : client.id)}
                  disabled={updatingStatusId === client.id}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-2 transition-all active:scale-95 ${statusConfig[client.status].class}`}
                >
                  {updatingStatusId === client.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <>
                      {statusConfig[client.status].label}
                      <ChevronDown size={12} className={`transition-transform duration-300 ${activeMenu === client.id ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {activeMenu === client.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setActiveMenu(null)}
                    />
                    <div className="absolute left-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {Object.entries(ClientStatus).map(([key, value]) => (
                        <button 
                          key={key} 
                          onClick={() => handleStatusChange(client.id, value as ClientStatus)} 
                          className={`w-full text-left px-4 py-3 text-[11px] font-bold transition-colors border-b border-slate-50 last:border-0 hover:bg-slate-50 ${client.status === value ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                        >
                          {statusConfig[value as ClientStatus].label}
                          {client.status === value && <span className="float-right text-blue-600">●</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onEdit(client)} 
                  className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                
                <button 
                  disabled={isGenerating === client.id} 
                  onClick={() => handleSendReminder(client)} 
                  className={`p-2.5 rounded-xl text-white transition-all shadow-md active:scale-90 ${client.status === ClientStatus.LATE ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  title="Enviar Cobrança WhatsApp"
                >
                  {isGenerating === client.id ? <Loader2 size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                </button>

                <button 
                  onClick={() => onDelete(client.id)} 
                  className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredClients.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;

import React, { useState } from 'react';
import { Search, Plus, MessageCircle, Trash2, Users, ChevronDown, Edit2, DollarSign, Smartphone, AlertCircle } from 'lucide-react';
import { Client, ClientStatus } from '../types';
import { generatePersonalizedMessage } from '../services/geminiService';

interface ClientListProps {
  clients: Client[];
  onAdd: () => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ClientStatus) => void;
  paymentLink: string;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onAdd, onEdit, onDelete, onUpdateStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.appName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReminder = async (client: Client) => {
    setIsGenerating(client.id);
    const type = client.status === ClientStatus.LATE ? 'overdue' : 'reminder';
    // Usa o link de pagamento que foi salvo no registro do cliente
    const msgLink = client.paymentLink || 'https://pay.devaro.com';
    let message = await generatePersonalizedMessage(client, type, msgLink);
    
    const url = `https://wa.me/${client.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsGenerating(null);
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
          <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" />
        </div>
        <button onClick={onAdd} className="px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg font-bold flex items-center justify-center gap-2"><Plus size={20} /> Novo Cliente</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl">{client.name.charAt(0)}</div>
              <div>
                <h4 className="font-bold text-slate-900">{client.name}</h4>
                <p className="text-xs text-slate-500">{client.appName} • R$ {client.monthlyValue.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border flex items-center gap-2 cursor-pointer ${statusConfig[client.status].class}`}>
                  {statusConfig[client.status].label} <ChevronDown size={12} />
                </div>
                <div className="absolute left-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl hidden group-hover:block z-30 overflow-hidden">
                  {Object.entries(ClientStatus).map(([key, value]) => (
                    <button key={key} onClick={() => onUpdateStatus(client.id, value as ClientStatus)} className="w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors text-slate-600">{statusConfig[value as ClientStatus].label}</button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(client)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100"><Edit2 size={18} /></button>
                <button disabled={isGenerating === client.id} onClick={() => handleSendReminder(client)} className={`p-2.5 rounded-xl text-white ${client.status === ClientStatus.LATE ? 'bg-red-600' : 'bg-green-600'} hover:opacity-90 transition-all shadow-md`}><MessageCircle size={18} /></button>
                <button onClick={() => onDelete(client.id)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientList;
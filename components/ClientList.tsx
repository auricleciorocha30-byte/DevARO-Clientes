import React, { useState } from 'react';
import { Search, Plus, Mail, MessageCircle, Trash2, Users, ChevronDown, MapPin, Edit2, DollarSign, Smartphone } from 'lucide-react';
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

const ClientList: React.FC<ClientListProps> = ({ 
  clients, 
  onAdd, 
  onEdit, 
  onDelete, 
  onUpdateStatus,
  paymentLink 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReminder = async (client: Client, channel: 'email' | 'whatsapp') => {
    setIsGenerating(client.id);
    const type = client.status === ClientStatus.LATE ? 'overdue' : 'reminder';
    let message = await generatePersonalizedMessage(client, type, paymentLink);
    
    // Verificação de segurança: Se a IA esqueceu o link, nós adicionamos manualmente
    if (!message.includes(paymentLink)) {
      message += `\n\nLink para pagamento: ${paymentLink}`;
    }

    if (channel === 'whatsapp') {
      const url = `https://wa.me/${client.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      const url = `mailto:${client.email}?subject=DevARO - Pagamento&body=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
    setIsGenerating(null);
  };

  const handleOpenRoute = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const statusConfig = {
    [ClientStatus.ACTIVE]: { label: 'Ativo', class: 'bg-green-100 text-green-700 border-green-200' },
    [ClientStatus.LATE]: { label: 'Inadimplente', class: 'bg-red-100 text-red-700 border-red-200' },
    [ClientStatus.PAUSED]: { label: 'Pausado', class: 'bg-amber-100 text-amber-700 border-amber-200' },
    [ClientStatus.TESTING]: { label: 'Em Teste', class: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  };

  const StatusSelector = ({ client }: { client: Client }) => (
    <div className="relative group inline-block">
      <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 cursor-pointer transition-all hover:brightness-95 ${statusConfig[client.status]?.class || 'bg-slate-100'}`}>
        {statusConfig[client.status]?.label || 'Desconhecido'}
        <ChevronDown size={14} />
      </div>
      <div className="absolute left-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-2xl hidden group-hover:block z-30 overflow-hidden">
        {Object.entries(ClientStatus).map(([key, value]) => (
          <button
            key={key}
            onClick={() => onUpdateStatus(client.id, value)}
            className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-slate-50 transition-colors ${client.status === value ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
          >
            {statusConfig[value].label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome, app ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm text-base"
          />
        </div>
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 font-bold active:scale-[0.98]"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg">
                  {client.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{client.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{client.email}</p>
                </div>
              </div>
              <StatusSelector client={client} />
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-slate-400" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Aplicativo</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{client.appName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-slate-400" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Valor</p>
                  <p className="text-xs font-bold text-slate-700">R$ {client.monthlyValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button 
                onClick={() => handleOpenRoute(client.address)}
                className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg"
              >
                <MapPin size={14} /> VER ROTA
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(client)}
                  className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  disabled={isGenerating === client.id}
                  onClick={() => handleSendReminder(client, 'whatsapp')}
                  className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 disabled:opacity-50"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">App / Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Vencimento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 truncate">{client.name}</p>
                        <button 
                          onClick={() => handleOpenRoute(client.address)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-black uppercase"
                        >
                          <MapPin size={10} /> Rota
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-700">{client.appName}</p>
                  <p className="text-xs text-slate-500">R$ {client.monthlyValue.toFixed(2)}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-900 underline decoration-blue-200 decoration-2 underline-offset-4">
                    Dia {client.dueDay}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusSelector client={client} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onEdit(client)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Edit2 size={16} /></button>
                    <button disabled={isGenerating === client.id} onClick={() => handleSendReminder(client, 'whatsapp')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><MessageCircle size={16} /></button>
                    <button onClick={() => onDelete(client.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredClients.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <Users className="mx-auto mb-4 text-slate-200" size={64} />
          <p className="text-slate-500 font-medium text-lg">Nenhum cliente encontrado.</p>
        </div>
      )}
    </div>
  );
};

export default ClientList;
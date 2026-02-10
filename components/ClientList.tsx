
import React, { useState } from 'react';
import { Search, Plus, Mail, MessageCircle, Trash2, Users, ChevronDown, MapPin, Edit2 } from 'lucide-react';
import { Client, ClientStatus } from '../types.ts';
import { generatePersonalizedMessage } from '../services/geminiService.ts';

interface ClientListProps {
  clients: Client[];
  onAdd: () => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ClientStatus) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onAdd, onEdit, onDelete, onUpdateStatus }) => {
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
    const message = await generatePersonalizedMessage(client, type);
    
    if (channel === 'whatsapp') {
      const url = `https://wa.me/${client.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      const url = `mailto:${client.email}?subject=DevARO - Pagamento de Mensalidade&body=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
    setIsGenerating(null);
  };

  const handleOpenRoute = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const StatusSelector = ({ client }: { client: Client }) => {
    const statusConfig = {
      [ClientStatus.ACTIVE]: { label: 'Ativo', class: 'bg-green-100 text-green-700 border-green-200' },
      [ClientStatus.LATE]: { label: 'Inadimplente', class: 'bg-red-100 text-red-700 border-red-200' },
      [ClientStatus.PAUSED]: { label: 'Pausado', class: 'bg-amber-100 text-amber-700 border-amber-200' },
      [ClientStatus.TESTING]: { label: 'Em Teste', class: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    };

    return (
      <div className="relative group inline-block">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-2 cursor-pointer transition-all hover:brightness-95 ${statusConfig[client.status]?.class || 'bg-slate-100'}`}>
          {statusConfig[client.status]?.label || 'Desconhecido'}
          <ChevronDown size={12} />
        </div>
        <div className="absolute left-0 mt-1 w-36 bg-white border border-slate-100 rounded-xl shadow-xl hidden group-hover:block z-20 overflow-hidden">
          {Object.entries(ClientStatus).map(([key, value]) => (
            <button
              key={key}
              onClick={() => onUpdateStatus(client.id, value)}
              className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${client.status === value ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
            >
              {statusConfig[value].label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, app ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium"
        >
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">App / Valor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vencimento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 mt-1">
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">{client.name}</p>
                        <button 
                          onClick={() => handleOpenRoute(client.address)}
                          className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase transition-colors"
                          title="Ver Rota no Maps"
                        >
                          <MapPin size={10} />
                          Ver Rota
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{client.email}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-1 max-w-[200px]" title={client.address}>{client.address}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-slate-700">{client.appName}</p>
                  <p className="text-xs text-slate-500">R$ {client.monthlyValue.toFixed(2)}/mês</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-900 underline decoration-blue-200 decoration-2 underline-offset-4">
                    Todo dia {client.dueDay}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusSelector client={client} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(client)}
                      title="Editar Cliente"
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      disabled={isGenerating === client.id}
                      onClick={() => handleSendReminder(client, 'whatsapp')}
                      title="Enviar WhatsApp"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button
                      disabled={isGenerating === client.id}
                      onClick={() => handleSendReminder(client, 'email')}
                      title="Enviar E-mail"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(client.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Users className="mx-auto mb-4 opacity-20" size={48} />
            <p>Nenhum cliente encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;


import React from 'react';
import { ResponsiveContainer, Cell, PieChart, Pie, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, DollarSign, Clock, AlertCircle, PauseCircle, Timer, MapPin, Award, TrendingUp } from 'lucide-react';
import { Client, ClientStatus, Seller } from '../types';

interface DashboardProps {
  clients: Client[];
  sellers?: Seller[];
  userRole?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, sellers = [], userRole }) => {
  const isAdmin = userRole === 'ADMIN';
  const activeClients = clients.filter(c => c.status === ClientStatus.ACTIVE).length;
  const lateClients = clients.filter(c => c.status === ClientStatus.LATE).length;
  const pausedClients = clients.filter(c => c.status === ClientStatus.PAUSED).length;
  const testingClients = clients.filter(c => c.status === ClientStatus.TESTING).length;
  const totalRevenue = clients.reduce((acc, c) => acc + (c.status === ClientStatus.ACTIVE ? c.monthlyValue : 0), 0);

  // Lógica de Performance por Vendedor (Apenas para Admin)
  const sellerPerformance = sellers.map(seller => {
    const sellerClients = clients.filter(c => c.seller_id === seller.id);
    const revenue = sellerClients
      .filter(c => c.status === ClientStatus.ACTIVE)
      .reduce((acc, c) => acc + c.monthlyValue, 0);
    
    return {
      name: seller.name,
      clients: sellerClients.length,
      revenue: revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const stats = [
    { label: 'Total Clientes', value: clients.length, icon: Users, color: 'bg-blue-500' },
    { label: 'Receita Mensal', value: `R$ ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Inadimplentes', value: lateClients, icon: AlertCircle, color: 'bg-red-500' },
    { label: 'Em Teste', value: testingClients, icon: Timer, color: 'bg-indigo-500' },
  ];

  const chartData = [
    { name: 'Em Dia', value: activeClients, color: '#22c55e' },
    { name: 'Inadimplente', value: lateClients, color: '#ef4444' },
    { name: 'Pausado', value: pausedClients, color: '#f59e0b' },
    { name: 'Em Teste', value: testingClients, color: '#6366f1' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" /> Saúde da Carteira
          </h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 justify-center mt-2 px-4">
             {chartData.map((entry, idx) => (
               <div key={idx} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }}></div>
                 <span className="text-xs text-slate-600 truncate">{entry.name} ({entry.value})</span>
               </div>
             ))}
          </div>
        </div>

        {/* PERFORMANCE POR VENDEDOR - APENAS ADMIN */}
        {isAdmin && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-y-auto max-h-[400px]">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 sticky top-0 bg-white z-10 py-1">
              <Award size={20} className="text-blue-600" /> Performance da Equipe
            </h3>
            <div className="space-y-4">
              {sellerPerformance.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                      {idx + 1}º
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{item.clients} Clientes Ativos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-black">R$ {item.revenue.toLocaleString()}</p>
                    <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                       <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{ width: `${Math.min(100, (item.revenue / (totalRevenue || 1)) * 100)}%` }}
                       />
                    </div>
                  </div>
                </div>
              ))}
              {sellerPerformance.length === 0 && (
                <p className="text-center text-slate-400 py-10 font-bold">Nenhum vendedor cadastrado.</p>
              )}
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-y-auto h-[400px]">
            <h3 className="text-lg font-semibold mb-6">Próximos Vencimentos</h3>
            <div className="space-y-4">
              {clients
                .filter(c => c.status !== ClientStatus.PAUSED)
                .sort((a, b) => a.dueDay - b.dueDay)
                .slice(0, 5)
                .map(client => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{client.name}</p>
                        <p className="text-xs text-slate-500">{client.appName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${client.status === ClientStatus.LATE ? 'text-red-500' : 'text-blue-600'}`}>
                        Dia {client.dueDay}
                      </p>
                      <p className="text-xs text-slate-400">R$ {client.monthlyValue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

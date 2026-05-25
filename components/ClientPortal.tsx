
import React, { useState } from 'react';
import { Client, AppMessage, PaymentFrequency } from '../types';
import { NeonService } from '../db';
import { 
  CreditCard, 
  Calendar, 
  Bell, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  Wallet,
  Smartphone,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface ClientPortalProps {
  client: Client;
  messages: AppMessage[];
  onRefresh: () => Promise<void>;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ client, messages, onRefresh }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [pixData, setPixData] = useState<{ encodedImage: string, payload: string } | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  const calculateDaysRemaining = () => {
    if (!client.paid_until) return 0;
    const end = new Date(client.paid_until);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining();
  const isExpired = daysRemaining <= 0;

  const handleCreatePayment = async (months: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setPixData(null);
    setInvoiceUrl(null);
    
    try {
      const response = await fetch('/api/asaas/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          amount: client.monthlyValue * months,
          months: months,
          description: `Renovação ${months} mês(es) - ${client.appName}`
        })
      });

      const data = await response.json();
      
      if (data.pix) {
        setPixData(data.pix);
      }
      if (data.invoiceUrl) {
        setInvoiceUrl(data.invoiceUrl);
      }

    } catch (err) {
      console.error(err);
      alert('Erro ao gerar pagamento com Asaas. Verifique a configuração da API.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Header / Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">
                Painel do Lojista
              </span>
              {isExpired ? (
                <span className="px-4 py-1 bg-red-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <AlertCircle size={12} /> Assinatura Expirada
                </span>
              ) : (
                <span className="px-4 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} /> Assinatura Ativa
                </span>
              )}
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none">
              Olá, <span className="opacity-80 font-light">{client.name}</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium">Gestão do seu aplicativo: <span className="font-black underline">{client.appName}</span></p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[32px] min-w-[280px]">
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock size={14} /> Tempo Restante
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl font-black tracking-tighter ${isExpired ? 'text-red-300' : 'text-white'}`}>
                {Math.max(0, daysRemaining)}
              </span>
              <span className="text-xl font-bold opacity-60 italic">Dias</span>
            </div>
            {!isExpired && (
              <p className="text-[10px] font-bold text-blue-200 mt-4">
                Vence em: {client.paid_until ? new Date(client.paid_until).toLocaleDateString('pt-BR') : 'Imediato'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Alerts & Subscription */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Notifications / Messages */}
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Alertas e Avisos</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Comunicados da Central</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className="p-8 hover:bg-slate-50 transition-colors flex gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                      <TrendingUp size={20} className="text-blue-600" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{msg.sender_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(msg.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <Bell size={40} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhuma mensagem recente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Support */}
        <div className="space-y-8">
          {/* Action Card: Payment */}
          <div className={`rounded-[40px] p-8 shadow-2xl transition-all border-4 ${isExpired ? 'bg-white border-red-500' : 'bg-slate-900 border-transparent text-white'}`}>
            <h3 className={`text-2xl font-black mb-6 tracking-tight ${isExpired ? 'text-red-600' : 'text-white'}`}>
              {isExpired ? 'Regularizar Agora' : 'Renovar Plano'}
            </h3>
            
            <p className={`text-sm mb-8 font-medium leading-relaxed ${isExpired ? 'text-slate-600' : 'text-slate-400'}`}>
              Mantenha seu aplicativo ativo e receba todas as atualizações. Escolha o período de renovação abaixo.
            </p>

            {!showPaymentOptions ? (
              <button 
                onClick={() => setShowPaymentOptions(true)}
                className={`w-full py-6 rounded-[28px] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl ${isExpired ? 'bg-red-600 text-white shadow-red-500/30' : 'bg-blue-600 text-white shadow-blue-500/30'}`}
              >
                <Wallet size={24} /> PAGAR ASSINATURA
              </button>
            ) : pixData ? (
              <div className="space-y-6 animate-in zoom-in duration-300 text-center">
                <div className="bg-white p-4 rounded-3xl inline-block shadow-inner mx-auto mb-4 border border-slate-100">
                  <img src={`data:image/png;base64,${pixData.encodedImage}`} alt="PIX QR Code" className="w-48 h-48" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-blue-500 mb-2">Copia e Cola</p>
                   <div className="bg-white/10 p-4 rounded-2xl break-all text-[8px] font-mono text-white/60 mb-6 border border-white/5 relative group">
                      {pixData.payload}
                      <button 
                        onClick={() => { navigator.clipboard.writeText(pixData.payload); alert('Código copiado!'); }}
                        className="absolute right-2 top-2 p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <ExternalLink size={12} />
                      </button>
                   </div>
                </div>
                <div className="flex flex-col gap-3">
                  {invoiceUrl && (
                    <button 
                      onClick={() => window.open(invoiceUrl, '_blank')}
                      className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2"
                    >
                      Abrir Fatura <ExternalLink size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => { setShowPaymentOptions(false); setPixData(null); }}
                    className="w-full py-3 text-[10px] font-black uppercase text-slate-400"
                  >
                    Voltar
                  </button>
                </div>
                <div className="flex items-center gap-2 justify-center text-emerald-400 animate-pulse">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Aguardando Confirmação</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                <button 
                  disabled={isProcessing}
                  onClick={() => handleCreatePayment(1)}
                  className="w-full p-6 bg-white/5 border border-white/10 hover:bg-white/10 rounded-3xl flex items-center justify-between group transition-all"
                >
                  <div className="text-left">
                    <span className="block font-black text-lg">Pagar Mensal</span>
                    <span className="text-[10px] uppercase font-bold text-blue-400">R$ {client.monthlyValue.toFixed(2)}</span>
                  </div>
                  {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <ChevronRight className="group-hover:translate-x-1 transition-transform" />}
                </button>
                <button 
                  disabled={isProcessing}
                  onClick={() => handleCreatePayment(12)}
                  className="w-full p-6 bg-blue-600 hover:bg-blue-700 rounded-3xl flex items-center justify-between group transition-all shadow-xl shadow-blue-600/20"
                >
                  <div className="text-left">
                    <span className="block font-black text-lg">Pagar Anual</span>
                    <span className="text-[10px] uppercase font-bold text-white/70">Com Desconto (12 meses)</span>
                  </div>
                  {isProcessing ? <Loader2 size={24} className="animate-spin text-white" /> : <CheckCircle2 className="group-hover:scale-110 transition-transform" />}
                </button>
                <button 
                  onClick={() => setShowPaymentOptions(false)}
                  className="w-full py-3 text-[10px] font-black uppercase text-slate-500 hover:text-slate-400"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Integration Links / Support */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-[40px] p-8 space-y-6">
             <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
               <Smartphone size={24} />
             </div>
             <div>
               <h4 className="text-lg font-black text-indigo-900">Seu Aplicativo</h4>
               <p className="text-sm text-indigo-700 font-medium mt-1">Acesse o canal de vendas do seu portal digital.</p>
             </div>
             <button 
              onClick={() => window.open(client.paymentLink, '_blank')}
              className="w-full py-4 bg-white text-indigo-700 border border-indigo-200 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors shadow-sm"
            >
               <ExternalLink size={14} /> ACESSAR MEU APP
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;


import React, { useState, useEffect } from 'react';
import { NeonService } from '../db';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Code2, UserPlus, User, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
  isAdminMode?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, isAdminMode = false }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Define se estamos no portal de vendedor (abas) ou no login adm (simples)
  const isSellerPortal = !isAdminMode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegistering && isSellerPortal) {
        await NeonService.registerSeller({
          name, email, password, address, approved: false
        });
        setSuccess(true);
      } else {
        const user = await NeonService.login(email, password);
        if (user) {
          onLoginSuccess(user);
        } else {
          setError('E-mail ou senha incorretos.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl space-y-6 animate-in zoom-in border border-blue-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
             <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Solicitação Enviada!</h2>
          <div className="space-y-2">
            <p className="text-blue-600 font-black uppercase text-xl tracking-tight">
              Aguarde ser aprovado
            </p>
            <p className="text-slate-400 text-xs font-medium">
              Sua conta passará por uma análise administrativa.
            </p>
          </div>
          <button 
            onClick={() => { setIsRegistering(false); setSuccess(false); }} 
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all text-lg"
          >
            VOLTAR PARA LOGIN
          </button>
        </div>
      </div>
    );
  }

  // TELA LOGIN ADMINISTRATIVO (SIMPLES)
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_50%)]"></div>
        <div className="w-full max-w-sm z-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 mb-4">
              <Code2 size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">DevARO <span className="text-blue-500 not-italic font-light">ADM</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Sistema Gerencial de Assinaturas</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] shadow-2xl space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100 flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Administrativo</label>
              <input required type="email" placeholder="admin@devaro.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <input required type="password" placeholder="••••••••" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : 'ENTRAR NO PAINEL'}
            </button>

            <div className="flex justify-between items-center pt-2 px-1">
              <button type="button" className="text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors">Esqueceu a senha?</button>
              <button type="button" className="text-[10px] font-black text-blue-600 uppercase hover:underline">Cadastrar-se</button>
            </div>
          </form>
          
          <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-widest">Acesso restrito a administradores DevARO</p>
        </div>
      </div>
    );
  }

  // TELA PORTAL DO VENDEDOR (CARD COM ABAS)
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500 border border-slate-100">
        <div className="p-10 pt-12 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/30 transform hover:rotate-6 transition-transform">
            <Code2 size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            DevARO <span className="font-light not-italic tracking-normal opacity-80">CRM</span>
          </h1>
          <p className="text-blue-100 mt-3 font-bold uppercase text-[10px] tracking-[0.3em] opacity-80 uppercase">
            Painel de Consultoria
          </p>
        </div>

        {/* Abas solicitadas */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button 
            type="button"
            onClick={() => setIsRegistering(false)} 
            className={`flex-1 py-6 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${!isRegistering ? 'text-blue-600 border-b-4 border-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Já é nosso colaborador?
          </button>
          <button 
            type="button"
            onClick={() => setIsRegistering(true)} 
            className={`flex-1 py-6 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${isRegistering ? 'text-blue-600 border-b-4 border-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Cadastre-se
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold animate-shake">
              <AlertCircle size={20} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {isRegistering ? (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type="text" placeholder="Seu nome" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail para Cadastro</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type="email" placeholder="email@exemplo.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crie uma Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço / Localização</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type="text" placeholder="Cidade - UF" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
               <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type="email" placeholder="seu@email.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'ENVIAR CADASTRO' : 'ENTRAR NO PAINEL')}
          </button>
          
          <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">DevARO CRM Cloud Infrastructure</p>
        </form>
      </div>
    </div>
  );
};

export default Login;

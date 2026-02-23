
import React, { useState, useEffect } from 'react';
import { NeonService } from '../db';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, Code2, UserPlus, User, MapPin, CheckCircle2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
  isAdminMode?: boolean;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, isAdminMode = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await NeonService.login(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.08),transparent_70%)]"></div>
        <div className="w-full max-w-sm z-10 space-y-8 animate-in fade-in duration-700">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30 mb-4 transform -rotate-6">
              <Code2 size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">DevARO <span className="text-blue-500 not-italic font-light">ADM</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Admin Console</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] space-y-6">
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-bold border border-red-100 flex items-center gap-2 animate-shake"><AlertCircle size={16} /> {error}</div>}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário / E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="email" placeholder="admin@devaro.com" className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input required type="password" placeholder="••••••••" className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'ENTRAR NO PAINEL'}
            </button>
          </form>
          <p className="text-center text-[9px] text-slate-600 font-black uppercase tracking-widest opacity-40">Acesso Restrito Administradores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500 border border-slate-100">
        <div className="p-10 pt-12 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/30 transform hover:rotate-6 transition-transform">
            <Code2 size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
            DevARO <span className="font-light not-italic tracking-normal opacity-80">CRM</span>
          </h1>
          <p className="text-blue-100 mt-3 font-bold uppercase text-[10px] tracking-[0.3em] opacity-80 uppercase">
            Portal do Vendedor
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold animate-shake">
              <AlertCircle size={20} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
             <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Cadastrado</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input required type="email" placeholder="seu@email.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'ACESSAR PAINEL'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

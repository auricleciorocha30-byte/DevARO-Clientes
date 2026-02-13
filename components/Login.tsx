import React, { useState } from 'react';
import { NeonService } from '../db';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff, Code2 } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await NeonService.login(email, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('E-mail ou senha inválidos no Neon DB.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Erro de conexão com o banco de dados Neon.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="p-8 pt-12 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/30 transform hover:rotate-6 transition-transform">
            <Code2 size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">DevARO CRM</h1>
          <p className="text-blue-100 mt-2 font-medium opacity-80">Painel de Controle Neon SQL</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold animate-shake">
              <AlertCircle size={20} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Neon Auth</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                required
                type="email"
                placeholder="admin@devaro.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha PostgreSQL</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                ACESSAR BANCO DE DADOS
                <LogIn size={20} />
              </>
            )}
          </button>
          
          <p className="text-[10px] text-center text-slate-400 font-medium">Credenciais padrão: admin@devaro.com / admin123</p>
        </form>

        <div className="p-6 text-center border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DevARO Neon Infrastructure</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
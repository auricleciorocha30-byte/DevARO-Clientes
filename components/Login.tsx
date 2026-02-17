
import React, { useState } from 'react';
import { NeonService } from '../db';
import { Mail, Lock, LogIn, AlertCircle, Loader2, Eye, EyeOff, Code2, UserPlus, User, MapPin, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (userData: any) => void;
  isSellerRegistration?: boolean;
  onBack?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, isSellerRegistration = false, onBack }) => {
  const [isRegistering, setIsRegistering] = useState(isSellerRegistration);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegistering) {
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
             <UserPlus size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Solicitação Enviada!</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Seu cadastro como vendedor foi recebido com sucesso. Agora, aguarde a aprovação do administrador para acessar o painel de vendas.
          </p>
          <button onClick={() => setIsRegistering(false) || setSuccess(false)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">VOLTAR PARA LOGIN</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="p-8 pt-12 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/30 transform hover:rotate-6 transition-transform">
            <Code2 size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase">
            {isRegistering ? 'Seja DevARO' : 'DevARO CRM'}
          </h1>
          <p className="text-blue-100 mt-2 font-bold opacity-80 uppercase text-[10px] tracking-widest">
            {isRegistering ? 'Cadastre-se para começar a vender' : 'Gestão de Clientes e Faturamento'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold animate-shake">
              <AlertCircle size={20} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {isRegistering && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type="text" placeholder="Seu nome" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium" value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço Residencial</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input required type="text" placeholder="Cidade / Estado" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário (E-mail)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input required type="email" placeholder="seuemail@exemplo.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input required type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"><Eye size={20} /></button>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" size={24} /> : (isRegistering ? 'ENVIAR SOLICITAÇÃO' : 'ENTRAR NO PAINEL')}
          </button>
          
          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            <p className="text-slate-500 text-sm font-medium mb-1">
              {isRegistering ? 'Já é nosso colaborador?' : 'Ainda não é um colaborador?'}
            </p>
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-sm font-black text-blue-600 underline underline-offset-4 hover:text-blue-700 transition-all uppercase tracking-tight">
              {isRegistering ? 'Faça seu Login' : 'Cadastre-se Agora'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

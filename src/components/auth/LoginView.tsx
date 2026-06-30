import React, { useState } from 'react';
import { Lock, User, ArrowRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { CurrentUser } from '@/src/rbac';
import { api, setToken } from '@/src/lib/api';

interface LoginViewProps {
  onLogin: (user: CurrentUser) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { token, user } = await api.login(email, password);
      setToken(token);
      onLogin(user as CurrentUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-aegis-bg relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-aegis-accent/10 rounded-full blur-[120px] animate-pulse delay-700" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative group mb-8"
          >
            <div className="absolute inset-0 bg-blue-600 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <img
                src="/regenerated_image_1777458964528.png"
                alt="Aegis Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Aegis&background=0d6efd&color=fff';
                }}
              />
            </div>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-black text-white tracking-tighter"
          >
            AEGIS <span className="text-blue-500 font-normal">GRC</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold"
          >
            Secure Enterprise Gateway
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Identity</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-md"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">password</label>
              <button type="button" className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-wider transition-colors">Recover</button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="............"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 group relative overflow-hidden"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>

          <p className="text-center text-[10px] text-slate-500">
            Demo: <span className="font-mono text-slate-400">admin@company.com</span> / <span className="font-mono text-slate-400">aegis2026</span>
          </p>
        </form>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center opacity-30 select-none pointer-events-none">
        <p className="text-[10px] font-bold text-white uppercase tracking-[0.5em]">Aegis Enterprise GRC © 2026</p>
        <p className="text-[8px] font-mono text-slate-500 mt-1">SECURE ENCRYPTION ENABLED : AES-256</p>
      </div>
    </div>
  );
}

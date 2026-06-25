'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(username, password, rememberMe);
      toast.success('Login successful');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || t('auth.invalidCredentials'));
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-accent-gold flex items-center justify-center font-display font-black text-3xl text-background glow">X</div>
            <h1 className="font-display font-bold text-3xl gradient-text">HEAVEN X</h1>
            <p className="text-gray-400 mt-2">{t('auth.login')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.username')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" required autoComplete="username" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent" />
                <span className="text-sm text-gray-400">{t('auth.remember')}</span>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-gold text-background font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              {isLoading ? t('common.loading') : t('auth.login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

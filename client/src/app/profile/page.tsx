'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, Palette, Globe, Save } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import { useAuthStore } from '@/store/authStore';
import { useReaderStore } from '@/store/readerStore';
import { useLanguageStore } from '@/store/languageStore';
import api from '@/lib/api';
import { toast } from 'sonner';

const READ_MODES = [
  { value: 'NORMAL', label: 'reader.mode.normal' },
  { value: 'INVERT', label: 'reader.mode.invert' },
  { value: 'CLASSIC_INVERT', label: 'reader.mode.classicInvert' },
  { value: 'GRAYSCALE', label: 'reader.mode.grayscale' },
  { value: 'SEPIA', label: 'reader.mode.sepia' },
] as const;

function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const { readMode, setReadMode } = useReaderStore();
  const { language, setLanguage } = useLanguageStore();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    try {
      await api.post('/api/users/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) { toast.error(error.message); }
  }

  async function updateProfile(data: any) {
    try {
      await api.patch('/api/users/profile', data);
      updateUser(data);
      toast.success('Profile updated');
    } catch { toast.error('Failed to update profile'); }
  }

  if (!user) return null;

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">{t('nav.profile')}</h1>

        <div className="space-y-6">
          <div className="glass rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6"><User className="text-accent" size={24} /><h2 className="text-xl font-bold">Profile Information</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm text-gray-400 mb-2">Username</label><div className="px-4 py-3 rounded-xl bg-surface border border-border">{user.username}</div></div>
              <div><label className="block text-sm text-gray-400 mb-2">Role</label><div className="px-4 py-3 rounded-xl bg-surface border border-border">{user.role}</div></div>
            </div>
          </div>

          <div className="glass rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6"><Palette className="text-accent" size={24} /><h2 className="text-xl font-bold">Reader Settings</h2></div>
            <div>
              <label className="block text-sm text-gray-400 mb-3">Reading Mode</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {READ_MODES.map((mode) => (
                  <button key={mode.value} onClick={() => { setReadMode(mode.value); updateProfile({ readMode: mode.value }); }} className={`p-3 rounded-xl border transition-all ${readMode === mode.value ? 'bg-accent/20 border-accent text-accent' : 'bg-surface border-border hover:border-accent'}`}>
                    <span className="text-sm font-medium">{t(mode.label)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6"><Globe className="text-accent" size={24} /><h2 className="text-xl font-bold">Language</h2></div>
            <div className="grid grid-cols-3 gap-3">
              {[{ code: 'de' as const, label: 'Deutsch', flag: '🇩🇪' }, { code: 'en' as const, label: 'English', flag: '🇬🇧' }, { code: 'fa' as const, label: 'فارسی', flag: '🇮🇷' }].map((lang) => (
                <button key={lang.code} onClick={() => { setLanguage(lang.code); updateProfile({ language: lang.code.toUpperCase() }); }} className={`p-4 rounded-xl border transition-all ${language === lang.code ? 'bg-accent/20 border-accent' : 'bg-surface border-border hover:border-accent'}`}>
                  <span className="text-2xl">{lang.flag}</span>
                  <p className="text-sm font-medium mt-2">{lang.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6"><Lock className="text-accent" size={24} /><h2 className="text-xl font-bold">Change Password</h2></div>
            <form onSubmit={changePassword} className="space-y-4 max-w-md">
              <input type="password" placeholder="Current Password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" required />
              <input type="password" placeholder="New Password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" required />
              <input type="password" placeholder="Confirm New Password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" required />
              <button type="submit" className="px-6 py-3 rounded-xl bg-accent text-background font-medium flex items-center gap-2 hover:bg-accent-light"><Save size={18} />{t('common.save')}</button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

export default ProfilePage;

'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Heart, History, User, Shield, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';

export default function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('nav.home'), icon: Home },
    { href: '/series', label: t('nav.series'), icon: BookOpen },
    ...(isAuthenticated ? [
      { href: '/favorites', label: t('nav.favorites'), icon: Heart },
      { href: '/history', label: t('nav.history'), icon: History },
      { href: '/profile', label: t('nav.profile'), icon: User },
    ] : []),
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: t('nav.admin'), icon: Shield }] : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-gold flex items-center justify-center font-display font-bold text-background text-xl">X</div>
            <span className="font-display font-bold text-xl gradient-text hidden sm:block">HEAVEN X</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${isActive(item.href) ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white hover:bg-surface'}`}>
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {(['de', 'en', 'fa'] as const).map((lang) => (
                <button key={lang} onClick={() => useLanguageStore.getState().setLanguage(lang)} className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${language === lang ? 'bg-accent text-background' : 'text-gray-400 hover:text-white hover:bg-surface'}`}>
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {isAuthenticated ? (
              <button onClick={logout} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface">
                <LogOut size={18} />
                <span className="text-sm">{t('nav.logout')}</span>
              </button>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-background font-medium hover:bg-accent-light">
                <LogIn size={18} />
                <span className="text-sm">{t('nav.login')}</span>
              </Link>
            )}

            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-surface">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isActive(item.href) ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:text-white hover:bg-surface'}`}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
            {isAuthenticated ? (
              <button onClick={() => { logout(); setIsOpen(false); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-surface w-full">
                <LogOut size={20} />
                <span>{t('nav.logout')}</span>
              </button>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent text-background font-medium">
                <LogIn size={20} />
                <span>{t('nav.login')}</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/lib/i18n';

type Language = 'de' | 'en' | 'fa';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'de',
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        set({ language });
      },
    }),
    { name: 'heavenx-language' }
  )
);

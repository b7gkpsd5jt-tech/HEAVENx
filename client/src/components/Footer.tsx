'use client';

import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-gold flex items-center justify-center font-display font-bold text-background">X</div>
            <span className="font-display font-bold gradient-text">HEAVEN X</span>
          </div>
          <p className="text-gray-500 text-sm">{t('footer.copyright')} {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}

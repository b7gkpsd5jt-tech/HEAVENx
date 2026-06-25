'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History as HistoryIcon, BookOpen } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';

interface HistoryItem {
  id: string;
  readAt: string;
  page: number;
  series: { title: string; cover?: string };
  chapter: { number: number; title?: string };
}

function HistoryPage() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await api.get<HistoryItem[]>('/api/users/history');
        setHistory(data);
      } catch (error) { console.error('Failed to load history:', error); }
      finally { setLoading(false); }
    }
    loadHistory();
  }, []);

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8"><HistoryIcon className="text-accent" size={32} /><h1 className="text-3xl font-bold">{t('nav.history')}</h1></div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
        ) : history.length === 0 ? (
          <div className="text-center py-20"><BookOpen className="mx-auto mb-4 text-gray-600" size={48} /><p className="text-gray-400">No reading history</p></div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Link key={item.id} href={`/series/${item.series.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-accent transition-all">
                <div className="w-16 h-20 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"><BookOpen className="text-accent" size={24} /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{item.series.title}</h3>
                  <p className="text-sm text-gray-400">Chapter {item.chapter.number}{item.chapter.title && ` - ${item.chapter.title}`}</p>
                  <p className="text-xs text-gray-500 mt-1">Page {item.page} • {new Date(item.readAt).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

export default HistoryPage;

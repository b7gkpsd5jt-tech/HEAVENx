'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import SeriesCard from '@/components/SeriesCard';
import SkeletonCard from '@/components/SkeletonCard';

interface Series {
  id: string;
  title: string;
  cover?: string;
  status: string;
  views: number;
  likes: number;
  _count?: { chapters: number };
}

function FavoritesPage() {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await api.get<Series[]>('/api/users/favorites');
        setFavorites(data);
      } catch (error) { console.error('Failed to load favorites:', error); }
      finally { setLoading(false); }
    }
    loadFavorites();
  }, []);

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8"><Heart className="text-accent" size={32} /><h1 className="text-3xl font-bold">{t('nav.favorites')}</h1></div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20"><Heart className="mx-auto mb-4 text-gray-600" size={48} /><p className="text-gray-400">No favorites yet</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {favorites.map((series, i) => <SeriesCard key={series.id} series={series} index={i} />)}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

export default FavoritesPage;

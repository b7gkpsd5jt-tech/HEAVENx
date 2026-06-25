'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Heart, Eye, BookOpen, User as UserIcon, Palette } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface Chapter {
  id: string;
  number: number;
  title?: string;
  uploadDate: string;
  views: number;
  pageCount: number;
}

interface SeriesDetail {
  id: string;
  title: string;
  altTitle?: string;
  description?: string;
  cover?: string;
  banner?: string;
  author?: string;
  artist?: string;
  status: string;
  releaseDate?: string;
  popularity: number;
  likes: number;
  views: number;
  genres: { genre: { name: string } }[];
  tags: { tag: { name: string } }[];
  chapters: Chapter[];
  _count: { chapters: number; favorites: number };
}

export default function SeriesDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    async function loadSeries() {
      try {
        const data = await api.get<SeriesDetail>(`/api/series/${id}`);
        setSeries(data);
      } catch (error) {
        console.error('Failed to load series:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSeries();
  }, [id]);

  async function toggleFavorite() {
    if (!isAuthenticated) { toast.error(t('auth.loginRequired') || 'Please login'); return; }
    try {
      if (isFavorite) {
        await api.delete(`/api/users/favorites/${id}`);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await api.post(`/api/users/favorites/${id}`);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch { toast.error('Failed to update favorites'); }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8"><div className="h-64 skeleton rounded-2xl mb-8" /><div className="h-8 skeleton rounded-lg w-1/3 mb-4" /></div>;
  if (!series) return <div className="max-w-7xl mx-auto px-4 py-8 text-center"><h1 className="text-2xl font-bold">Series not found</h1></div>;

  const statusColors: Record<string, string> = {
    ONGOING: 'bg-green-500/20 text-green-400',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
    HIATUS: 'bg-yellow-500/20 text-yellow-400',
    DROPPED: 'bg-red-500/20 text-red-400',
  };

  return (
    <div>
      {series.banner && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img src={`http://localhost:4000${series.banner}`} alt={series.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <div className="w-48 md:w-64 aspect-[3/4] rounded-2xl overflow-hidden bg-surface glow">
              {series.cover ? (
                <img src={`http://localhost:4000${series.cover}`} alt={series.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><BookOpen size={48} className="text-gray-600" /></div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{series.title}</h1>
            {series.altTitle && <p className="text-gray-400 mb-4">{series.altTitle}</p>}

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusColors[series.status]}`}>{t(`series.status.${series.status.toLowerCase()}`)}</span>
              {series.genres.map((g) => (
                <span key={g.genre.name} className="px-3 py-1 rounded-lg bg-surface border border-border text-sm">{g.genre.name}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-400">
              {series.author && <span className="flex items-center gap-2"><UserIcon size={16} />{series.author}</span>}
              {series.artist && <span className="flex items-center gap-2"><Palette size={16} />{series.artist}</span>}
              <span className="flex items-center gap-2"><Eye size={16} />{series.views} views</span>
              <span className="flex items-center gap-2"><Heart size={16} />{series.likes} likes</span>
              <span className="flex items-center gap-2"><BookOpen size={16} />{series._count.chapters} chapters</span>
            </div>

            {series.description && <p className="text-gray-300 mb-6 leading-relaxed">{series.description}</p>}

            <button onClick={toggleFavorite} className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${isFavorite ? 'bg-accent text-background' : 'bg-surface border border-border hover:border-accent'}`}>
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? t('series.removeFromFavorites') : t('series.addToFavorites')}
            </button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">{t('series.chapters')} ({series._count.chapters})</h2>
          <div className="space-y-2">
            {series.chapters.map((chapter) => (
              <Link key={chapter.id} href={`/reader/${chapter.id}`} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border hover:border-accent transition-all group">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">{chapter.number}</span>
                  <div>
                    <h3 className="font-medium group-hover:text-accent transition-colors">{chapter.title || `Chapter ${chapter.number}`}</h3>
                    <p className="text-sm text-gray-500">{new Date(chapter.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Eye size={14} />{chapter.views}</span>
                  <span>{chapter.pageCount} pages</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

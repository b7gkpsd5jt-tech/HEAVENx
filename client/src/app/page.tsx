'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, TrendingUp, Clock } from 'lucide-react';
import api from '@/lib/api';
import SeriesCard from '@/components/SeriesCard';
import SkeletonCard from '@/components/SkeletonCard';
import Link from 'next/link';

interface Series {
  id: string;
  title: string;
  cover?: string;
  status: string;
  views: number;
  likes: number;
  _count?: { chapters: number };
}

export default function HomePage() {
  const { t } = useTranslation();
  const [trending, setTrending] = useState<Series[]>([]);
  const [latest, setLatest] = useState<Series[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [trendingRes, latestRes] = await Promise.all([
          api.get<{ data: Series[] }>('/api/series/trending/list'),
          api.get<{ data: Series[] }>('/api/series/latest/list'),
        ]);
        setTrending(trendingRes.data || []);
        setLatest(latestRes.data || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-accent)_0%,_transparent_70%)] opacity-20" />

        <div className="relative text-center px-4">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-accent to-accent-gold flex items-center justify-center font-display font-black text-5xl text-background glow">X</div>
          <h1 className="font-display font-black text-6xl md:text-8xl gradient-text mb-4">{t('home.hero.title')}</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">{t('app.tagline')}</p>

          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('home.search')} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface border border-border text-white placeholder-gray-500 focus:outline-none focus:border-accent" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="text-accent" size={24} />
          <h2 className="text-2xl font-bold">{t('home.trending')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {loading ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />) : trending.map((series, i) => <SeriesCard key={series.id} series={series} index={i} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="text-accent" size={24} />
          <h2 className="text-2xl font-bold">{t('home.latest')}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {loading ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />) : latest.map((series, i) => <SeriesCard key={series.id} series={series} index={i} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold mb-6">Genres</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller'].map((genre) => (
            <Link key={genre} href={`/series?genre=${genre}`} className="px-4 py-3 rounded-xl bg-surface border border-border text-center hover:border-accent hover:bg-accent/10 transition-all">
              <span className="text-sm font-medium">{genre}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

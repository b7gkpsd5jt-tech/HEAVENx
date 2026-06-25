'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
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

export default function SeriesPage() {
  const { t } = useTranslation();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function loadSeries() {
      setLoading(true);
      try {
        const response = await api.get<{ data: Series[]; pagination: { totalPages: number } }>(`/api/series?search=${search}&status=${status}&sort=${sort}&page=${page}&limit=20`);
        setSeries(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (error) {
        console.error('Failed to load series:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSeries();
  }, [search, status, sort, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('nav.series')}</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t('home.search')} className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" />
        </div>

        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent">
          <option value="">All Status</option>
          <option value="ONGOING">{t('series.status.ongoing')}</option>
          <option value="COMPLETED">{t('series.status.completed')}</option>
          <option value="HIATUS">{t('series.status.hiatus')}</option>
          <option value="DROPPED">{t('series.status.dropped')}</option>
        </select>

        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent">
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="views">Most Viewed</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {loading ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />) : series.map((s, i) => <SeriesCard key={s.id} series={s} index={i} />)}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl bg-surface border border-border disabled:opacity-50">Previous</button>
          <span className="px-4 py-2 text-gray-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-xl bg-surface border border-border disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}

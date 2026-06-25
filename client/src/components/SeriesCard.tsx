'use client';

import Link from 'next/link';
import { Eye, Heart, BookOpen } from 'lucide-react';

interface SeriesCardProps {
  series: {
    id: string;
    title: string;
    cover?: string;
    status: string;
    views: number;
    likes: number;
    _count?: { chapters: number };
  };
  index?: number;
}

export default function SeriesCard({ series, index = 0 }: SeriesCardProps) {
  const statusColors: Record<string, string> = {
    ONGOING: 'bg-green-500/20 text-green-400',
    COMPLETED: 'bg-blue-500/20 text-blue-400',
    HIATUS: 'bg-yellow-500/20 text-yellow-400',
    DROPPED: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="group" style={{ animationDelay: `${index * 0.05}s` }}>
      <Link href={`/series/${series.id}`}>
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface glow hover:shadow-[0_0_40px_rgba(255,140,0,0.6)] transition-all">
          {series.cover ? (
            <img src={`http://localhost:4000${series.cover}`} alt={series.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <BookOpen size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[series.status] || 'bg-gray-500/20 text-gray-400'}`}>{series.status}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span className="flex items-center gap-1"><Eye size={12} />{series.views}</span>
              <span className="flex items-center gap-1"><Heart size={12} />{series.likes}</span>
              {series._count && <span className="flex items-center gap-1"><BookOpen size={12} />{series._count.chapters}</span>}
            </div>
          </div>
        </div>
        <h3 className="mt-3 font-medium text-sm text-white group-hover:text-accent transition-colors line-clamp-2">{series.title}</h3>
      </Link>
    </div>
  );
}

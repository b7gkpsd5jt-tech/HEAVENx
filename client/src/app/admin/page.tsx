'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, BookOpen, FileText, Upload, Settings, TrendingUp, HardDrive } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import Link from 'next/link';

interface Stats {
  userCount: number;
  seriesCount: number;
  chapterCount: number;
  pageCount: number;
  storageUsage: { total: number; formatted: string };
  recentUploads: any[];
}

function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.get<Stats>('/api/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { label: t('admin.users'), value: stats?.userCount ?? 0, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: t('admin.series'), value: stats?.seriesCount ?? 0, icon: BookOpen, color: 'from-accent to-accent-gold' },
    { label: t('admin.chapters'), value: stats?.chapterCount ?? 0, icon: FileText, color: 'from-green-500 to-green-600' },
    { label: 'Pages', value: stats?.pageCount ?? 0, icon: FileText, color: 'from-purple-500 to-purple-600' },
    { label: 'Storage', value: stats?.storageUsage?.formatted ?? '0 B', icon: HardDrive, color: 'from-pink-500 to-pink-600' },
  ];

  const adminLinks = [
    { href: '/admin/users', label: t('admin.users'), icon: Users },
    { href: '/admin/series', label: t('admin.series'), icon: BookOpen },
    { href: '/admin/chapters', label: t('admin.chapters'), icon: FileText },
    { href: '/admin/uploads', label: t('admin.uploads'), icon: Upload },
    { href: '/admin/settings', label: t('admin.settings'), icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="text-accent" size={32} />
        <h1 className="text-3xl font-bold">{t('admin.dashboard')}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={stat.label} className="glass rounded-2xl p-6 border border-border" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={24} className="text-white" />
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminLinks.map((link, i) => (
          <Link key={link.href} href={link.href} className="flex items-center gap-4 p-6 rounded-2xl bg-surface border border-border hover:border-accent transition-all group" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <link.icon size={24} className="text-accent" />
            </div>
            <span className="font-medium text-lg">{link.label}</span>
          </Link>
        ))}
      </div>

      {stats?.recentUploads && stats.recentUploads.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Uploads</h2>
          <div className="space-y-2">
            {stats.recentUploads.map((upload: any) => (
              <div key={upload.id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
                <div>
                  <p className="font-medium">{upload.series.title}</p>
                  <p className="text-sm text-gray-400">Chapter {upload.number} - {new Date(upload.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm text-gray-500">{upload.pageCount} pages</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminDashboard />
    </AuthGuard>
  );
}

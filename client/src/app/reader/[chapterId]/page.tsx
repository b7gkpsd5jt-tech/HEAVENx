'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Settings, Maximize, Minimize, ZoomIn, ZoomOut, List, X } from 'lucide-react';
import api from '@/lib/api';
import { useReaderStore } from '@/store/readerStore';
import { useAuthStore } from '@/store/authStore';

interface Page {
  id: string;
  pageNumber: number;
  filePath: string;
  width?: number;
  height?: number;
}

interface Chapter {
  id: string;
  number: number;
  title?: string;
  series: { id: string; title: string; cover?: string };
  pages: Page[];
  prevChapter?: { id: string; number: number; title?: string };
  nextChapter?: { id: string; number: number; title?: string };
}

const READ_MODES = ['NORMAL', 'INVERT', 'CLASSIC_INVERT', 'GRAYSCALE', 'SEPIA'] as const;

export default function ReaderPage() {
  const { chapterId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { readMode, zoom, isFullscreen, setReadMode, setZoom, setIsFullscreen, setCurrentChapter, setCurrentPage } = useReaderStore();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadChapter() {
      setLoading(true);
      try {
        const data = await api.get<Chapter>(`/api/chapters/${chapterId}`);
        setChapter(data);
        setCurrentChapter(data.id);
      } catch (error) {
        console.error('Failed to load chapter:', error);
      } finally {
        setLoading(false);
      }
    }
    loadChapter();
  }, [chapterId, setCurrentChapter]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { if (isFullscreen) setIsFullscreen(false); else setShowToolbar(!showToolbar); }
      if (e.key === 'f' || e.key === 'F') setIsFullscreen(!isFullscreen);
      if (e.key === '+' || e.key === '=') setZoom(zoom + 0.1);
      if (e.key === '-') setZoom(zoom - 0.1);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, zoom, setIsFullscreen, setZoom, showToolbar]);

  const resetToolbarTimeout = useCallback(() => {
    setShowToolbar(true);
    setTimeout(() => { if (isFullscreen) setShowToolbar(false); }, 3000);
  }, [isFullscreen]);

  useEffect(() => {
    window.addEventListener('mousemove', resetToolbarTimeout);
    window.addEventListener('touchstart', resetToolbarTimeout);
    return () => {
      window.removeEventListener('mousemove', resetToolbarTimeout);
      window.removeEventListener('touchstart', resetToolbarTimeout);
    };
  }, [resetToolbarTimeout]);

  useEffect(() => {
    if (!chapter || !user) return;
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const progress = Math.round((scrollTop / scrollHeight) * chapter.pages.length);
      setCurrentPage(Math.max(1, progress));
      api.post('/api/users/progress', { seriesId: chapter.series.id, chapterId: chapter.id, page: progress }).catch(() => {});
    };
    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [chapter, user, setCurrentPage]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-accent-gold animate-pulse" /><p className="text-gray-400">{t('common.loading')}</p></div></div>;
  if (!chapter) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Chapter not found</p></div>;

  const modeClass = `reader-${readMode.toLowerCase().replace('_', '-')}`;

  return (
    <div ref={containerRef} className={`fixed inset-0 bg-background overflow-y-auto ${modeClass}`} style={{ paddingTop: isFullscreen ? 0 : '4rem' }}>
      {showToolbar && (
        <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-surface"><ChevronLeft size={20} /></button>
              <div>
                <h2 className="font-medium text-sm">{chapter.series.title}</h2>
                <p className="text-xs text-gray-400">{t('reader.chapter')} {chapter.number}{chapter.title && ` - ${chapter.title}`}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 rounded-xl hover:bg-surface"><ZoomOut size={18} /></button>
              <span className="text-sm text-gray-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-2 rounded-xl hover:bg-surface"><ZoomIn size={18} /></button>
              <button onClick={() => setShowChapterList(!showChapterList)} className="p-2 rounded-xl hover:bg-surface"><List size={18} /></button>
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-xl hover:bg-surface">{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}</button>
              <button onClick={() => { const idx = READ_MODES.indexOf(readMode); setReadMode(READ_MODES[(idx + 1) % READ_MODES.length]); }} className="p-2 rounded-xl hover:bg-surface"><Settings size={18} /></button>
            </div>
          </div>
        </div>
      )}

      {showChapterList && (
        <div className="fixed top-16 right-4 z-40 w-80 max-h-96 overflow-y-auto glass rounded-2xl border border-border">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <span className="font-medium">Chapters</span>
            <button onClick={() => setShowChapterList(false)}><X size={18} /></button>
          </div>
          <div className="p-2">
            <button onClick={() => { if (chapter.prevChapter) router.push(`/reader/${chapter.prevChapter.id}`); }} disabled={!chapter.prevChapter} className="w-full p-2 rounded-xl text-left hover:bg-surface disabled:opacity-50">← {t('reader.previous')}</button>
            <button onClick={() => { if (chapter.nextChapter) router.push(`/reader/${chapter.nextChapter.id}`); }} disabled={!chapter.nextChapter} className="w-full p-2 rounded-xl text-left hover:bg-surface disabled:opacity-50">{t('reader.next')} →</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
        {chapter.pages.map((page) => (
          <div key={page.id} className="relative w-full">
            <img src={`http://localhost:4000${page.filePath}`} alt={`Page ${page.pageNumber}`} className="w-full h-auto" />
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto p-4 flex items-center justify-between gap-4">
        <button onClick={() => chapter.prevChapter && router.push(`/reader/${chapter.prevChapter.id}`)} disabled={!chapter.prevChapter} className="flex-1 py-3 rounded-xl bg-surface border border-border disabled:opacity-50 hover:border-accent transition-colors">← {t('reader.previous')}</button>
        <button onClick={() => chapter.nextChapter && router.push(`/reader/${chapter.nextChapter.id}`)} disabled={!chapter.nextChapter} className="flex-1 py-3 rounded-xl bg-accent text-background font-medium disabled:opacity-50 hover:bg-accent-light transition-colors">{t('reader.next')} →</button>
      </div>

      <div className="h-20" />
    </div>
  );
}

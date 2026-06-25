import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReaderState {
  readMode: 'NORMAL' | 'INVERT' | 'CLASSIC_INVERT' | 'GRAYSCALE' | 'SEPIA';
  zoom: number;
  isFullscreen: boolean;
  currentChapter: string | null;
  currentPage: number;
  setReadMode: (mode: ReaderState['readMode']) => void;
  setZoom: (zoom: number) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setCurrentChapter: (chapterId: string | null) => void;
  setCurrentPage: (page: number) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      readMode: 'NORMAL',
      zoom: 1,
      isFullscreen: false,
      currentChapter: null,
      currentPage: 1,
      setReadMode: (readMode) => set({ readMode }),
      setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(3, zoom)) }),
      setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
      setCurrentChapter: (currentChapter) => set({ currentChapter, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
    }),
    { name: 'heavenx-reader' }
  )
);

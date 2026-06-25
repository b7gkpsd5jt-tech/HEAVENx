'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileArchive, CheckCircle, XCircle } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import api from '@/lib/api';
import { toast } from 'sonner';

function UploadManager() {
  const { t } = useTranslation();
  const [seriesId, setSeriesId] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !seriesId || !chapterNumber) { toast.error('Please fill all required fields'); return; }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('seriesId', seriesId);
    formData.append('chapterNumber', chapterNumber);
    if (chapterTitle) formData.append('chapterTitle', chapterTitle);

    try {
      const interval = setInterval(() => { setProgress((p) => Math.min(p + 10, 90)); }, 200);
      await api.upload('/api/upload/zip', formData);
      clearInterval(interval);
      setProgress(100);
      toast.success('Chapter uploaded successfully!');
      setFile(null);
      setChapterNumber('');
      setChapterTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) { toast.error(error.message || 'Upload failed'); }
    finally { setUploading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('admin.uploadChapter')}</h1>

      <div className="glass rounded-2xl border border-border p-8">
        <form onSubmit={handleUpload} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Series ID *</label>
            <input type="text" value={seriesId} onChange={(e) => setSeriesId(e.target.value)} placeholder="Enter series ID" className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chapter Number *</label>
              <input type="number" min="1" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} placeholder="1" className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chapter Title</label>
              <input type="text" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Optional title" className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-white focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">ZIP File *</label>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent transition-colors">
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileArchive className="text-accent" size={32} />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto mb-3 text-gray-500" size={32} />
                  <p className="text-gray-400">Click to select ZIP file</p>
                  <p className="text-sm text-gray-600 mt-1">Contains JPG, JPEG, PNG or WEBP images</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept=".zip" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="h-2 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent to-accent-gold transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-gray-400 text-center">{progress}%</p>
            </div>
          )}

          <button type="submit" disabled={uploading} className="w-full py-4 rounded-xl bg-gradient-to-r from-accent to-accent-gold text-background font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading ? (<><div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />Uploading...</>) : (<><Upload size={20} />{t('admin.uploadChapter')}</>)}
          </button>
        </form>
      </div>

      <div className="mt-8 glass rounded-2xl border border-border p-6">
        <h3 className="font-bold mb-4">📋 Instructions</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2"><CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" /><span>ZIP file should contain only image files (JPG, JPEG, PNG, WEBP)</span></li>
          <li className="flex items-start gap-2"><CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" /><span>Images will be automatically sorted by filename</span></li>
          <li className="flex items-start gap-2"><CheckCircle size={16} className="text-accent mt-0.5 flex-shrink-0" /><span>Structure: uploads/SeriesTitle/ChapterXXX/001.jpg, 002.jpg, ...</span></li>
          <li className="flex items-start gap-2"><XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" /><span>Maximum file size: 100MB</span></li>
        </ul>
      </div>
    </div>
  );
}

export default function AdminUploadsPage() {
  return (
    <AuthGuard requireAdmin>
      <UploadManager />
    </AuthGuard>
  );
}

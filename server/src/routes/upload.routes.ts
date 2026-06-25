import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { uploadMiddleware } from '../middleware/upload';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { prisma } from '../main';

const router = Router();
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

router.post('/zip', authenticate, requireAdmin, uploadMiddleware.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const { seriesId, chapterNumber, chapterTitle } = req.body;
    if (!seriesId || !chapterNumber) { fs.unlinkSync(req.file.path); res.status(400).json({ error: 'seriesId and chapterNumber required' }); return; }

    const chapterNum = parseInt(chapterNumber);
    if (isNaN(chapterNum) || chapterNum < 1) { fs.unlinkSync(req.file.path); res.status(400).json({ error: 'Invalid chapter number' }); return; }

    const series = await prisma.series.findUnique({ where: { id: seriesId } });
    if (!series) { fs.unlinkSync(req.file.path); res.status(404).json({ error: 'Series not found' }); return; }

    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();
    const imageEntries = zipEntries
      .filter((entry) => {
        const ext = path.extname(entry.entryName).toLowerCase();
        return !entry.isDirectory && ALLOWED_EXTENSIONS.includes(ext);
      })
      .sort((a, b) => a.entryName.localeCompare(b.entryName, undefined, { numeric: true }));

    if (imageEntries.length === 0) { fs.unlinkSync(req.file.path); res.status(400).json({ error: 'No valid images in ZIP' }); return; }

    const safeTitle = series.title.replace(/[^a-zA-Z0-9]/g, '_');
    const chapterDirName = `Chapter${String(chapterNum).padStart(3, '0')}`;
    const chapterDir = path.join(UPLOAD_DIR, safeTitle, chapterDirName);
    if (!fs.existsSync(chapterDir)) fs.mkdirSync(chapterDir, { recursive: true });

    const pageRecords = [];
    for (let i = 0; i < imageEntries.length; i++) {
      const entry = imageEntries[i];
      const ext = path.extname(entry.entryName).toLowerCase();
      const fileName = `${String(i + 1).padStart(3, '0')}${ext}`;
      const filePath = path.join(chapterDir, fileName);
      entry.getData().writeFileSync(filePath);
      pageRecords.push({ pageNumber: i + 1, filePath: `/uploads/${safeTitle}/${chapterDirName}/${fileName}`, fileName, order: i + 1 });
    }

    const chapter = await prisma.chapter.upsert({
      where: { seriesId_number: { seriesId, number: chapterNum } },
      create: { seriesId, number: chapterNum, title: chapterTitle || `Chapter ${chapterNum}`, sortOrder: chapterNum, pageCount: pageRecords.length, pages: { create: pageRecords } },
      update: { title: chapterTitle || `Chapter ${chapterNum}`, pageCount: pageRecords.length, pages: { deleteMany: {}, create: pageRecords } },
      include: { pages: true },
    });

    await prisma.series.update({ where: { id: seriesId }, data: { updatedAt: new Date() } });
    fs.unlinkSync(req.file.path);

    res.status(201).json({ message: 'Chapter uploaded', chapter, pageCount: pageRecords.length });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

export const uploadRoutes = router;

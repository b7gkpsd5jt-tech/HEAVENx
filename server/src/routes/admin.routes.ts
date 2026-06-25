import { Router, Response } from 'express';
import { prisma } from '../main';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const [userCount, seriesCount, chapterCount, pageCount, recentUploads] = await Promise.all([
      prisma.user.count(),
      prisma.series.count(),
      prisma.chapter.count(),
      prisma.chapterPage.count(),
      prisma.chapter.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { series: { select: { title: true } } } }),
    ]);
    res.json({ userCount, seriesCount, chapterCount, pageCount, recentUploads, storageUsage: { total: 0, formatted: '0 B' } });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/genres', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const genres = await prisma.genre.findMany({ include: { _count: { select: { series: true } } }, orderBy: { name: 'asc' } });
    res.json(genres);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/genres', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ error: 'Genre name required' }); return; }
    const genre = await prisma.genre.create({ data: { name } });
    res.status(201).json(genre);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/genres/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.genre.delete({ where: { id: req.params.id } });
    res.json({ message: 'Genre deleted' });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

export const adminRoutes = router;

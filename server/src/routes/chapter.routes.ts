import { Router, Response } from 'express';
import { prisma } from '../main';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/series/:seriesId', async (req, res: Response) => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { seriesId: req.params.seriesId },
      orderBy: { number: 'asc' },
      include: { pages: { orderBy: { order: 'asc' }, select: { id: true, pageNumber: true, filePath: true, width: true, height: true } } },
    });
    res.json(chapters);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: {
        series: { select: { id: true, title: true, cover: true } },
        pages: { orderBy: { order: 'asc' } },
      },
    });
    if (!chapter) { res.status(404).json({ error: 'Chapter not found' }); return; }
    await prisma.chapter.update({ where: { id: chapter.id }, data: { views: { increment: 1 } } });

    const [prevChapter, nextChapter] = await Promise.all([
      prisma.chapter.findFirst({ where: { seriesId: chapter.seriesId, number: { lt: chapter.number } }, orderBy: { number: 'desc' }, select: { id: true, number: true, title: true } }),
      prisma.chapter.findFirst({ where: { seriesId: chapter.seriesId, number: { gt: chapter.number } }, orderBy: { number: 'asc' }, select: { id: true, number: true, title: true } }),
    ]);

    res.json({ ...chapter, prevChapter, nextChapter });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { seriesId, number, title, sortOrder } = req.body;
    const chapter = await prisma.chapter.create({ data: { seriesId, number, title, sortOrder: sortOrder ?? number } });
    res.status(201).json(chapter);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.chapter.delete({ where: { id: req.params.id } });
    res.json({ message: 'Chapter deleted' });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

export const chapterRoutes = router;

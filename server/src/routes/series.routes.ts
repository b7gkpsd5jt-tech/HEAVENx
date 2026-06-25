import { Router, Response } from 'express';
import { prisma } from '../main';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res: Response) => {
  try {
    const { search, genre, status, sort = 'newest', page = '1', limit = '20' } = _req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) where.OR = [{ title: { contains: search as string, mode: 'insensitive' } }, { altTitle: { contains: search as string, mode: 'insensitive' } }];
    if (status) where.status = status;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') orderBy = { popularity: 'desc' };
    else if (sort === 'views') orderBy = { views: 'desc' };
    else if (sort === 'alphabetical') orderBy = { title: 'asc' };

    const [series, total] = await Promise.all([
      prisma.series.findMany({ where, orderBy, skip, take: limitNum, include: { genres: { include: { genre: true } }, tags: { include: { tag: true } }, _count: { select: { chapters: true } } } }),
      prisma.series.count({ where }),
    ]);

    res.json({ data: series, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res: Response) => {
  try {
    const series = await prisma.series.findUnique({
      where: { id: req.params.id },
      include: {
        genres: { include: { genre: true } },
        tags: { include: { tag: true } },
        chapters: { orderBy: { number: 'asc' }, select: { id: true, number: true, title: true, uploadDate: true, views: true, pageCount: true } },
        _count: { select: { chapters: true, favorites: true } },
      },
    });
    if (!series) { res.status(404).json({ error: 'Series not found' }); return; }
    await prisma.series.update({ where: { id: series.id }, data: { views: { increment: 1 } } });
    res.json(series);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/trending/list', async (_req, res: Response) => {
  try {
    const trending = await prisma.series.findMany({ orderBy: { popularity: 'desc' }, take: 10, include: { _count: { select: { chapters: true } } } });
    res.json(trending);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/latest/list', async (_req, res: Response) => {
  try {
    const latest = await prisma.series.findMany({ orderBy: { updatedAt: 'desc' }, take: 20, include: { chapters: { orderBy: { uploadDate: 'desc' }, take: 1 }, _count: { select: { chapters: true } } } });
    res.json(latest);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/genres/list', async (_req, res: Response) => {
  try {
    const genres = await prisma.genre.findMany({ include: { _count: { select: { series: true } } }, orderBy: { name: 'asc' } });
    res.json(genres);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, altTitle, description, cover, banner, author, artist, status, releaseDate, genres, tags } = req.body;
    const series = await prisma.series.create({
      data: { title, altTitle, description, cover, banner, author, artist, status, releaseDate: releaseDate ? new Date(releaseDate) : undefined },
      include: { genres: { include: { genre: true } }, tags: { include: { tag: true } } },
    });
    res.status(201).json(series);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const series = await prisma.series.update({
      where: { id: req.params.id },
      data: { ...data, releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined },
      include: { genres: { include: { genre: true } }, tags: { include: { tag: true } } },
    });
    res.json(series);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.series.delete({ where: { id: req.params.id } });
    res.json({ message: 'Series deleted' });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

export const seriesRoutes = router;

import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../main';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, username: true, email: true, role: true, language: true, readMode: true, darkMode: true, createdAt: true },
    });
    res.json(user);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { language, readMode, darkMode } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { language, readMode, darkMode },
      select: { id: true, username: true, role: true, language: true, readMode: true, darkMode: true },
    });
    res.json(user);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/change-password', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) { res.status(400).json({ error: 'Current password incorrect' }); return; }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ message: 'Password changed' });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/favorites', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.userId },
      include: { series: { include: { genres: { include: { genre: true } }, _count: { select: { chapters: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites.map((f) => f.series));
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/favorites/:seriesId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.favorite.create({ data: { userId: req.user.userId, seriesId: req.params.seriesId } });
    res.json({ message: 'Added to favorites' });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/favorites/:seriesId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.favorite.deleteMany({ where: { userId: req.user.userId, seriesId: req.params.seriesId } });
    res.json({ message: 'Removed from favorites' });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const history = await prisma.readingHistory.findMany({
      where: { userId: req.user.userId },
      include: { series: { select: { title: true, cover: true } }, chapter: { select: { number: true, title: true } } },
      orderBy: { readAt: 'desc' },
      take: 50,
    });
    res.json(history);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/progress', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { seriesId, chapterId, page } = req.body;
    const progress = await prisma.readingProgress.upsert({
      where: { userId_chapterId: { userId: req.user.userId, chapterId } },
      create: { userId: req.user.userId, seriesId, chapterId, page },
      update: { page },
    });
    res.json(progress);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

// Admin routes
router.get('/', authenticate, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, role: true, isActive: true, language: true, createdAt: true, lastLoginAt: true, _count: { select: { favorites: true, readingHistory: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, email, role, language } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, email, role, language },
      select: { id: true, username: true, email: true, role: true, isActive: true, language: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.patch('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { username, email, role, isActive, language } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { username, email, role, isActive, language },
      select: { id: true, username: true, email: true, role: true, isActive: true, language: true },
    });
    res.json(user);
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    if (req.params.id === req.user.userId) { res.status(400).json({ error: 'Cannot delete yourself' }); return; }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch { res.status(500).json({ error: 'Internal server error' }); }
});

export const userRoutes = router;

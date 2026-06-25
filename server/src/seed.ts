import bcrypt from 'bcrypt';
import { prisma } from './main';

export async function seedAdmin(): Promise<void> {
  const username = process.env.ADMIN_USERNAME || 'DEXTER';
  const password = process.env.ADMIN_PASSWORD || 'Hamid4747';
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');

  const existingAdmin = await prisma.user.findUnique({ where: { username } });
  if (existingAdmin) {
    console.log(`Admin "${username}" already exists`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, bcryptRounds);
  await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      language: 'DE',
      darkMode: true,
    },
  });
  console.log(`Admin "${username}" created`);
}

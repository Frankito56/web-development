import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo users for UniLib...');

  await prisma.wishlistItem.deleteMany({});
  await prisma.readingRecord.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.loan.deleteMany({});
  await prisma.book.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const profPassword = await bcrypt.hash('Prof123!', 10);
  const studentPassword = await bcrypt.hash('Student123!', 10);

  await prisma.user.create({
    data: {
      email: 'biblioteca@unilib.edu',
      passwordHash: adminPassword,
      name: 'Laura Benitez',
      role: 'LIBRARIAN',
      studentOrEmployeeId: 'LIB-001',
      department: 'Central Library',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  await prisma.user.create({
    data: {
      email: 'profesor.garcia@unilib.edu',
      passwordHash: profPassword,
      name: 'Alejandro Garcia',
      role: 'PROFESSOR',
      studentOrEmployeeId: 'PROF-2024',
      department: 'Software Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  await prisma.user.create({
    data: {
      email: 'estudiante.franco@unilib.edu',
      passwordHash: studentPassword,
      name: 'Franco Moreno',
      role: 'STUDENT',
      studentOrEmployeeId: 'EST-9901',
      department: 'Computer Science',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    },
  });

  await prisma.user.create({
    data: {
      email: 'estudiante.maria@unilib.edu',
      passwordHash: studentPassword,
      name: 'Maria Fernandez',
      role: 'STUDENT',
      studentOrEmployeeId: 'EST-9902',
      department: 'Systems Engineering',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    },
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

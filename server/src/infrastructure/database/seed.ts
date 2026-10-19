import bcrypt from 'bcryptjs';
import { sequelize } from './sequelize';
import {
  initDb,
  UserModel,
  BookModel,
  LoanModel,
  ReservationModel,
  ReadingRecordModel,
  WishlistItemModel,
} from './models';

export async function seed(): Promise<void> {
  console.log('Synchronizing database tables with Sequelize...');
  await initDb();

  console.log('Seeding demo users for UniLib...');

  await WishlistItemModel.destroy({ where: {} });
  await ReadingRecordModel.destroy({ where: {} });
  await ReservationModel.destroy({ where: {} });
  await LoanModel.destroy({ where: {} });
  await BookModel.destroy({ where: {} });
  await UserModel.destroy({ where: {} });

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const profPassword = await bcrypt.hash('Prof123!', 10);
  const studentPassword = await bcrypt.hash('Student123!', 10);

  await UserModel.create({
    email: 'biblioteca@unilib.edu',
    passwordHash: adminPassword,
    name: 'Laura Benitez',
    role: 'LIBRARIAN',
    studentOrEmployeeId: 'LIB-001',
    department: 'Central Library',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  });

  await UserModel.create({
    email: 'profesor.garcia@unilib.edu',
    passwordHash: profPassword,
    name: 'Alejandro Garcia',
    role: 'PROFESSOR',
    studentOrEmployeeId: 'PROF-2024',
    department: 'Software Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  await UserModel.create({
    email: 'estudiante.franco@unilib.edu',
    passwordHash: studentPassword,
    name: 'Franco Moreno',
    role: 'STUDENT',
    studentOrEmployeeId: 'EST-9901',
    department: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  });

  await UserModel.create({
    email: 'estudiante.maria@unilib.edu',
    passwordHash: studentPassword,
    name: 'Maria Fernandez',
    role: 'STUDENT',
    studentOrEmployeeId: 'EST-9902',
    department: 'Systems Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  });

  console.log('Seeding completed successfully.');
}

if (require.main === module) {
  seed()
    .then(async () => {
      await sequelize.close();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('Seeding failed:', e);
      await sequelize.close();
      process.exit(1);
    });
}

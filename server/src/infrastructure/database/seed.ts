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

  await UserModel.create({
    email: 'librarian@unilib.edu',
    passwordHash: adminPassword,
    name: 'Campus Librarian',
    role: 'LIBRARIAN',
    studentOrEmployeeId: 'LIB-002',
    department: 'Central Library',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  });

  console.log('Seeding completed successfully. Default librarian accounts created.');
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

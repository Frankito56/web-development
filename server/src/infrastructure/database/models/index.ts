import { sequelize } from '../sequelize';
import { UserModel, UserAttributes, UserCreationAttributes } from './UserModel';
import { BookModel, BookAttributes, BookCreationAttributes } from './BookModel';
import { LoanModel, LoanAttributes, LoanCreationAttributes } from './LoanModel';
import { ReservationModel, ReservationAttributes, ReservationCreationAttributes } from './ReservationModel';
import { ReadingRecordModel, ReadingRecordAttributes, ReadingRecordCreationAttributes } from './ReadingRecordModel';
import { WishlistItemModel, WishlistItemAttributes, WishlistItemCreationAttributes } from './WishlistItemModel';

UserModel.hasMany(LoanModel, { foreignKey: 'userId', as: 'loans' });
LoanModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
BookModel.hasMany(LoanModel, { foreignKey: 'bookId', as: 'loans' });
LoanModel.belongsTo(BookModel, { foreignKey: 'bookId', as: 'book' });

UserModel.hasMany(ReservationModel, { foreignKey: 'userId', as: 'reservations' });
ReservationModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
BookModel.hasMany(ReservationModel, { foreignKey: 'bookId', as: 'reservations' });
ReservationModel.belongsTo(BookModel, { foreignKey: 'bookId', as: 'book' });

UserModel.hasMany(ReadingRecordModel, { foreignKey: 'userId', as: 'readingRecords' });
ReadingRecordModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
BookModel.hasMany(ReadingRecordModel, { foreignKey: 'bookId', as: 'readingRecords' });
ReadingRecordModel.belongsTo(BookModel, { foreignKey: 'bookId', as: 'book' });

UserModel.hasMany(WishlistItemModel, { foreignKey: 'userId', as: 'wishlistItems' });
WishlistItemModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });
BookModel.hasMany(WishlistItemModel, { foreignKey: 'bookId', as: 'wishlistItems' });
WishlistItemModel.belongsTo(BookModel, { foreignKey: 'bookId', as: 'book' });

export async function initDb(): Promise<void> {
  await sequelize.authenticate();
  await sequelize.sync({ alter: false });
}

export {
  UserModel,
  UserAttributes,
  UserCreationAttributes,
  BookModel,
  BookAttributes,
  BookCreationAttributes,
  LoanModel,
  LoanAttributes,
  LoanCreationAttributes,
  ReservationModel,
  ReservationAttributes,
  ReservationCreationAttributes,
  ReadingRecordModel,
  ReadingRecordAttributes,
  ReadingRecordCreationAttributes,
  WishlistItemModel,
  WishlistItemAttributes,
  WishlistItemCreationAttributes,
};

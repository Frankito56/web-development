import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  studentOrEmployeeId: string;
  department: string;
  avatarUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'role' | 'avatarUrl' | 'createdAt' | 'updatedAt'>;

export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare name: string;
  declare role: string;
  declare studentOrEmployeeId: string;
  declare department: string;
  declare avatarUrl?: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'STUDENT',
    },
    studentOrEmployeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export interface BookAttributes {
  id: string;
  openLibraryKey?: string | null;
  isbn?: string | null;
  title: string;
  authors: string;
  publishYear?: number | null;
  coverUrl?: string | null;
  description?: string | null;
  subjects: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  availabilityStatus: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BookCreationAttributes = Optional<
  BookAttributes,
  | 'id'
  | 'openLibraryKey'
  | 'isbn'
  | 'publishYear'
  | 'coverUrl'
  | 'description'
  | 'subjects'
  | 'totalCopies'
  | 'availableCopies'
  | 'shelfLocation'
  | 'availabilityStatus'
  | 'createdAt'
  | 'updatedAt'
>;

export class BookModel extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
  declare id: string;
  declare openLibraryKey?: string | null;
  declare isbn?: string | null;
  declare title: string;
  declare authors: string;
  declare publishYear?: number | null;
  declare coverUrl?: string | null;
  declare description?: string | null;
  declare subjects: string;
  declare totalCopies: number;
  declare availableCopies: number;
  declare shelfLocation: string;
  declare availabilityStatus: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

BookModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    openLibraryKey: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    isbn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authors: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    publishYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    coverUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subjects: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
    },
    totalCopies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    availableCopies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    shelfLocation: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Floor 1 - Main Desk',
    },
    availabilityStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'AVAILABLE',
    },
  },
  {
    sequelize,
    tableName: 'books',
    timestamps: true,
  }
);

export interface LoanAttributes {
  id: string;
  bookId: string;
  userId: string;
  borrowDate?: Date;
  dueDate: Date;
  returnDate?: Date | null;
  renewCount: number;
  status: string;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  book?: BookAttributes;
  user?: UserAttributes;
}

export type LoanCreationAttributes = Optional<
  LoanAttributes,
  'id' | 'borrowDate' | 'returnDate' | 'renewCount' | 'status' | 'notes' | 'createdAt' | 'updatedAt' | 'book' | 'user'
>;

export class LoanModel extends Model<LoanAttributes, LoanCreationAttributes> implements LoanAttributes {
  declare id: string;
  declare bookId: string;
  declare userId: string;
  declare borrowDate: Date;
  declare dueDate: Date;
  declare returnDate?: Date | null;
  declare renewCount: number;
  declare status: string;
  declare notes?: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly book?: BookModel;
  declare readonly user?: UserModel;
}

LoanModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: BookModel,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    borrowDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    renewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'loans',
    timestamps: true,
  }
);

export interface ReservationAttributes {
  id: string;
  bookId: string;
  userId: string;
  reservedAt?: Date;
  status: string;
  priorityOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
  book?: BookAttributes;
  user?: UserAttributes;
}

export type ReservationCreationAttributes = Optional<
  ReservationAttributes,
  'id' | 'reservedAt' | 'status' | 'priorityOrder' | 'createdAt' | 'updatedAt' | 'book' | 'user'
>;

export class ReservationModel extends Model<ReservationAttributes, ReservationCreationAttributes> implements ReservationAttributes {
  declare id: string;
  declare bookId: string;
  declare userId: string;
  declare reservedAt: Date;
  declare status: string;
  declare priorityOrder: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly book?: BookModel;
  declare readonly user?: UserModel;
}

ReservationModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: BookModel,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    reservedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'WAITING',
    },
    priorityOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'reservations',
    timestamps: true,
  }
);

export interface ReadingRecordAttributes {
  id: string;
  userId: string;
  bookId: string;
  status: string;
  progressPercentage: number;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  book?: BookAttributes;
  user?: UserAttributes;
}

export type ReadingRecordCreationAttributes = Optional<
  ReadingRecordAttributes,
  'id' | 'status' | 'progressPercentage' | 'notes' | 'createdAt' | 'updatedAt' | 'book' | 'user'
>;

export class ReadingRecordModel extends Model<ReadingRecordAttributes, ReadingRecordCreationAttributes> implements ReadingRecordAttributes {
  declare id: string;
  declare userId: string;
  declare bookId: string;
  declare status: string;
  declare progressPercentage: number;
  declare notes?: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly book?: BookModel;
  declare readonly user?: UserModel;
}

ReadingRecordModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: BookModel,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'WANT_TO_READ',
    },
    progressPercentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'reading_records',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'bookId'],
      },
    ],
  }
);

export interface WishlistItemAttributes {
  id: string;
  userId: string;
  bookId: string;
  addedAt?: Date;
  notifyWhenAvailable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  book?: BookAttributes;
  user?: UserAttributes;
}

export type WishlistItemCreationAttributes = Optional<
  WishlistItemAttributes,
  'id' | 'addedAt' | 'notifyWhenAvailable' | 'createdAt' | 'updatedAt' | 'book' | 'user'
>;

export class WishlistItemModel extends Model<WishlistItemAttributes, WishlistItemCreationAttributes> implements WishlistItemAttributes {
  declare id: string;
  declare userId: string;
  declare bookId: string;
  declare addedAt: Date;
  declare notifyWhenAvailable: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly book?: BookModel;
  declare readonly user?: UserModel;
}

WishlistItemModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: UserModel,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: BookModel,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    addedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    notifyWhenAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'wishlist_items',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'bookId'],
      },
    ],
  }
);

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

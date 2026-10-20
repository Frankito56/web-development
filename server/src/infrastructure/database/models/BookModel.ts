import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

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
      defaultValue: 8,
    },
    availableCopies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 8,
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

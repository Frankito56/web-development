import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import { UserModel, UserAttributes } from './UserModel';
import { BookModel, BookAttributes } from './BookModel';

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

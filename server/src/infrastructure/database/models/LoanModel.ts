import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import { UserModel, UserAttributes } from './UserModel';
import { BookModel, BookAttributes } from './BookModel';

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

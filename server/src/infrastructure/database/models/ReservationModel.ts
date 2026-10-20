import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import { UserModel, UserAttributes } from './UserModel';
import { BookModel, BookAttributes } from './BookModel';

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

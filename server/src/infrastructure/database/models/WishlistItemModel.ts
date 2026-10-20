import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';
import { UserModel, UserAttributes } from './UserModel';
import { BookModel, BookAttributes } from './BookModel';

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

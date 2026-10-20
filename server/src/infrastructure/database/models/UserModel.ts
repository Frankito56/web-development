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

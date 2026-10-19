import { UserRole } from '../types';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  studentOrEmployeeId: string;
  department: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublic = Omit<UserEntity, 'passwordHash'>;

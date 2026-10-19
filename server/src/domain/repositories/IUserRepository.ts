import { UserEntity, UserPublic } from '../entities/UserEntity';
import { UserRole } from '../types';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  role?: UserRole;
  studentOrEmployeeId: string;
  department: string;
  avatarUrl?: string;
}

export interface UpdateUserInput {
  name?: string;
  department?: string;
  avatarUrl?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(): Promise<UserPublic[]>;
  create(input: CreateUserInput): Promise<UserEntity>;
  update(id: string, input: UpdateUserInput): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}

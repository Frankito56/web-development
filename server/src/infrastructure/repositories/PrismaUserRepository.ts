import { PrismaClient } from '@prisma/client';
import {
  IUserRepository,
  CreateUserInput,
  UpdateUserInput,
} from '../../domain/repositories/IUserRepository';
import { UserEntity, UserPublic } from '../../domain/entities/UserEntity';
import { UserRole } from '../../domain/types';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    studentOrEmployeeId: string;
    department: string;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return {
      id: record.id,
      email: record.email,
      passwordHash: record.passwordHash,
      name: record.name,
      role: record.role as UserRole,
      studentOrEmployeeId: record.studentOrEmployeeId,
      department: record.department,
      avatarUrl: record.avatarUrl ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toPublic(record: UserEntity): UserPublic {
    const { passwordHash: _, ...rest } = record;
    return rest;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? this.toEntity(record) : null;
  }

  async findAll(): Promise<UserPublic[]> {
    const records = await this.prisma.user.findMany({
      orderBy: { name: 'asc' },
    });
    return records.map((r) => this.toPublic(this.toEntity(r)));
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    const created = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
        role: input.role ?? 'STUDENT',
        studentOrEmployeeId: input.studentOrEmployeeId,
        department: input.department,
        avatarUrl: input.avatarUrl,
      },
    });
    return this.toEntity(created);
  }

  async update(id: string, input: UpdateUserInput): Promise<UserEntity> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        department: input.department,
        avatarUrl: input.avatarUrl,
      },
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

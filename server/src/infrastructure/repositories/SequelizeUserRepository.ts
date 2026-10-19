import {
  IUserRepository,
  CreateUserInput,
  UpdateUserInput,
} from '../../domain/repositories/IUserRepository';
import { UserEntity, UserPublic } from '../../domain/entities/UserEntity';
import { UserRole } from '../../domain/types';
import { UserModel } from '../database/models';

export class SequelizeUserRepository implements IUserRepository {
  private toEntity(record: UserModel): UserEntity {
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
    const record = await UserModel.findByPk(id);
    return record ? this.toEntity(record) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = await UserModel.findOne({ where: { email } });
    return record ? this.toEntity(record) : null;
  }

  async findByStudentOrEmployeeId(studentOrEmployeeId: string): Promise<UserEntity | null> {
    const record = await UserModel.findOne({ where: { studentOrEmployeeId } });
    return record ? this.toEntity(record) : null;
  }

  async findAll(): Promise<UserPublic[]> {
    const records = await UserModel.findAll({
      order: [['name', 'ASC']],
    });
    return records.map((r) => this.toPublic(this.toEntity(r)));
  }

  async create(input: CreateUserInput): Promise<UserEntity> {
    const created = await UserModel.create({
      email: input.email,
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role ?? 'STUDENT',
      studentOrEmployeeId: input.studentOrEmployeeId,
      department: input.department,
      avatarUrl: input.avatarUrl,
    });
    return this.toEntity(created);
  }

  async update(id: string, input: UpdateUserInput): Promise<UserEntity> {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.department !== undefined) user.department = input.department;
    if (input.avatarUrl !== undefined) user.avatarUrl = input.avatarUrl;

    await user.save();
    return this.toEntity(user);
  }

  async delete(id: string): Promise<void> {
    await UserModel.destroy({ where: { id } });
  }
}

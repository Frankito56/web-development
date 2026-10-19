import { PrismaClient } from '@prisma/client';
import {
  IReservationRepository,
  CreateReservationInput,
} from '../../domain/repositories/IReservationRepository';
import { ReservationEntity } from '../../domain/entities/ReservationEntity';
import { ReservationStatus } from '../../domain/types';

export class PrismaReservationRepository implements IReservationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: {
    id: string;
    bookId: string;
    userId: string;
    reservedAt: Date;
    status: string;
    priorityOrder: number;
  }): ReservationEntity {
    return {
      id: record.id,
      bookId: record.bookId,
      userId: record.userId,
      reservedAt: record.reservedAt,
      status: record.status as ReservationStatus,
      priorityOrder: record.priorityOrder,
    };
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const record = await this.prisma.reservation.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<ReservationEntity[]> {
    const records = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { reservedAt: 'desc' },
      include: { book: true },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findActiveByBookId(bookId: string): Promise<ReservationEntity[]> {
    const records = await this.prisma.reservation.findMany({
      where: {
        bookId,
        status: { in: ['WAITING', 'READY_FOR_PICKUP'] },
      },
      orderBy: { priorityOrder: 'asc' },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findActiveByUserAndBook(userId: string, bookId: string): Promise<ReservationEntity | null> {
    const record = await this.prisma.reservation.findFirst({
      where: {
        userId,
        bookId,
        status: { in: ['WAITING', 'READY_FOR_PICKUP'] },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async countActiveByBookId(bookId: string): Promise<number> {
    return this.prisma.reservation.count({
      where: {
        bookId,
        status: { in: ['WAITING', 'READY_FOR_PICKUP'] },
      },
    });
  }

  async create(input: CreateReservationInput): Promise<ReservationEntity> {
    const created = await this.prisma.reservation.create({
      data: {
        bookId: input.bookId,
        userId: input.userId,
        priorityOrder: input.priorityOrder,
        status: 'WAITING',
      },
    });
    return this.toEntity(created);
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<ReservationEntity> {
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status },
    });
    return this.toEntity(updated);
  }

  async cancel(id: string): Promise<ReservationEntity> {
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
    return this.toEntity(updated);
  }
}

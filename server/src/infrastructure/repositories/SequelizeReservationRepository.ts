import { Op } from 'sequelize';
import {
  IReservationRepository,
  CreateReservationInput,
} from '../../domain/repositories/IReservationRepository';
import { ReservationEntity } from '../../domain/entities/ReservationEntity';
import { BookEntity } from '../../domain/entities/BookEntity';
import { ReservationStatus, AvailabilityStatus } from '../../domain/types';
import { ReservationModel, BookModel } from '../database/models';

export class SequelizeReservationRepository implements IReservationRepository {
  private bookToEntity(record: BookModel): BookEntity {
    let parsedAuthors: string[] = [];
    try {
      parsedAuthors = JSON.parse(record.authors);
    } catch {
      parsedAuthors = [record.authors];
    }

    let parsedSubjects: string[] = [];
    try {
      parsedSubjects = JSON.parse(record.subjects);
    } catch {
      parsedSubjects = [];
    }

    return {
      id: record.id,
      openLibraryKey: record.openLibraryKey ?? undefined,
      isbn: record.isbn ?? undefined,
      title: record.title,
      authors: parsedAuthors,
      publishYear: record.publishYear ?? undefined,
      coverUrl: record.coverUrl ?? undefined,
      description: record.description ?? undefined,
      subjects: parsedSubjects,
      totalCopies: record.totalCopies,
      availableCopies: record.availableCopies,
      shelfLocation: record.shelfLocation,
      availabilityStatus: record.availabilityStatus as AvailabilityStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private toEntity(record: ReservationModel): ReservationEntity {
    return {
      id: record.id,
      bookId: record.bookId,
      userId: record.userId,
      reservedAt: record.reservedAt,
      status: record.status as ReservationStatus,
      priorityOrder: record.priorityOrder,
      book: record.book ? this.bookToEntity(record.book as BookModel) : undefined,
    };
  }

  async findById(id: string): Promise<ReservationEntity | null> {
    const record = await ReservationModel.findByPk(id);
    return record ? this.toEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<ReservationEntity[]> {
    const records = await ReservationModel.findAll({
      where: { userId },
      order: [['reservedAt', 'DESC']],
      include: [{ model: BookModel, as: 'book' }],
    });
    return records.map((r) => this.toEntity(r));
  }

  async findActiveByBookId(bookId: string): Promise<ReservationEntity[]> {
    const records = await ReservationModel.findAll({
      where: {
        bookId,
        status: { [Op.in]: ['WAITING', 'READY_FOR_PICKUP'] },
      },
      order: [['priorityOrder', 'ASC']],
    });
    return records.map((r) => this.toEntity(r));
  }

  async findActiveByUserAndBook(userId: string, bookId: string): Promise<ReservationEntity | null> {
    const record = await ReservationModel.findOne({
      where: {
        userId,
        bookId,
        status: { [Op.in]: ['WAITING', 'READY_FOR_PICKUP'] },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async countActiveByBookId(bookId: string): Promise<number> {
    return ReservationModel.count({
      where: {
        bookId,
        status: { [Op.in]: ['WAITING', 'READY_FOR_PICKUP'] },
      },
    });
  }

  async create(input: CreateReservationInput): Promise<ReservationEntity> {
    const created = await ReservationModel.create({
      bookId: input.bookId,
      userId: input.userId,
      priorityOrder: input.priorityOrder,
      status: 'WAITING',
    });
    return this.toEntity(created);
  }

  async updateStatus(id: string, status: ReservationStatus): Promise<ReservationEntity> {
    const reservation = await ReservationModel.findByPk(id);
    if (!reservation) {
      throw new Error(`Reservation with id ${id} not found`);
    }

    reservation.status = status;
    await reservation.save();

    return this.toEntity(reservation);
  }

  async cancel(id: string): Promise<ReservationEntity> {
    const reservation = await ReservationModel.findByPk(id);
    if (!reservation) {
      throw new Error(`Reservation with id ${id} not found`);
    }

    reservation.status = 'CANCELLED';
    await reservation.save();

    return this.toEntity(reservation);
  }
}

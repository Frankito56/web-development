import { Op } from 'sequelize';
import {
  ILoanRepository,
  CreateLoanInput,
} from '../../domain/repositories/ILoanRepository';
import { LoanEntity } from '../../domain/entities/LoanEntity';
import { BookEntity } from '../../domain/entities/BookEntity';
import { LoanStatus, AvailabilityStatus } from '../../domain/types';
import { LoanModel, BookModel, UserModel } from '../database/models';

export class SequelizeLoanRepository implements ILoanRepository {
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

  private toEntity(record: LoanModel): LoanEntity {
    return {
      id: record.id,
      bookId: record.bookId,
      userId: record.userId,
      borrowDate: record.borrowDate,
      dueDate: record.dueDate,
      returnDate: record.returnDate ?? undefined,
      renewCount: record.renewCount,
      status: record.status as LoanStatus,
      notes: record.notes ?? undefined,
      book: record.book ? this.bookToEntity(record.book as BookModel) : undefined,
      user: record.user
        ? {
            id: record.user.id,
            email: record.user.email,
            name: record.user.name,
            role: record.user.role as any,
            studentOrEmployeeId: record.user.studentOrEmployeeId,
            department: record.user.department,
            avatarUrl: record.user.avatarUrl ?? undefined,
            createdAt: record.user.createdAt,
            updatedAt: record.user.updatedAt,
          }
        : undefined,
    };
  }

  async findById(id: string): Promise<LoanEntity | null> {
    const record = await LoanModel.findByPk(id, {
      include: [
        { model: BookModel, as: 'book' },
        { model: UserModel, as: 'user', attributes: ['id', 'name', 'email', 'role', 'studentOrEmployeeId', 'department'] },
      ],
    });
    return record ? this.toEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<LoanEntity[]> {
    const records = await LoanModel.findAll({
      where: { userId },
      order: [['borrowDate', 'DESC']],
      include: [{ model: BookModel, as: 'book' }],
    });
    return records.map((r) => this.toEntity(r));
  }

  async findActiveByBookId(bookId: string): Promise<LoanEntity[]> {
    const records = await LoanModel.findAll({
      where: {
        bookId,
        status: { [Op.in]: ['ACTIVE', 'OVERDUE', 'PENDING_PICKUP', 'DELIVERED'] },
      },
      include: [
        { model: BookModel, as: 'book' },
        { model: UserModel, as: 'user', attributes: ['id', 'name', 'email', 'role', 'studentOrEmployeeId', 'department'] },
      ],
    });
    return records.map((r) => this.toEntity(r));
  }

  async findActiveByUserAndBook(userId: string, bookId: string): Promise<LoanEntity | null> {
    const record = await LoanModel.findOne({
      where: {
        userId,
        bookId,
        status: { [Op.in]: ['ACTIVE', 'OVERDUE', 'PENDING_PICKUP', 'DELIVERED'] },
      },
      include: [{ model: BookModel, as: 'book' }],
    });
    return record ? this.toEntity(record) : null;
  }

  async findOverdue(): Promise<LoanEntity[]> {
    const now = new Date();
    const records = await LoanModel.findAll({
      where: {
        status: { [Op.in]: ['ACTIVE', 'DELIVERED', 'OVERDUE'] },
        dueDate: { [Op.lt]: now },
      },
      include: [
        { model: BookModel, as: 'book' },
        { model: UserModel, as: 'user', attributes: ['id', 'name', 'email', 'role', 'studentOrEmployeeId', 'department'] },
      ],
      order: [['dueDate', 'ASC']],
    });
    return records.map((r) => this.toEntity(r));
  }

  async findCirculation(filters?: { status?: string; overdueOnly?: boolean; userId?: string }): Promise<LoanEntity[]> {
    const whereClause: any = {};
    if (filters?.userId) {
      whereClause.userId = filters.userId;
    }
    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.overdueOnly) {
      whereClause.status = { [Op.in]: ['ACTIVE', 'DELIVERED', 'OVERDUE', 'PENDING_PICKUP'] };
      whereClause.dueDate = { [Op.lt]: new Date() };
    }

    const records = await LoanModel.findAll({
      where: whereClause,
      include: [
        { model: BookModel, as: 'book' },
        { model: UserModel, as: 'user', attributes: ['id', 'name', 'email', 'role', 'studentOrEmployeeId', 'department'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return records.map((r) => this.toEntity(r));
  }

  async create(input: CreateLoanInput): Promise<LoanEntity> {
    const created = await LoanModel.create({
      bookId: input.bookId,
      userId: input.userId,
      dueDate: input.dueDate,
      notes: input.notes,
      status: input.status || 'PENDING_PICKUP',
    });
    const loaded = await this.findById(created.id);
    return loaded || this.toEntity(created);
  }

  async deliver(loanId: string, newDueDate: Date): Promise<LoanEntity> {
    const loan = await LoanModel.findByPk(loanId);
    if (!loan) {
      throw new Error(`Loan with id ${loanId} not found`);
    }

    loan.status = 'DELIVERED';
    loan.borrowDate = new Date();
    loan.dueDate = newDueDate;
    await loan.save();

    const loaded = await this.findById(loanId);
    return loaded || this.toEntity(loan);
  }

  async returnBook(loanId: string, returnDate: Date): Promise<LoanEntity> {
    const loan = await LoanModel.findByPk(loanId);
    if (!loan) {
      throw new Error(`Loan with id ${loanId} not found`);
    }

    loan.returnDate = returnDate;
    loan.status = 'RETURNED';
    await loan.save();

    const loaded = await this.findById(loanId);
    return loaded || this.toEntity(loan);
  }

  async renew(loanId: string, newDueDate: Date): Promise<LoanEntity> {
    const loan = await LoanModel.findByPk(loanId);
    if (!loan) {
      throw new Error(`Loan with id ${loanId} not found`);
    }

    loan.dueDate = newDueDate;
    loan.renewCount += 1;
    await loan.save();

    const loaded = await this.findById(loanId);
    return loaded || this.toEntity(loan);
  }
}

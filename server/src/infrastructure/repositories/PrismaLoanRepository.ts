import { PrismaClient } from '@prisma/client';
import {
  ILoanRepository,
  CreateLoanInput,
} from '../../domain/repositories/ILoanRepository';
import { LoanEntity } from '../../domain/entities/LoanEntity';
import { LoanStatus } from '../../domain/types';

export class PrismaLoanRepository implements ILoanRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toEntity(record: {
    id: string;
    bookId: string;
    userId: string;
    borrowDate: Date;
    dueDate: Date;
    returnDate: Date | null;
    renewCount: number;
    status: string;
    notes: string | null;
  }): LoanEntity {
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
    };
  }

  async findById(id: string): Promise<LoanEntity | null> {
    const record = await this.prisma.loan.findUnique({ where: { id } });
    return record ? this.toEntity(record) : null;
  }

  async findByUserId(userId: string): Promise<LoanEntity[]> {
    const records = await this.prisma.loan.findMany({
      where: { userId },
      orderBy: { borrowDate: 'desc' },
      include: { book: true },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findActiveByBookId(bookId: string): Promise<LoanEntity[]> {
    const records = await this.prisma.loan.findMany({
      where: {
        bookId,
        status: { in: ['ACTIVE', 'OVERDUE'] },
      },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findActiveByUserAndBook(userId: string, bookId: string): Promise<LoanEntity | null> {
    const record = await this.prisma.loan.findFirst({
      where: {
        userId,
        bookId,
        status: { in: ['ACTIVE', 'OVERDUE'] },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async findOverdue(): Promise<LoanEntity[]> {
    const now = new Date();
    const records = await this.prisma.loan.findMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: now },
      },
    });
    return records.map((r) => this.toEntity(r));
  }

  async create(input: CreateLoanInput): Promise<LoanEntity> {
    const created = await this.prisma.loan.create({
      data: {
        bookId: input.bookId,
        userId: input.userId,
        dueDate: input.dueDate,
        notes: input.notes,
        status: 'ACTIVE',
      },
    });
    return this.toEntity(created);
  }

  async returnBook(loanId: string, returnDate: Date): Promise<LoanEntity> {
    const updated = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        returnDate,
        status: 'RETURNED',
      },
    });
    return this.toEntity(updated);
  }

  async renew(loanId: string, newDueDate: Date): Promise<LoanEntity> {
    const updated = await this.prisma.loan.update({
      where: { id: loanId },
      data: {
        dueDate: newDueDate,
        renewCount: { increment: 1 },
      },
    });
    return this.toEntity(updated);
  }
}

import { Op } from 'sequelize';
import {
  ILoanRepository,
  CreateLoanInput,
} from '../../domain/repositories/ILoanRepository';
import { LoanEntity } from '../../domain/entities/LoanEntity';
import { LoanStatus } from '../../domain/types';
import { LoanModel, BookModel } from '../database/models';

export class SequelizeLoanRepository implements ILoanRepository {
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
    };
  }

  async findById(id: string): Promise<LoanEntity | null> {
    const record = await LoanModel.findByPk(id);
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
        status: { [Op.in]: ['ACTIVE', 'OVERDUE'] },
      },
    });
    return records.map((r) => this.toEntity(r));
  }

  async findActiveByUserAndBook(userId: string, bookId: string): Promise<LoanEntity | null> {
    const record = await LoanModel.findOne({
      where: {
        userId,
        bookId,
        status: { [Op.in]: ['ACTIVE', 'OVERDUE'] },
      },
    });
    return record ? this.toEntity(record) : null;
  }

  async findOverdue(): Promise<LoanEntity[]> {
    const now = new Date();
    const records = await LoanModel.findAll({
      where: {
        status: 'ACTIVE',
        dueDate: { [Op.lt]: now },
      },
    });
    return records.map((r) => this.toEntity(r));
  }

  async create(input: CreateLoanInput): Promise<LoanEntity> {
    const created = await LoanModel.create({
      bookId: input.bookId,
      userId: input.userId,
      dueDate: input.dueDate,
      notes: input.notes,
      status: 'ACTIVE',
    });
    return this.toEntity(created);
  }

  async returnBook(loanId: string, returnDate: Date): Promise<LoanEntity> {
    const loan = await LoanModel.findByPk(loanId);
    if (!loan) {
      throw new Error(`Loan with id ${loanId} not found`);
    }

    loan.returnDate = returnDate;
    loan.status = 'RETURNED';
    await loan.save();

    return this.toEntity(loan);
  }

  async renew(loanId: string, newDueDate: Date): Promise<LoanEntity> {
    const loan = await LoanModel.findByPk(loanId);
    if (!loan) {
      throw new Error(`Loan with id ${loanId} not found`);
    }

    loan.dueDate = newDueDate;
    loan.renewCount += 1;
    await loan.save();

    return this.toEntity(loan);
  }
}

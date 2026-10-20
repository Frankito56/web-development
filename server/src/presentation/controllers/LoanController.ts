import { Response } from 'express';
import {
  GetUserLoansUseCase,
  BorrowBookUseCase,
  ReturnBookUseCase,
  RenewLoanUseCase,
  GetCirculationLoansUseCase,
  GetOverdueLoansUseCase,
  DeliverLoanUseCase,
} from '../../application/use-cases/LoanUseCases';
import { GetReservationQueueUseCase } from '../../application/use-cases/ReservationUseCases';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class LoanController {
  constructor(
    private readonly getUserLoansUseCase: GetUserLoansUseCase,
    private readonly borrowUseCase: BorrowBookUseCase,
    private readonly returnUseCase: ReturnBookUseCase,
    private readonly renewUseCase: RenewLoanUseCase,
    private readonly getCirculationLoansUseCase?: GetCirculationLoansUseCase,
    private readonly getOverdueLoansUseCase?: GetOverdueLoansUseCase,
    private readonly deliverLoanUseCase?: DeliverLoanUseCase,
    private readonly getReservationQueueUseCase?: GetReservationQueueUseCase,
  ) {}

  getMyLoans = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const loans = await this.getUserLoansUseCase.execute(req.user.userId);
    res.json({ success: true, data: loans });
  };

  borrow = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const targetUserId =
      req.user.role === 'LIBRARIAN' && req.body.userId ? req.body.userId : req.user.userId;

    const loan = await this.borrowUseCase.execute(targetUserId, req.body.bookId);
    res.status(201).json({ success: true, data: loan });
  };

  returnLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const loan = await this.returnUseCase.execute(String(req.params.id), req.user.userId, req.user.role);
    res.json({ success: true, data: loan });
  };

  renewLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const loan = await this.renewUseCase.execute(String(req.params.id), req.user.userId, req.user.role);
    res.json({ success: true, data: loan });
  };

  getCirculation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!this.getCirculationLoansUseCase) {
      res.status(501).json({ success: false, message: 'Not implemented' });
      return;
    }
    const filters: any = {};
    if (req.query.status) filters.status = String(req.query.status);
    if (req.query.userId) filters.userId = String(req.query.userId);
    if (req.query.overdueOnly === 'true') filters.overdueOnly = true;

    const loans = await this.getCirculationLoansUseCase.execute(filters);
    res.json({ success: true, data: loans });
  };

  getOverdue = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!this.getOverdueLoansUseCase) {
      res.status(501).json({ success: false, message: 'Not implemented' });
      return;
    }
    const overdue = await this.getOverdueLoansUseCase.execute();
    res.json({ success: true, data: overdue });
  };

  deliverLoan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!this.deliverLoanUseCase) {
      res.status(501).json({ success: false, message: 'Not implemented' });
      return;
    }
    const delivered = await this.deliverLoanUseCase.execute(String(req.params.id));
    res.json({ success: true, data: delivered });
  };

  getCirculationOverview = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const [loans, reservations, overdueLoans] = await Promise.all([
      this.getCirculationLoansUseCase ? this.getCirculationLoansUseCase.execute() : Promise.resolve([]),
      this.getReservationQueueUseCase ? this.getReservationQueueUseCase.execute() : Promise.resolve([]),
      this.getOverdueLoansUseCase ? this.getOverdueLoansUseCase.execute() : Promise.resolve([]),
    ]);

    res.json({
      success: true,
      data: {
        loans,
        reservations,
        overdueLoans,
      },
    });
  };
}

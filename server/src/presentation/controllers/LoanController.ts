import { Response } from 'express';
import {
  GetUserLoansUseCase,
  BorrowBookUseCase,
  ReturnBookUseCase,
  RenewLoanUseCase,
} from '../../application/use-cases/LoanUseCases';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class LoanController {
  constructor(
    private readonly getUserLoansUseCase: GetUserLoansUseCase,
    private readonly borrowUseCase: BorrowBookUseCase,
    private readonly returnUseCase: ReturnBookUseCase,
    private readonly renewUseCase: RenewLoanUseCase,
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
    const loan = await this.renewUseCase.execute(String(req.params.id), req.user.userId);
    res.json({ success: true, data: loan });
  };
}

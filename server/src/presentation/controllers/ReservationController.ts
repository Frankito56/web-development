import { Response } from 'express';
import {
  GetUserReservationsUseCase,
  CreateReservationUseCase,
  CancelReservationUseCase,
  FulfillReservationUseCase,
  GetReservationQueueUseCase,
} from '../../application/use-cases/ReservationUseCases';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class ReservationController {
  constructor(
    private readonly getUserReservationsUseCase: GetUserReservationsUseCase,
    private readonly createUseCase: CreateReservationUseCase,
    private readonly cancelUseCase: CancelReservationUseCase,
    private readonly fulfillUseCase: FulfillReservationUseCase,
    private readonly getReservationQueueUseCase?: GetReservationQueueUseCase,
  ) {}

  getMyReservations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const reservations = await this.getUserReservationsUseCase.execute(req.user.userId);
    res.json({ success: true, data: reservations });
  };

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const targetUserId =
      req.user.role === 'LIBRARIAN' && req.body.userId ? req.body.userId : req.user.userId;

    const reservation = await this.createUseCase.execute(targetUserId, req.body.bookId);
    res.status(201).json({ success: true, data: reservation });
  };

  cancel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const reservation = await this.cancelUseCase.execute(String(req.params.id), req.user.userId);
    res.json({ success: true, data: reservation });
  };

  fulfill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const loan = await this.fulfillUseCase.execute(String(req.params.id));
    res.status(201).json({ success: true, data: loan });
  };

  getQueue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!this.getReservationQueueUseCase) {
      res.status(501).json({ success: false, message: 'Not implemented' });
      return;
    }
    const filters: any = {};
    if (req.query.bookId) filters.bookId = String(req.query.bookId);
    if (req.query.status) filters.status = String(req.query.status);

    const queue = await this.getReservationQueueUseCase.execute(filters);
    res.json({ success: true, data: queue });
  };
}

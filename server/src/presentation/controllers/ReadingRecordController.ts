import { Response } from 'express';
import {
  GetUserReadingRecordsUseCase,
  UpsertReadingRecordUseCase,
  DeleteReadingRecordUseCase,
} from '../../application/use-cases/ReadingRecordUseCases';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class ReadingRecordController {
  constructor(
    private readonly getRecordsUseCase: GetUserReadingRecordsUseCase,
    private readonly upsertUseCase: UpsertReadingRecordUseCase,
    private readonly deleteUseCase: DeleteReadingRecordUseCase,
  ) {}

  getMyRecords = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const records = await this.getRecordsUseCase.execute(req.user.userId);
    res.json({ success: true, data: records });
  };

  upsertRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const record = await this.upsertUseCase.execute(req.user.userId, {
      bookId: req.body.bookId,
      status: req.body.status,
      progressPercentage: req.body.progressPercentage,
      notes: req.body.notes,
    });
    res.json({ success: true, data: record });
  };

  deleteRecord = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.deleteUseCase.execute(req.user.userId, String(req.params.bookId));
    res.json({ success: true, message: 'Reading record deleted.' });
  };
}

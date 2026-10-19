import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { ReadingRecordController } from '../controllers/ReadingRecordController';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createReadingRecordRoutes(
  controller: ReadingRecordController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/my', asyncHandler(controller.getMyRecords as any));

  router.put(
    '/',
    [
      body('bookId').trim().notEmpty().withMessage('bookId is required.'),
      body('status')
        .isIn(['WANT_TO_READ', 'READING', 'COMPLETED'])
        .withMessage('Invalid status. Must be WANT_TO_READ, READING, or COMPLETED.'),
      body('progressPercentage')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Progress percentage must be between 0 and 100.'),
      validateRequest,
    ],
    asyncHandler(controller.upsertRecord as any)
  );

  router.delete('/:bookId', asyncHandler(controller.deleteRecord as any));

  return router;
}

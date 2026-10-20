import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { ReservationController } from '../controllers/ReservationController';
import { validateRequest } from '../middlewares/validateRequest';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createReservationRoutes(
  controller: ReservationController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/queue', requireRole('LIBRARIAN') as any, asyncHandler(controller.getQueue as any));

  router.get('/my', asyncHandler(controller.getMyReservations as any));

  router.post(
    '/',
    [
      body('bookId').trim().notEmpty().withMessage('bookId is required.'),
      validateRequest,
    ],
    asyncHandler(controller.create as any)
  );

  router.delete('/:id', asyncHandler(controller.cancel as any));
  router.post('/:id/fulfill', requireRole('LIBRARIAN') as any, asyncHandler(controller.fulfill as any));

  return router;
}

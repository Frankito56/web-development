import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { LoanController } from '../controllers/LoanController';
import { validateRequest } from '../middlewares/validateRequest';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createLoanRoutes(
  controller: LoanController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  // Librarian routes
  router.get('/circulation/overview', requireRole('LIBRARIAN') as any, asyncHandler(controller.getCirculationOverview as any));
  router.get('/circulation', requireRole('LIBRARIAN') as any, asyncHandler(controller.getCirculation as any));
  router.get('/overdue', requireRole('LIBRARIAN') as any, asyncHandler(controller.getOverdue as any));
  router.patch('/:id/deliver', requireRole('LIBRARIAN') as any, asyncHandler(controller.deliverLoan as any));

  // Patron & General routes
  router.get('/my', asyncHandler(controller.getMyLoans as any));

  router.post(
    '/',
    [
      body('bookId').trim().notEmpty().withMessage('bookId is required.'),
      validateRequest,
    ],
    asyncHandler(controller.borrow as any)
  );

  router.patch('/:id/renew', asyncHandler(controller.renewLoan as any));
  router.patch('/:id/return', asyncHandler(controller.returnLoan as any));

  return router;
}

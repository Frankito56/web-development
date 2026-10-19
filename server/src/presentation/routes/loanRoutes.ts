import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { LoanController } from '../controllers/LoanController';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createLoanRoutes(
  controller: LoanController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

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

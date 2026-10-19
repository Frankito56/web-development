import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { BookController } from '../controllers/BookController';
import { validateRequest } from '../middlewares/validateRequest';
import { requireRole } from '../middlewares/roleMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createBookRoutes(
  controller: BookController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.get('/', asyncHandler(controller.getAll as any));
  router.get('/:id', asyncHandler(controller.getById as any));

  router.post(
    '/import',
    authMiddleware,
    requireRole('LIBRARIAN') as any,
    [
      body('openLibraryKey').trim().notEmpty().withMessage('openLibraryKey is required.'),
      validateRequest,
    ],
    asyncHandler(controller.importFromOpenLibrary as any)
  );

  router.patch(
    '/:id/inventory',
    authMiddleware,
    requireRole('LIBRARIAN') as any,
    asyncHandler(controller.updateInventory as any)
  );

  return router;
}

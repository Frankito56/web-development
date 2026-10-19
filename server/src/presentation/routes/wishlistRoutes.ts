import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { WishlistController } from '../controllers/WishlistController';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createWishlistRoutes(
  controller: WishlistController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/my', asyncHandler(controller.getMyWishlist as any));

  router.post(
    '/',
    [
      body('bookId').trim().notEmpty().withMessage('bookId is required.'),
      validateRequest,
    ],
    asyncHandler(controller.addItem as any)
  );

  router.delete('/:bookId', asyncHandler(controller.removeItem as any));

  return router;
}

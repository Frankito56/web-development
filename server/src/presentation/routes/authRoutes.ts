import { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createAuthRoutes(
  controller: AuthController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.post(
    '/register',
    [
      body('email').isEmail().withMessage('Valid email required.'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
      body('name').trim().notEmpty().withMessage('Name is required.'),
      body('studentOrEmployeeId').trim().notEmpty().withMessage('Student or employee ID is required.'),
      body('department').trim().notEmpty().withMessage('Department is required.'),
      body('role').optional().isIn(['STUDENT', 'PROFESSOR']).withMessage('Role must be STUDENT or PROFESSOR.'),
      body('avatarUrl').optional().trim(),
      validateRequest,
    ],
    asyncHandler(controller.register as any)
  );

  router.post(
    '/login',
    [
      body('email').isEmail().withMessage('Valid email required.'),
      body('password').notEmpty().withMessage('Password is required.'),
      validateRequest,
    ],
    asyncHandler(controller.login as any)
  );

  router.get('/me', authMiddleware, asyncHandler(controller.getProfile as any));

  router.patch(
    '/profile',
    authMiddleware,
    [
      body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.'),
      body('department').optional().trim().notEmpty().withMessage('Department cannot be empty.'),
      body('avatarUrl').optional().trim(),
      validateRequest,
    ],
    asyncHandler(controller.updateProfile as any)
  );

  return router;
}

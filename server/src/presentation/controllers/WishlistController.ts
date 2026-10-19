import { Response } from 'express';
import {
  GetUserWishlistUseCase,
  AddToWishlistUseCase,
  RemoveFromWishlistUseCase,
} from '../../application/use-cases/WishlistUseCases';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class WishlistController {
  constructor(
    private readonly getWishlistUseCase: GetUserWishlistUseCase,
    private readonly addUseCase: AddToWishlistUseCase,
    private readonly removeUseCase: RemoveFromWishlistUseCase,
  ) {}

  getMyWishlist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const items = await this.getWishlistUseCase.execute(req.user.userId);
    res.json({ success: true, data: items });
  };

  addItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const item = await this.addUseCase.execute(
      req.user.userId,
      req.body.bookId,
      req.body.notifyWhenAvailable
    );
    res.status(201).json({ success: true, data: item });
  };

  removeItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await this.removeUseCase.execute(req.user.userId, String(req.params.bookId));
    res.json({ success: true, message: 'Book removed from wishlist.' });
  };
}

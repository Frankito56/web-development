import { Request, Response } from 'express';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  GetUserProfileUseCase,
} from '../../application/use-cases/AuthUseCases';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
    private readonly getProfileUseCase: GetUserProfileUseCase,
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.registerUseCase.execute(req.body);
    res.status(201).json({ success: true, data: result });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.loginUseCase.execute(req.body);
    res.json({ success: true, data: result });
  };

  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const profile = await this.getProfileUseCase.execute(req.user.userId);
    res.json({ success: true, data: profile });
  };
}

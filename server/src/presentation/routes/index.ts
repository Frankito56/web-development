import { Router } from 'express';
import { BcryptHasher } from '../../infrastructure/security/BcryptHasher';
import { JwtService } from '../../infrastructure/security/JwtService';
import { OpenLibraryClient } from '../../infrastructure/external/OpenLibraryClient';

import { SequelizeUserRepository } from '../../infrastructure/repositories/SequelizeUserRepository';
import { SequelizeBookRepository } from '../../infrastructure/repositories/SequelizeBookRepository';
import { SequelizeLoanRepository } from '../../infrastructure/repositories/SequelizeLoanRepository';
import { SequelizeReservationRepository } from '../../infrastructure/repositories/SequelizeReservationRepository';
import { SequelizeReadingRecordRepository } from '../../infrastructure/repositories/SequelizeReadingRecordRepository';
import { SequelizeWishlistRepository } from '../../infrastructure/repositories/SequelizeWishlistRepository';

import {
  RegisterUserUseCase,
  LoginUserUseCase,
  GetUserProfileUseCase,
} from '../../application/use-cases/AuthUseCases';
import {
  GetBooksUseCase,
  GetBookByIdUseCase,
  ImportBookUseCase,
  UpdateBookInventoryUseCase,
} from '../../application/use-cases/BookUseCases';
import {
  GetUserLoansUseCase,
  BorrowBookUseCase,
  ReturnBookUseCase,
  RenewLoanUseCase,
} from '../../application/use-cases/LoanUseCases';
import {
  GetUserReservationsUseCase,
  CreateReservationUseCase,
  CancelReservationUseCase,
  FulfillReservationUseCase,
} from '../../application/use-cases/ReservationUseCases';
import {
  GetUserReadingRecordsUseCase,
  UpsertReadingRecordUseCase,
  DeleteReadingRecordUseCase,
} from '../../application/use-cases/ReadingRecordUseCases';
import {
  GetUserWishlistUseCase,
  AddToWishlistUseCase,
  RemoveFromWishlistUseCase,
} from '../../application/use-cases/WishlistUseCases';

import { AuthController } from '../controllers/AuthController';
import { BookController } from '../controllers/BookController';
import { LoanController } from '../controllers/LoanController';
import { ReservationController } from '../controllers/ReservationController';
import { ReadingRecordController } from '../controllers/ReadingRecordController';
import { WishlistController } from '../controllers/WishlistController';

import { createAuthMiddleware } from '../middlewares/authMiddleware';

import { createAuthRoutes } from './authRoutes';
import { createBookRoutes } from './bookRoutes';
import { createLoanRoutes } from './loanRoutes';
import { createReservationRoutes } from './reservationRoutes';
import { createReadingRecordRoutes } from './readingRecordRoutes';
import { createWishlistRoutes } from './wishlistRoutes';

export function createApiRouter(): Router {
  const apiRouter = Router();

  const hasher = new BcryptHasher();
  const tokenService = new JwtService();
  const openLibraryClient = new OpenLibraryClient();

  const userRepo = new SequelizeUserRepository();
  const bookRepo = new SequelizeBookRepository();
  const loanRepo = new SequelizeLoanRepository();
  const reservationRepo = new SequelizeReservationRepository();
  const readingRecordRepo = new SequelizeReadingRecordRepository();
  const wishlistRepo = new SequelizeWishlistRepository();

  const registerUseCase = new RegisterUserUseCase(userRepo, hasher, tokenService);
  const loginUseCase = new LoginUserUseCase(userRepo, hasher, tokenService);
  const getProfileUseCase = new GetUserProfileUseCase(userRepo);

  const getBooksUseCase = new GetBooksUseCase(bookRepo);
  const getBookByIdUseCase = new GetBookByIdUseCase(bookRepo);
  const importBookUseCase = new ImportBookUseCase(bookRepo, openLibraryClient);
  const updateInventoryUseCase = new UpdateBookInventoryUseCase(bookRepo);

  const getUserLoansUseCase = new GetUserLoansUseCase(loanRepo);
  const borrowUseCase = new BorrowBookUseCase(loanRepo, bookRepo, openLibraryClient);
  const returnUseCase = new ReturnBookUseCase(loanRepo, bookRepo);
  const renewUseCase = new RenewLoanUseCase(loanRepo);

  const getUserReservationsUseCase = new GetUserReservationsUseCase(reservationRepo);
  const createReservationUseCase = new CreateReservationUseCase(reservationRepo, loanRepo, bookRepo, openLibraryClient);
  const cancelReservationUseCase = new CancelReservationUseCase(reservationRepo);
  const fulfillReservationUseCase = new FulfillReservationUseCase(reservationRepo, loanRepo, bookRepo);

  const getRecordsUseCase = new GetUserReadingRecordsUseCase(readingRecordRepo);
  const upsertRecordUseCase = new UpsertReadingRecordUseCase(readingRecordRepo, bookRepo, openLibraryClient);
  const deleteRecordUseCase = new DeleteReadingRecordUseCase(readingRecordRepo);

  const getWishlistUseCase = new GetUserWishlistUseCase(wishlistRepo);
  const addWishlistUseCase = new AddToWishlistUseCase(wishlistRepo, bookRepo, openLibraryClient);
  const removeWishlistUseCase = new RemoveFromWishlistUseCase(wishlistRepo);

  const authController = new AuthController(registerUseCase, loginUseCase, getProfileUseCase);
  const bookController = new BookController(
    getBooksUseCase,
    getBookByIdUseCase,
    importBookUseCase,
    updateInventoryUseCase
  );
  const loanController = new LoanController(getUserLoansUseCase, borrowUseCase, returnUseCase, renewUseCase);
  const reservationController = new ReservationController(
    getUserReservationsUseCase,
    createReservationUseCase,
    cancelReservationUseCase,
    fulfillReservationUseCase
  );
  const readingRecordController = new ReadingRecordController(
    getRecordsUseCase,
    upsertRecordUseCase,
    deleteRecordUseCase
  );
  const wishlistController = new WishlistController(
    getWishlistUseCase,
    addWishlistUseCase,
    removeWishlistUseCase
  );

  const authMiddleware = createAuthMiddleware(tokenService);

  apiRouter.use('/auth', createAuthRoutes(authController, authMiddleware));
  apiRouter.use('/books', createBookRoutes(bookController, authMiddleware));
  apiRouter.use('/loans', createLoanRoutes(loanController, authMiddleware));
  apiRouter.use('/reservations', createReservationRoutes(reservationController, authMiddleware));
  apiRouter.use('/reading-records', createReadingRecordRoutes(readingRecordController, authMiddleware));
  apiRouter.use('/wishlist', createWishlistRoutes(wishlistController, authMiddleware));

  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  return apiRouter;
}

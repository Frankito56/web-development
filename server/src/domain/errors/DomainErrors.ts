export class DomainError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Invalid credentials.', 401);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized access.') {
    super(message, 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden resource.') {
    super(message, 403);
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super(`${resource} not found.`, 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class BookNotAvailableError extends DomainError {
  constructor() {
    super('No available copies for this book.', 409);
  }
}

export class AlreadyBorrowedError extends DomainError {
  constructor() {
    super('You already have an active loan for this book.', 409);
  }
}

export class AlreadyReservedError extends DomainError {
  constructor() {
    super('You already have an active reservation for this book.', 409);
  }
}

export class MaxRenewalsReachedError extends DomainError {
  constructor() {
    super('Maximum renewal limit reached (2 renewals).', 409);
  }
}

export class LoanNotActiveError extends DomainError {
  constructor() {
    super('This loan is not active.', 409);
  }
}

export class ReservationNotReadyError extends DomainError {
  constructor() {
    super('The reservation is not ready for pickup yet.', 409);
  }
}

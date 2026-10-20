# UniLib API Server

RESTful backend API for the UniLib University Library Management System, built with **Node.js**, **Express**, **TypeScript**, and **Sequelize ORM** with **PostgreSQL**, following **Clean Architecture** principles.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Folder Structure](#2-folder-structure)
3. [Tech Stack](#3-tech-stack)
4. [Setup & Running](#4-setup--running)
5. [Environment Variables](#5-environment-variables)
6. [API Reference](#6-api-reference)
7. [Demo Credentials](#7-demo-credentials)
8. [Database](#8-database)
9. [How Open Library Integration Works](#9-how-open-library-integration-works)
10. [Error Handling](#10-error-handling)

---

## 1. Architecture Overview

The server follows a strict **Clean Architecture** layered approach with a unidirectional dependency rule: outer layers depend on inner layers, never the reverse.

**Key principles applied:**
- **Domain layer** has zero framework dependencies — pure TypeScript interfaces and classes.
- **Application layer** encodes all business rules. Use cases throw domain errors; they contain no try/catch blocks.
- **Infrastructure layer** adapts external services (Sequelize, bcrypt, JWT, Open Library API) to the domain ports.
- **Presentation layer** handles HTTP. Controllers are thin — they only parse requests and call use cases. No business logic lives here.
- **Global error middleware** catches all exceptions and maps domain errors to correct HTTP status codes. Controllers never handle errors directly.
- All strings in the codebase are in English. No `throw` statements in controllers.

---

## 2. Folder Structure

```
server/
├── src/
│   ├── domain/
│   │   ├── entities/        # Pure domain entity interfaces
│   │   │   ├── UserEntity.ts
│   │   │   ├── BookEntity.ts
│   │   │   ├── LoanEntity.ts
│   │   │   ├── ReservationEntity.ts
│   │   │   ├── ReadingRecordEntity.ts
│   │   │   └── WishlistItemEntity.ts
│   │   ├── repositories/    # Repository port interfaces (contracts)
│   │   │   ├── IUserRepository.ts
│   │   │   ├── IBookRepository.ts
│   │   │   ├── ILoanRepository.ts
│   │   │   ├── IReservationRepository.ts
│   │   │   ├── IReadingRecordRepository.ts
│   │   │   └── IWishlistRepository.ts
│   │   ├── errors/
│   │   │   └── DomainErrors.ts  # Typed domain error hierarchy
│   │   └── types.ts             # Shared domain value types (enums)
│   ├── application/
│   │   ├── dtos/
│   │   │   └── index.ts         # All Data Transfer Objects
│   │   ├── services/            # Service abstractions (ports)
│   │   │   ├── IHasher.ts
│   │   │   └── ITokenService.ts
│   │   └── use-cases/           # Business logic per domain
│   │       ├── AuthUseCases.ts
│   │       ├── BookUseCases.ts
│   │       ├── LoanUseCases.ts
│   │       ├── ReservationUseCases.ts
│   │       ├── ReadingRecordUseCases.ts
│   │       └── WishlistUseCases.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── sequelize.ts         # Sequelize connection instance
│   │   │   ├── seed.ts              # Demo seed script
│   │   │   └── models/
│   │   │       └── index.ts         # Sequelize model definitions & associations
│   │   ├── external/
│   │   │   └── OpenLibraryClient.ts # Open Library API HTTP client
│   │   ├── repositories/            # Sequelize repository implementations
│   │   │   ├── SequelizeUserRepository.ts
│   │   │   ├── SequelizeBookRepository.ts
│   │   │   ├── SequelizeLoanRepository.ts
│   │   │   ├── SequelizeReservationRepository.ts
│   │   │   ├── SequelizeReadingRecordRepository.ts
│   │   │   └── SequelizeWishlistRepository.ts
│   │   └── security/
│   │       ├── BcryptHasher.ts      # IHasher implementation
│   │       └── JwtService.ts        # ITokenService implementation
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── BookController.ts
│   │   │   ├── LoanController.ts
│   │   │   ├── ReservationController.ts
│   │   │   ├── ReadingRecordController.ts
│   │   │   └── WishlistController.ts
│   │   ├── middlewares/
│   │   │   ├── asyncHandler.ts      # Wraps async route handlers
│   │   │   ├── authMiddleware.ts    # JWT verification
│   │   │   ├── errorHandler.ts      # Global error-to-HTTP mapper
│   │   │   ├── roleMiddleware.ts    # Role-based authorization
│   │   │   └── validateRequest.ts   # Request body validation
│   │   └── routes/
│   │       ├── index.ts             # DI composition root & API router
│   │       ├── authRoutes.ts
│   │       ├── bookRoutes.ts
│   │       ├── loanRoutes.ts
│   │       ├── reservationRoutes.ts
│   │       ├── readingRecordRoutes.ts
│   │       └── wishlistRoutes.ts
│   ├── app.ts                       # Express app factory (CORS, Helmet, JSON)
│   └── server.ts                    # HTTP server entry point
├── .env                             # Local environment variables
├── .env.example                     # Environment variable template
├── package.json
└── tsconfig.json
```

---

## 3. Tech Stack

| Tool             | Version  | Purpose                              |
|:---------------- |:-------- |:------------------------------------ |
| Node.js          | 22.x     | JavaScript runtime                   |
| TypeScript       | 5.x      | Static typing (strict mode)          |
| Express          | 4.x      | HTTP framework                       |
| Sequelize ORM    | 6.x      | Database access and model management |
| PostgreSQL       | 15+      | Primary database                     |
| bcryptjs         | 2.x      | Password hashing                     |
| jsonwebtoken     | 9.x      | JWT creation and verification        |
| helmet           | 8.x      | HTTP security headers                |
| cors             | 2.x      | Cross-Origin Resource Sharing        |
| ts-node-dev      | 2.x      | Hot-reload TypeScript dev server     |

---

## 4. Setup & Running

### Prerequisites

- Node.js 18+ (22.x recommended)
- npm 9+
- PostgreSQL 15+

### Installation

```bash
# 1. Navigate to the server directory
cd server

# 2. Install all dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your configuration if needed

# 4. (Optional) Pre-seed demo users (auto-creates tables)
npm run seed

# 5. Start the development server (hot-reload, auto-syncs DB)
npm run dev
```

The server starts on **http://localhost:3000** by default.

### Available Scripts

| `npm run dev`      | Start development server with hot-reload (auto-syncs DB) |
| `npm run build`    | Compile TypeScript to `dist/`                  |
| `npm start`        | Run compiled production build                  |
| `npm run seed`     | Seed demo user accounts into PostgreSQL        |
| `npm run db:sync`  | Synchronize Sequelize models with PostgreSQL   |
| `npm run lint`     | Run TypeScript type-check (`tsc --noEmit`)     |

---

## 5. Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/unilib?schema=public"

# JWT
JWT_SECRET=unilib-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS - Frontend URL
CORS_ORIGIN=http://localhost:5173
```

---

## 6. API Reference

All endpoints are prefixed with `/api`.

### Authentication

| Method | Endpoint         | Auth | Body / Params                                                   | Response                   |
|:------ |:---------------- |:---- |:--------------------------------------------------------------- |:-------------------------- |
| POST   | `/auth/register` | No   | `{ email, password, name, studentOrEmployeeId, department, role? }` *(role: STUDENT or PROFESSOR only)* | `{ token, user }`          |
| POST   | `/auth/login`    | No   | `{ email, password }`                                           | `{ token, user }`          |
| GET    | `/auth/me`       | Yes  | —                                                               | `{ user }`                 |
| PATCH  | `/auth/profile`  | Yes  | `{ name?, department?, avatarUrl? }`                            | `{ user }`                 |

### Books

| Method | Endpoint                    | Auth      | Query / Body                                                          | Response                            |
|:------ |:--------------------------- |:--------- |:--------------------------------------------------------------------- |:----------------------------------- |
| GET    | `/books`                    | No        | `?search=&subject=&page=1&limit=12`                                   | `{ books[], total, page, totalPages }` |
| GET    | `/books/:id`                | No        | —                                                                     | `BookEntity`                        |
| POST   | `/books/import`             | Librarian | `{ openLibraryKey, totalCopies?, shelfLocation? }` *(max 8 copies)*   | `BookEntity`                        |
| PATCH  | `/books/:id/inventory`      | Librarian | `{ totalCopies?, shelfLocation? }` *(max 8 copies)*                   | `BookEntity`                        |

### Loans & Circulation

The loan workflow follows an institutional two-step pickup and delivery lifecycle:
1. Patron submits loan request (`POST /loans`) -> Status: `PENDING_PICKUP`.
2. Librarian verifies student/professor credentials at the Circulation Desk and hands over book (`PATCH /loans/:id/deliver`) -> Status: `DELIVERED`.
3. When the physical book is returned (`PATCH /loans/:id/return`), status becomes `RETURNED`. If there is a waiting reservation queue for that book, the oldest reservation automatically converts into a new `PENDING_PICKUP` loan for the waiting patron, and the reservation is marked `FULFILLED`.

| Method | Endpoint                    | Auth      | Body / Params                       | Response          |
|:------ |:--------------------------- |:--------- |:----------------------------------- |:----------------- |
| POST   | `/loans`                    | Yes       | `{ bookId }`                        | `LoanEntity`      |
| GET    | `/loans/my`                 | Yes       | —                                   | `LoanEntity[]`    |
| GET    | `/loans/circulation/overview`| Librarian| —                                   | `{ activeLoans[], reservations[] }` |
| GET    | `/loans/circulation`        | Librarian | —                                   | `LoanEntity[]`    |
| GET    | `/loans/overdue`            | Librarian | —                                   | `LoanEntity[]`    |
| PATCH  | `/loans/:id/deliver`        | Librarian | —                                   | `LoanEntity`      |
| PATCH  | `/loans/:id/return`         | Yes/Librarian | —                               | `LoanEntity`      |
| PATCH  | `/loans/:id/renew`          | Yes       | —                                   | `LoanEntity`      |

### Reservations

| Method | Endpoint                        | Auth      | Body / Params  | Response              |
|:------ |:--------------------------------|:--------- |:-------------- |:--------------------- |
| POST   | `/reservations`                 | Yes       | `{ bookId }`   | `ReservationEntity`   |
| GET    | `/reservations/my`              | Yes       | —              | `ReservationEntity[]` |
| GET    | `/reservations/queue`           | Librarian | —              | `ReservationEntity[]` |
| DELETE | `/reservations/:id`             | Yes       | —              | `ReservationEntity`   |
| POST   | `/reservations/:id/fulfill`     | Librarian | —              | `ReservationEntity`   |

### Reading Records

| Method | Endpoint                        | Auth | Body / Params                                                      | Response                |
|:------ |:--------------------------------|:---- |:------------------------------------------------------------------ |:----------------------- |
| PUT    | `/reading-records`              | Yes  | `{ bookId, status, progressPercentage?, notes? }`                  | `ReadingRecordEntity`   |
| GET    | `/reading-records/my`           | Yes  | —                                                                  | `ReadingRecordEntity[]` |
| DELETE | `/reading-records/:bookId`      | Yes  | —                                                                  | `{ success: true }`     |

### Wishlist

| Method | Endpoint              | Auth | Body / Params                            | Response              |
|:------ |:--------------------- |:---- |:---------------------------------------- |:--------------------- |
| POST   | `/wishlist`           | Yes  | `{ bookId, notifyWhenAvailable? }`       | `WishlistItemEntity`  |
| GET    | `/wishlist/my`        | Yes  | —                                        | `WishlistItemEntity[]`|
| DELETE | `/wishlist/:bookId`   | Yes  | —                                        | `{ success: true }`   |

### Health

| Method | Endpoint    | Auth | Response                            |
|:------ |:----------- |:---- |:----------------------------------- |
| GET    | `/health`   | No   | `{ status: "healthy", timestamp }`  |

---

## 7. Demo Credentials & Roles

The institutional seed script (`npm run seed`) provisions the central library administrator account. Patrons register directly through the application's registration page (`/register`).

| Role       | Email                           | Password      | ID          | Loan Quota | Loan Period |
|:---------- |:------------------------------- |:------------- |:----------- |:----------:|:-----------:|
| Librarian  | `librarian@unilib.edu`          | `Admin123!`   | `LIB-002`   | 25 books   | 60 days     |
| Professor  | *(Self-registered at `/register`)*| *(Custom)*   | *(Custom)*  | 15 books   | 30 days     |
| Student    | *(Self-registered at `/register`)*| *(Custom)*   | *(Custom)*  | 5 books    | 14 days     |

> **Security Note:** Public registration of the `LIBRARIAN` role is blocked at both frontend and backend validation layers to prevent unauthorized elevation of privileges.

---

## 8. Database

The application uses **PostgreSQL** exclusively, managed through Sequelize ORM. Tables are automatically verified and synchronized on application bootstrap via `sequelize.sync()`. Set `DATABASE_URL` in `.env` to your PostgreSQL connection string.

### Domain Models

| Model           | Description                                               |
|:--------------- |:--------------------------------------------------------- |
| `User`          | Accounts with role (STUDENT, PROFESSOR, LIBRARIAN)        |
| `Book`          | Physical catalog entries linked to Open Library metadata  |
| `Loan`          | Active and historical book loans per user                 |
| `Reservation`   | Priority queue entries for fully-loaned books             |
| `ReadingRecord` | Personal reading status and progress tracking             |
| `WishlistItem`  | Saved books with optional availability alert flag         |

To inspect or query the database tables:
- Use standard PostgreSQL administration tools such as **pgAdmin 4**, **DBeaver**, or **DataGrip** connecting with the `DATABASE_URL`.
- Or connect via the command-line CLI:
  ```bash
  psql "postgresql://USER:PASSWORD@HOST:5432/unilib"
  ```
- To re-synchronize or re-seed default records at any time:
  ```bash
  npm run db:sync
  npm run seed
  ```

---

## 9. How Open Library Integration Works

The server uses Open Library's public API as a metadata source, not as the primary data store.

**Workflow:**
1. The frontend displays book information fetched directly from Open Library (`openlibrary.org`).
2. When a user performs an action (borrow, reserve, wishlist, reading record) on a book identified by its Open Library key (e.g. `/works/OL45883W`), the server receives that key.
3. If the book already exists in the local database, the existing record is used.
4. If not, the server calls `OpenLibraryClient.fetchBookByWorkKey()` to retrieve the book's metadata, creates a new `Book` record with default inventory (`totalCopies: 8`, `availableCopies: 8`, maximum 8 units per title), and then processes the user's action.

This keeps the catalog dynamic without requiring any pre-seeded book data.

---

## 10. Error Handling

All errors are handled by the global `errorHandler` middleware in `src/presentation/middlewares/errorHandler.ts`.

| Error Type             | HTTP Status | Triggered When                          |
|:---------------------- |:----------- |:--------------------------------------- |
| `NotFoundError`        | 404         | Resource not found in database          |
| `ConflictError`        | 409         | Duplicate entity (e.g. same email)      |
| `InvalidCredentialsError` | 401      | Wrong email or password                 |
| `ForbiddenError`       | 403         | Insufficient role permissions           |
| `ValidationError`      | 422         | Invalid or missing request fields       |
| `DomainError` (base)   | 400         | General business rule violation         |
| Unknown `Error`        | 500         | Unexpected server error                 |

Use cases `throw` domain errors. Controllers delegate to use cases via `asyncHandler` and never catch errors themselves. This ensures a clean, consistent error-response contract across all endpoints.

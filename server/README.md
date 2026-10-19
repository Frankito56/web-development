# UniLib API Server

RESTful backend API for the UniLib University Library Management System, built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM** following **Clean Architecture** principles.

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

```
┌─────────────────────────────────────────┐
│  Presentation (Express routes, controllers, middlewares)  │
├─────────────────────────────────────────┤
│  Application (Use cases, DTOs, service abstractions)      │
├─────────────────────────────────────────┤
│  Infrastructure (Prisma repos, JWT, Bcrypt, HTTP clients) │
├─────────────────────────────────────────┤
│  Domain (Entities, Repository ports, Domain errors)       │
└─────────────────────────────────────────┘
```

**Key principles applied:**
- **Domain layer** has zero framework dependencies — pure TypeScript interfaces and classes.
- **Application layer** encodes all business rules. Use cases throw domain errors; they contain no try/catch blocks.
- **Infrastructure layer** adapts external services (Prisma, bcrypt, JWT, Open Library API) to the domain ports.
- **Presentation layer** handles HTTP. Controllers are thin — they only parse requests and call use cases. No business logic lives here.
- **Global error middleware** catches all exceptions and maps domain errors to correct HTTP status codes. Controllers never handle errors directly.
- All strings in the codebase are in English. No `throw` statements in controllers.

---

## 2. Folder Structure

```
server/
├── prisma/
│   ├── schema.prisma        # Database schema (SQLite dev / PostgreSQL prod)
│   ├── seed.ts              # Seeds demo user accounts
│   └── unilib.db            # SQLite database file (generated)
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
│   │   │   └── prisma.ts            # Prisma client singleton
│   │   ├── external/
│   │   │   └── OpenLibraryClient.ts # Open Library API HTTP client
│   │   ├── repositories/            # Prisma repository implementations
│   │   │   ├── PrismaUserRepository.ts
│   │   │   ├── PrismaBookRepository.ts
│   │   │   ├── PrismaLoanRepository.ts
│   │   │   ├── PrismaReservationRepository.ts
│   │   │   ├── PrismaReadingRecordRepository.ts
│   │   │   └── PrismaWishlistRepository.ts
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
| Prisma ORM       | 6.x      | Database access and migrations       |
| SQLite           | —        | Development database (zero setup)    |
| PostgreSQL       | 15+      | Production database option           |
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

### Installation

```bash
# 1. Navigate to the server directory
cd server

# 2. Install all dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your configuration if needed

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database (creates SQLite file on first run)
npx prisma db push

# 6. Seed demo user accounts
npm run seed

# 7. Start the development server (hot-reload)
npm run dev
```

The server starts on **http://localhost:3000** by default.

### Available Scripts

| Script             | Description                                    |
|:------------------ |:---------------------------------------------- |
| `npm run dev`      | Start development server with hot-reload       |
| `npm run build`    | Compile TypeScript to `dist/`                  |
| `npm start`        | Run compiled production build                  |
| `npm run seed`     | Seed demo user accounts into the database      |
| `npm run lint`     | Run TypeScript type-check (`tsc --noEmit`)     |

---

## 5. Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database
# SQLite for development:
DATABASE_URL="file:./prisma/unilib.db"
# PostgreSQL for production:
# DATABASE_URL="postgresql://user:password@host:5432/unilib"

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
| POST   | `/auth/register` | No   | `{ email, password, name, role?, studentOrEmployeeId, department }` | `{ token, user }`          |
| POST   | `/auth/login`    | No   | `{ email, password }`                                           | `{ token, user }`          |
| GET    | `/auth/me`       | Yes  | —                                                               | `{ user }`                 |

### Books

| Method | Endpoint                    | Auth      | Query / Body                                                          | Response                            |
|:------ |:--------------------------- |:--------- |:--------------------------------------------------------------------- |:----------------------------------- |
| GET    | `/books`                    | No        | `?search=&subject=&page=1&limit=12`                                   | `{ books[], total, page, totalPages }` |
| GET    | `/books/:id`                | No        | —                                                                     | `BookEntity`                        |
| POST   | `/books/import`             | Librarian | `{ openLibraryKey, totalCopies?, shelfLocation? }`                    | `BookEntity`                        |
| PATCH  | `/books/:id/inventory`      | Librarian | `{ totalCopies?, shelfLocation? }`                                    | `BookEntity`                        |

### Loans

| Method | Endpoint                | Auth | Body / Params                       | Response          |
|:------ |:----------------------- |:---- |:----------------------------------- |:----------------- |
| POST   | `/loans`                | Yes  | `{ bookId }`                        | `LoanEntity`      |
| GET    | `/loans/my`             | Yes  | —                                   | `LoanEntity[]`    |
| PATCH  | `/loans/:id/return`     | Yes  | —                                   | `LoanEntity`      |
| PATCH  | `/loans/:id/renew`      | Yes  | —                                   | `LoanEntity`      |

### Reservations

| Method | Endpoint                        | Auth      | Body / Params  | Response              |
|:------ |:--------------------------------|:--------- |:-------------- |:--------------------- |
| POST   | `/reservations`                 | Yes       | `{ bookId }`   | `ReservationEntity`   |
| GET    | `/reservations/my`              | Yes       | —              | `ReservationEntity[]` |
| DELETE | `/reservations/:id`             | Yes       | —              | `ReservationEntity`   |
| PATCH  | `/reservations/:id/fulfill`     | Librarian | —              | `ReservationEntity`   |

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

## 7. Demo Credentials

| Role       | Email                           | Password      | ID          | Department           |
|:---------- |:------------------------------- |:------------- |:----------- |:-------------------- |
| Librarian  | `biblioteca@unilib.edu`         | `Admin123!`   | `LIB-001`   | Central Library      |
| Professor  | `profesor.garcia@unilib.edu`    | `Prof123!`    | `PROF-2024` | Software Engineering |
| Student    | `estudiante.franco@unilib.edu`  | `Student123!` | `EST-9901`  | Computer Science     |
| Student    | `estudiante.maria@unilib.edu`   | `Student123!` | `EST-9902`  | Systems Engineering  |

---

## 8. Database

The application uses **SQLite** in development (zero configuration) and supports **PostgreSQL** in production by changing the `DATABASE_URL` environment variable and the Prisma schema provider.

### Domain Models

| Model           | Description                                               |
|:--------------- |:--------------------------------------------------------- |
| `User`          | Accounts with role (STUDENT, PROFESSOR, LIBRARIAN)        |
| `Book`          | Physical catalog entries linked to Open Library metadata  |
| `Loan`          | Active and historical book loans per user                 |
| `Reservation`   | Priority queue entries for fully-loaned books             |
| `ReadingRecord` | Personal reading status and progress tracking             |
| `WishlistItem`  | Saved books with optional availability alert flag         |

To inspect the current database in a web UI:

```bash
npx prisma studio
```

---

## 9. How Open Library Integration Works

The server uses Open Library's public API as a metadata source, not as the primary data store.

**Workflow:**
1. The frontend displays book information fetched directly from Open Library (`openlibrary.org`).
2. When a user performs an action (borrow, reserve, wishlist, reading record) on a book identified by its Open Library key (e.g. `/works/OL45883W`), the server receives that key.
3. If the book already exists in the local database, the existing record is used.
4. If not, the server calls `OpenLibraryClient.fetchBookByWorkKey()` to retrieve the book's metadata, creates a new `Book` record with default inventory (`totalCopies: 1`, `availableCopies: 1`), and then processes the user's action.

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

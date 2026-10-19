# UniLib — University Library SPA

Production-ready Single Page Application (SPA) for a University Library Management System, built with **React 18**, **TypeScript**, **Vite**, and **Pure Modular CSS**. The frontend integrates with the Open Library public API for book catalog browsing and communicates with the UniLib backend REST API for all authenticated user actions.

---

## Table of Contents

1. [Features](#1-features)
2. [Architecture & Folder Structure](#2-architecture--folder-structure)
3. [Tech Stack & Styling](#3-tech-stack--styling)
4. [Setup & Running](#4-setup--running)
5. [Environment Variables](#5-environment-variables)
6. [Role-Based Access](#6-role-based-access)
7. [Security & Accessibility](#7-security--accessibility)

---

## 1. Features

### Academic Catalog & Live Search
- Real-time querying of the **Open Library API** (`https://openlibrary.org/search.json`) for millions of titles.
- **Debounced search** (300 ms) by title, author, subject, or ISBN with `/` keyboard shortcut.
- Subject category filter (Computer Science, Science & Physics, History, Literature, Philosophy, Mathematics, Arts).
- Multi-criteria sorting: Relevance, Title A–Z / Z–A, Newest / Oldest, Highest Rated.
- Native lazy-loading images with SVG fallback placeholders. Full pagination.

### Book Detail View (`/books/:id`)
- High-resolution cover, author list, publication metadata, subject chips, and description.
- Dynamic physical inventory badge: *Available*, *All Copies On Loan*, or *Reserved for Queue*.
- Inline reading tracker selector (*Want to Read*, *Reading*, *Completed*).

### Loan Management (`/my-loans`)
- **Borrow** books with automatic due-date calculation based on role.
- **Reserve** books when all copies are on loan — join the priority queue.
- Color-coded due-date badges (Safe / Alert / Overdue).
- **Return** and **Renew** loans directly from the dashboard.
- Full borrowing history.

### Reading Tracker (`/reading-tracker`)
- Track status across *Want to Read*, *Reading*, and *Completed*.
- Progress sliders (0%–100%) and personal study notes per book.

### Wishlist (`/wishlist`)
- Save books for future semesters.
- Toggle availability notifications.

### Authentication
- JWT-based login backed by the UniLib API server.
- Token persisted to `localStorage` and sent on every authenticated request.
- Protected routes redirect unauthenticated users to `/login`.

---

## 2. Architecture & Folder Structure

```
capstone/
├── .env                     # Local environment settings
├── .env.example             # Environment variable template
├── index.html               # Semantic HTML5 entry with Inter font (Google Fonts)
├── package.json
├── vite.config.ts           # Vite with @/ path alias
├── tsconfig.json            # Solution TypeScript config
├── tsconfig.app.json        # Strict application TS settings
├── tsconfig.node.json       # Node/Vite TS settings
└── src/
    ├── App.tsx              # Router with code splitting (React.lazy + Suspense)
    ├── main.tsx             # Entry point with context providers
    ├── index.css            # Design tokens, CSS variables, dark/light mode resets
    ├── vite-env.d.ts        # Client-side ImportMetaEnv declarations
    ├── config/
    │   └── index.ts         # App constants, role limits, category definitions
    ├── context/
    │   ├── AuthContext.tsx  # JWT auth state, login/logout, profile fetch
    │   ├── NotificationContext.tsx # In-app toast notifications
    │   └── ThemeContext.tsx # Persistent dark/light mode toggle
    ├── hooks/
    │   ├── useBooks.ts      # Open Library catalog fetching + filtering logic
    │   ├── useDebounce.ts   # Generic debounce hook
    │   ├── useLocalStorage.ts # Reactive localStorage hook
    │   └── usePagination.ts # Page bounds and slice calculation
    ├── services/
    │   ├── apiClient.ts          # Typed fetch wrapper for the backend REST API
    │   ├── loanService.ts        # Loan, return, renew, reserve domain logic
    │   ├── openLibraryService.ts # Open Library API integration
    │   ├── readingTrackerService.ts # Reading record management (localStorage cache)
    │   ├── storageService.ts     # Type-safe localStorage wrapper with listeners
    │   └── wishlistService.ts    # Wishlist management (localStorage cache)
    ├── types/
    │   └── index.ts         # Full domain type definitions (Book, User, Loan, etc.)
    ├── utils/
    │   ├── dateUtils.ts     # Due-date math, countdowns, badge variant mapping
    │   ├── sanitizer.ts     # Input sanitization and XSS prevention
    │   └── validators.ts    # Form validation helpers
    ├── components/
    │   ├── feedback/
    │   │   ├── EmptyState.tsx & EmptyState.css
    │   │   ├── ErrorBoundary.tsx & ErrorBoundary.css
    │   │   └── Toast.tsx & Toast.css
    │   ├── layout/
    │   │   ├── Footer.tsx & Footer.css
    │   │   ├── LayoutWrapper.tsx & LayoutWrapper.css
    │   │   └── Navbar.tsx & Navbar.css
    │   └── ui/
    │       ├── Badge.tsx & Badge.css
    │       ├── Button.tsx & Button.css
    │       ├── Input.tsx & Input.css
    │       ├── Modal.tsx & Modal.css
    │       └── Skeleton.tsx & Skeleton.css
    └── features/
        ├── auth/
        │   ├── auth.css
        │   ├── components/AuthGuard.tsx     # Protected route wrapper
        │   ├── pages/LoginPage.tsx          # Login with demo credentials
        │   └── pages/ProfilePage.tsx        # User profile and quota info
        ├── books/
        │   ├── components/BookCard.tsx & BookCard.css
        │   ├── components/BookFilters.tsx & BookFilters.css
        │   ├── components/ReadingTrackerDropdown.tsx & ReadingTrackerDropdown.css
        │   ├── components/SearchBar.tsx & SearchBar.css
        │   ├── pages/BookCatalogPage.tsx & BookCatalogPage.css
        │   └── pages/BookDetailPage.tsx & BookDetailPage.css
        ├── loans/
        │   ├── loans.css
        │   ├── components/ActiveLoansList.tsx
        │   ├── components/DueDateBadge.tsx
        │   ├── components/LoanHistoryList.tsx
        │   ├── components/ReservationsList.tsx
        │   └── pages/MyLoansPage.tsx
        ├── readingTracker/
        │   └── pages/ReadingTrackerPage.tsx & ReadingTrackerPage.css
        └── wishlist/
            └── pages/WishlistPage.tsx & WishlistPage.css
```

---

## 3. Tech Stack & Styling

| Tool                  | Purpose                                              |
|:--------------------- |:---------------------------------------------------- |
| **React 18**          | UI library with hooks and concurrent features        |
| **TypeScript** (strict) | Full static typing with `noUnusedLocals/Params`    |
| **Vite**              | Fast HMR, optimized production bundles, `@/` alias   |
| **React Router v6**   | Client-side routing with `React.lazy()` code splitting |
| **Pure Modular CSS**  | Zero Tailwind — CSS custom properties design system  |
| **Lucide React**      | Accessible SVG icon library                          |

### Design System

All styles are built on CSS custom properties defined in `src/index.css`:

- **Color tokens:** `--color-primary-*`, `--color-bg-*`, `--color-text-*`, `--color-border-*`
- **Spacing & Radius:** `--space-*`, `--radius-sm/md/lg/xl`
- **Shadows:** `--shadow-sm/md/lg`
- **Dark Mode:** All tokens switch via the `.dark` class on `<html>` — no JavaScript color values.

---

## 4. Setup & Running

### Prerequisites

- Node.js 18+ (22.x recommended)
- UniLib backend server running on port 3000

### Steps

```bash
# 1. Navigate to the capstone directory
cd capstone

# 2. Install dependencies
npm install

# 3. Configure environment (copy if needed)
cp .env.example .env
# Verify VITE_BACKEND_URL points to the running API server

# 4. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Available Scripts

| Script             | Description                                 |
|:------------------ |:------------------------------------------- |
| `npm run dev`      | Start Vite development server               |
| `npm run build`    | TypeScript check + production bundle        |
| `npm run preview`  | Serve the production bundle locally         |
| `npm run lint`     | Run ESLint across all TypeScript files      |

---

## 5. Environment Variables

```env
VITE_APP_NAME="UniLib - University Library Management System"
VITE_BOOK_API_BASE_URL="https://openlibrary.org"
VITE_MAX_LOAN_DAYS=14
VITE_BACKEND_URL="http://localhost:3000/api"
```

| Variable               | Description                                               |
|:---------------------- |:--------------------------------------------------------- |
| `VITE_APP_NAME`        | Display name used in the browser title                    |
| `VITE_BOOK_API_BASE_URL` | Base URL for Open Library API catalog requests          |
| `VITE_MAX_LOAN_DAYS`   | Default loan duration override (role limits take priority)|
| `VITE_BACKEND_URL`     | UniLib REST API base URL for authenticated requests       |

---

## 6. Role-Based Access

| Role          | Max Loans | Loan Days | Inventory Management |
|:------------- |:---------:|:---------:|:--------------------:|
| **Student**   | 5         | 14        | No                   |
| **Professor** | 15        | 30        | No                   |
| **Librarian** | 25        | 60        | Yes                  |

### Seeded Database Accounts

The backend seed script (`npm run prisma:seed` in `/server`) populates the database with test accounts for each institutional role:

| Role       | Email                           | Password      |
|:---------- |:------------------------------- |:------------- |
| Librarian  | `biblioteca@unilib.edu`         | `Admin123!`   |
| Professor  | `profesor.garcia@unilib.edu`    | `Prof123!`    |
| Student    | `estudiante.franco@unilib.edu`  | `Student123!` |
| Student    | `estudiante.maria@unilib.edu`   | `Student123!` |

---

## 7. Security & Accessibility

- **Input Sanitization:** All user inputs are processed through `sanitizeInput()` in `src/utils/sanitizer.ts` to neutralize HTML delimiters and prevent XSS.
- **Accessible Modals:** `Modal.tsx` implements `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trapping, body scroll lock, and `Escape` key dismissal.
- **Live Region Announcements:** Catalog search results announce match counts via `aria-live="polite"` for screen readers.
- **Keyboard Navigation:** Full `Tab` index cycling, visible focus rings, and `/` shortcut to jump to the search field.
- **WCAG AA Colors:** All text/background combinations in both light and dark themes meet minimum contrast ratios.
- **Error Boundary:** `ErrorBoundary.tsx` wraps the entire application to catch and display unrecoverable React render errors without crashing the full page.
- **JWT Security:** Tokens are stored in `localStorage` and attached as `Authorization: Bearer <token>` headers. The `apiClient` centralizes all authenticated requests.

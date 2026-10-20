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
- **Borrowing Workflow**: Institutional two-step lifecycle — initial requests enter `PENDING_PICKUP` status awaiting physical pickup at the campus desk.
- **Priority Reservations**: Place reservations when all 8 copies of a title are on loan.
- **Automated Queue Fulfillment**: When any copy is returned, the oldest waiting reservation is automatically converted into a `PENDING_PICKUP` loan, transitioning the reservation status to `FULFILLED`.
- **Status & Due-Date Badges**: Color-coded badges for *Pending Pickup*, *Delivered*, *Returned*, and *Overdue*.
- **Role Quota Enforcement**: Live enforcement of maximum simultaneous active loans (5 for Students, 15 for Professors).
- Full borrowing history with checkout and return timestamps.

### Librarian Circulation Desk (`/circulation`)
- **Restricted Staff Dashboard**: Accessible only to users authenticated with the `LIBRARIAN` role.
- **Unified Overview**: Real-time monitoring of all active loans, pending pickups, overdue items, and waiting reservation queues.
- **Fast Patron Search**: Live filtering by patron name, student/employee ID, department, or book title.
- **Desk Actions**:
  - **Deliver to Patron**: Instant handover action that transitions `PENDING_PICKUP` loans to active `DELIVERED` status.
  - **Check In Return**: Checks in returned physical copies and automatically satisfies waiting reservation queues.
  - **Queue Inspection**: Direct visibility of patrons in waiting queues with institutional email and department.

### Reading Tracker (`/reading-tracker`)
- Track reading progress across *Want to Read*, *Reading*, and *Completed*.
- Slider-based percentage tracking (0%–100%) and personal study notes per book.

### Wishlist (`/wishlist`)
- Save titles for upcoming academic terms.
- Availability notification alerts when physical copies return to library shelves.

### Authentication & Profiles (`/login`, `/register`, `/profile`)
- **Self-Registration**: Public registration for Students and Professors at `/register` (Librarian role restricted for security).
- **JWT Sessions**: Secure token-based authentication stored in `localStorage` with protected route guards.
- **Dynamic Profile**: Shows dynamic "Member since" tenure date, student/employee ID, department, and live quota progress bar.
- **In-Place Profile Editing**: Update name, department, or avatar photo via modal dialog.

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
    │   ├── AuthContext.tsx  # JWT auth state, login/register/logout, memoized actions
    │   ├── NotificationContext.tsx # In-app toast notifications with memoized handlers
    │   └── ThemeContext.tsx # Persistent dark/light mode toggle with memoized value
    ├── hooks/
    │   ├── useBooks.ts      # Open Library catalog fetching + filtering logic
    │   ├── useDebounce.ts   # Generic debounce hook
    │   ├── useLocalStorage.ts # Reactive localStorage hook
    │   └── usePagination.ts # Page bounds and slice calculation
    ├── services/
    │   ├── apiClient.ts          # Typed fetch wrapper for the backend REST API
    │   ├── loanService.ts        # Loan, return, deliver, reserve domain logic
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
        │   ├── pages/LoginPage.tsx          # Login with credentials
        │   ├── pages/RegisterPage.tsx       # Student/Professor account registration
        │   └── pages/ProfilePage.tsx        # User profile, tenure, quota progress
        ├── books/
        │   ├── components/BookCard.tsx & BookCard.css (React.memo)
        │   ├── components/BookFilters.tsx & BookFilters.css
        │   ├── components/ReadingTrackerDropdown.tsx & ReadingTrackerDropdown.css (React.memo)
        │   ├── components/SearchBar.tsx & SearchBar.css
        │   ├── pages/BookCatalogPage.tsx & BookCatalogPage.css
        │   └── pages/BookDetailPage.tsx & BookDetailPage.css
        ├── librarian/
        │   └── pages/CirculationPage.tsx & CirculationPage.css # Circulation Desk
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
├── tests/                   # Centralized Vitest unit & component test suite
│   ├── setup.ts             # Testing Library DOM matchers configuration
│   ├── components/
│   │   ├── Badge.test.tsx
│   │   ├── Button.test.tsx
│   │   └── SearchBar.test.tsx
│   └── utils/
│       ├── dateUtils.test.ts
│       ├── sanitizer.test.ts
│       └── validators.test.ts
```

---

## 3. Tech Stack & Styling

| Tool                  | Purpose                                              |
|:--------------------- |:---------------------------------------------------- |
| **React 18**          | UI library with hooks and concurrent features        |
| **TypeScript** (strict) | Full static typing with `noUnusedLocals/Params`    |
| **Vite**              | Fast HMR, optimized production bundles, `@/` alias   |
| **React Router v6**   | Client-side routing with `React.lazy()` code splitting |
| **Pure Modular CSS**  | CSS custom properties design system  |
| **Lucide React**      | Accessible SVG icon library                          |

### Design System

All styles are built on CSS custom properties defined in `src/index.css`:

- **Color tokens:** `--color-primary-*`, `--color-bg-*`, `--color-text-*`, `--color-border-*`
- **Spacing & Radius:** `--space-*`, `--radius-sm/md/lg/xl`
- **Shadows:** `--shadow-sm/md/lg`
- **Dark Mode:** All tokens switch via the `.dark` class on `<html>` — zero inline JavaScript color injection.

### Performance & Rendering Optimizations

- **`useMemo`:** Applied to complex computations including debounced catalog search filtering, category aggregations, multi-criteria sorting, and filtered circulation desk patron/loan lists.
- **`useCallback`:** All action dispatches and Context provider value objects (`AuthContext`, `ThemeContext`, `NotificationContext`) are stabilized. This guarantees that toggling between light and dark mode switches CSS classes smoothly without triggering component re-mounts or re-fetching backend APIs.
- **`React.memo`:** Wrapped frequently re-rendered UI components (such as `BookCard` and `ReadingTrackerDropdown`) to skip wasteful DOM reconciliation cycles when parent page states update.
- **Smooth Suspense Transitions:** Route-level code-splitting (`React.lazy`) backed by a lightweight, centered CSS circle spinner fallback instead of heavy, layout-shifting skeleton blocks.

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
| `npm test`         | Run Vitest unit & component test suite      |
| `npm run test:watch`| Run Vitest in interactive watch mode       |
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

| Role          | Max Loans | Loan Days | Inventory Management | Circulation Desk |
|:------------- |:---------:|:---------:|:--------------------:|:----------------:|
| **Student**   | 5         | 14        | No                   | No               |
| **Professor** | 15        | 30        | No                   | No               |
| **Librarian** | 25        | 60        | Yes                  | Yes              |

### Seeded Database Accounts & Testing

The backend database seed script (`npm run seed` in `/server`) provisions an institutional Librarian account. Students and Professors self-register through the frontend application at `/register` to test patron accounts and role quotas.

| Role       | Email                           | Password      | Description |
|:---------- |:------------------------------- |:------------- |:----------- |
| Librarian  | `librarian@unilib.edu`          | `Admin123!`   | Default institutional librarian with Circulation Desk access |
| Student / Professor | *(Self-register at `/register`)* | *(Custom)* | Patrons create their own accounts with respective loan quotas |

---

## 7. Security & Accessibility

- **Input Sanitization:** All user inputs are processed through `sanitizeInput()` in `src/utils/sanitizer.ts` to neutralize HTML delimiters and prevent XSS.
- **Error Boundary:** `ErrorBoundary.tsx` wraps the entire application to catch and display unrecoverable React render errors without crashing the full page.
- **JWT Security:** Tokens are stored in `localStorage` and attached as `Authorization: Bearer <token>` headers. The `apiClient` centralizes all authenticated requests.

# UniLib - University Library Management SPA

Production-ready, accessible, and fully functional Single Page Application (SPA) for a University Library Management System called **"UniLib"**, built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

---

## 1. Project Overview & Features

UniLib is designed for university students, professors, and library staff to manage scholarly books, academic loans, reservation queues, and reading trackers:

1. **Academic Catalog & Live Search:**
   - Real-time catalog querying with live integration to the public **Open Library API** (`https://openlibrary.org/search.json`), with resilient fallback to local academic repositories.
   - **Debounced search** (300ms) by title, author, subject, or ISBN with keyboard shortcut (`/` to focus).
   - Domain filtering by subject categories (*Computer Science, Science & Physics, History & Civilization, Literature & Poetry, Philosophy & Ethics, Mathematics, Arts*).
   - Multi-criteria sorting (Relevance, Title A-Z/Z-A, Newest/Oldest Publication, Highest Rated).
   - High-performance image handling with native lazy loading (`loading="lazy"`) and SVG fallback placeholders.
   - Full pagination controls with dynamic page calculation.

2. **Dedicated Book Details View (`/books/:id`):**
   - Detailed monograph view displaying high-resolution book cover, author list, publication metadata, subject chips, overview abstract, and physical campus shelf location.
   - Dynamic physical inventory badge: *"Available"*, *"All Copies On Loan"*, or *"Reserved for Queue"*.
   - Interactive reading tracker button (*"Want to Read"*, *"Currently Reading"*, *"Completed"*).

3. **Circulation & Loan Management System (`/my-loans`):**
   - **Borrow Books:** Calculates standard due dates (14 calendar days from checkout for students; 30 days for professors) and checks loan quotas.
   - **Reserve Books:** If all copies are loaned out, users can join the priority reservation queue.
   - **Color-Coded Due Date Badges:**
     - 🟢 **Green:** More than 3 days remaining.
     - 🟡 **Yellow (Alert):** Due in $\le 3$ days or due today.
     - 🔴 **Red (Overdue):** Past scheduled return deadline.
   - **Return Book:** Instant return action restoring physical inventory and moving the loan to the user's permanent **Borrowing History**.
   - **Queue Fulfillment:** When a reserved book is returned, the next user in the reservation queue is automatically notified and the book is held for 3 days.

4. **Academic Reading Tracker (`/reading-tracker`):**
   - Track progress across *Currently Reading*, *Want to Read*, and *Completed* literature.
   - Interactive progress percentage sliders (0% - 100%) and personal study notes.

5. **Wishlist & Local Availability Alerts (`/wishlist`):**
   - Bookmark academic titles for future semesters.
   - Integrated notification triggers: when any loaned copy of a wished book is returned to the library, an alert is automatically dispatched to the student.

6. **Role Simulation & University Authentication:**
   - Role-based UI views and quotas for **Student** (5 loans max, 14 days), **Professor** (15 loans max, 30 days), and **Librarian / Staff** (25 loans max, 60 days).
   - One-click account switcher for testing multiple user perspectives and privileges.
   - State reset utility to restore initial demo seeds at any time.

---

## 2. Clean Architecture & Folder Structure

```text
capstone/
├── .env                     # Local environment settings
├── .env.example             # Template environment variables
├── index.html               # Semantic HTML5 entry with Inter font
├── package.json             # Scripts & dependencies
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS theme with Dark Mode
├── tsconfig.json            # Solution TypeScript configuration
├── tsconfig.app.json        # Strict application TypeScript settings
├── tsconfig.node.json       # Node TypeScript configuration
├── vite.config.ts           # Vite bundler with @/ path alias
└── src/
    ├── App.tsx              # Router with code splitting (React.lazy + Suspense)
    ├── main.tsx             # Application entry point with providers
    ├── index.css            # Tailwind directives, animations & custom scrollbars
    ├── config/
    │   └── index.ts         # Constants, API endpoints, role limits & categories
    ├── context/
    │   ├── AuthContext.tsx  # Authentication and role simulation context
    │   ├── NotificationContext.tsx # In-app notification & toast dispatch
    │   └── ThemeContext.tsx # Persistent Dark / Light mode toggle
    ├── hooks/
    │   ├── useBooks.ts      # Catalog fetching, debouncing & filter logic
    │   ├── useDebounce.ts   # Generic debouncing hook
    │   ├── useLocalStorage.ts # Reactive local storage hook
    │   └── usePagination.ts # Slice and page bounds calculation hook
    ├── services/
    │   ├── loanService.ts   # Domain rules for loans, returns, and reservations
    │   ├── openLibraryService.ts # Real-time Open Library API integration
    │   ├── readingTrackerService.ts # Reading lists and progress updates
    │   ├── storageService.ts# Type-safe localStorage persistence wrapper
    │   └── wishlistService.ts # Wishlist and alert trigger management
    ├── types/
    │   └── index.ts         # Complete domain interfaces (Book, User, Loan, etc.)
    ├── utils/
    │   ├── dateUtils.ts     # Due date math, countdowns & badge variant mapping
    │   ├── mockData.ts      # Pre-seeded books, users, and active loans
    │   ├── sanitizer.ts    # Input sanitization and XSS prevention
    │   └── validators.ts   # Form input validation helpers
    ├── components/
    │   ├── feedback/
    │   │   ├── EmptyState.tsx # Empty state view
    │   │   ├── ErrorBoundary.tsx # React error boundary component
    │   │   └── Toast.tsx     # Animated toast popup container
    │   ├── layout/
    │   │   ├── Footer.tsx    # Academic library footer
    │   │   ├── LayoutWrapper.tsx # Shell container with Navbar & Outlet
    │   │   └── Navbar.tsx    # Header with role switcher, notifications & links
    │   └── ui/
    │       ├── Badge.tsx     # Accessible status badges
    │       ├── Button.tsx    # Polymorphic button with loading spinners
    │       ├── Input.tsx     # Accessible input with error and helper texts
    │       ├── Modal.tsx     # ARIA-compliant accessible modal dialog
    │       └── Skeleton.tsx  # Pulsing loaders for cards and tables
    └── features/
        ├── auth/
        │   ├── components/AuthGuard.tsx # Protected route wrapper
        │   ├── pages/LoginPage.tsx      # Authentication portal with test logins
        │   └── pages/ProfilePage.tsx    # User quota & reset tool view
        ├── books/
        │   ├── components/BookCard.tsx  # Grid card with lazy image and actions
        │   ├── components/BookFilters.tsx # Category pills, sorting & toggles
        │   ├── components/ReadingTrackerDropdown.tsx # Quick status dropdown
        │   ├── components/SearchBar.tsx # Debounced search input
        │   ├── pages/BookCatalogPage.tsx # Main catalog page
        │   └── pages/BookDetailPage.tsx # Dedicated book details page
        ├── loans/
        │   ├── components/ActiveLoansList.tsx # Active loans with countdowns
        │   ├── components/DueDateBadge.tsx    # Color-coded due date badge
        │   ├── components/LoanHistoryList.tsx # Past returned books table
        │   ├── components/ReservationsList.tsx # Queued reservation items
        │   └── pages/MyLoansPage.tsx          # Loan center dashboard
        ├── readingTracker/
        │   └── pages/ReadingTrackerPage.tsx   # Study reading tracker
        └── wishlist/
            └── pages/WishlistPage.tsx         # Wishlist with availability alerts
```

---

## 3. Tech Stack

* **React 18 / 19** with **TypeScript** (Strict mode enabled).
* **Vite** for fast HMR and optimized production bundles.
* **React Router DOM v6** with code splitting via `React.lazy()` and `<Suspense>`.
* **Tailwind CSS** with mobile-first breakpoints and native Dark Mode support (`class` strategy).
* **Lucide React** for clean and accessible UI iconography.
* **LocalStorage Persistence Engine** with automatic seed data and reactive in-app subscribers.

---

## 4. Setup & Running Instructions

### 1. Navigate to the Capstone Directory
```bash
cd capstone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Environment Configuration
The project includes pre-configured `.env` and `.env.example` files:
```env
VITE_APP_NAME="UniLib - University Library Management System"
VITE_BOOK_API_BASE_URL="https://openlibrary.org"
VITE_MAX_LOAN_DAYS=14
VITE_ENABLE_MOCK_DATA=true
```

### 4. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to the printed local address (typically `http://localhost:5173`).

### 5. Build for Production
```bash
npm run build
```
Generates a strictly-typed, minified production build in the `dist/` folder.

To preview the production build locally:
```bash
npm run preview
```

---

## 5. Security & Accessibility (a11y) Features

* **Input Sanitization:** User inputs are processed through `sanitizeInput()` in `src/utils/sanitizer.ts` to neutralize HTML delimiters and prevent XSS injection in query parameters and notes.
* **Accessible Modals (`role="dialog"`):** Modals in `src/components/ui/Modal.tsx` include focus management, `aria-modal="true"`, `aria-labelledby`, body scroll lock, and `Escape` key listeners.
* **Screen Reader Announcers (`aria-live="polite"`):** Live catalog search results provide real-time audio announcements of search status and match counts.
* **Keyboard Navigation:** Full support for `Tab` index cycling, active focus rings (`focus-visible:ring-2`), and quick keyboard focus (`/` key to jump to search).
* **High Contrast Colors:** Light and dark mode palettes meet WCAG AA standards for typography and interactive states.

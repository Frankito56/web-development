/**
 * UniLib - Application Root & Routing Configuration
 * Configures React Router v6 with code-splitting via React.lazy() and <Suspense>
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { Skeleton } from '@/components/ui/Skeleton';

// Code Splitting with React.lazy
const BookCatalogPage = lazy(() =>
  import('@/features/books/pages/BookCatalogPage').then((m) => ({ default: m.BookCatalogPage }))
);
const BookDetailPage = lazy(() =>
  import('@/features/books/pages/BookDetailPage').then((m) => ({ default: m.BookDetailPage }))
);
const MyLoansPage = lazy(() =>
  import('@/features/loans/pages/MyLoansPage').then((m) => ({ default: m.MyLoansPage }))
);
const ReadingTrackerPage = lazy(() =>
  import('@/features/readingTracker/pages/ReadingTrackerPage').then((m) => ({
    default: m.ReadingTrackerPage,
  }))
);
const WishlistPage = lazy(() =>
  import('@/features/wishlist/pages/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const ProfilePage = lazy(() =>
  import('@/features/auth/pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);

const PageLoadingFallback: React.FC = () => (
  <div className="w-full py-16 space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <Skeleton className="w-48 h-8 rounded-xl" />
      <Skeleton className="w-24 h-8 rounded-lg" />
    </div>
    <Skeleton className="w-full h-32 rounded-2xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-2xl" />
      ))}
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<LayoutWrapper />}>
              <Route index element={<BookCatalogPage />} />
              <Route path="books" element={<BookCatalogPage />} />
              <Route path="books/:id" element={<BookDetailPage />} />

              {/* Protected Routes */}
              <Route
                path="my-loans"
                element={
                  <AuthGuard>
                    <MyLoansPage />
                  </AuthGuard>
                }
              />
              <Route
                path="reading-tracker"
                element={
                  <AuthGuard>
                    <ReadingTrackerPage />
                  </AuthGuard>
                }
              />
              <Route
                path="wishlist"
                element={
                  <AuthGuard>
                    <WishlistPage />
                  </AuthGuard>
                }
              />
              <Route
                path="profile"
                element={
                  <AuthGuard>
                    <ProfilePage />
                  </AuthGuard>
                }
              />

              {/* Auth Route */}
              <Route path="login" element={<LoginPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/books" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;

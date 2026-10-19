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
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ProfilePage = lazy(() =>
  import('@/features/auth/pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);

const PageLoadingFallback: React.FC = () => (
  <div style={{ width: '100%', padding: '4rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton style={{ width: '12rem', height: '2rem', borderRadius: 'var(--radius-md)' }} />
      <Skeleton style={{ width: '6rem', height: '2rem', borderRadius: 'var(--radius-md)' }} />
    </div>
    <Skeleton style={{ width: '100%', height: '8rem', borderRadius: 'var(--radius-lg)' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} style={{ height: '16rem', borderRadius: 'var(--radius-lg)' }} />
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

              {/* Auth Routes */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

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

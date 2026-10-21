import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';

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
const CirculationPage = lazy(() =>
  import('@/features/librarian/pages/CirculationPage').then((m) => ({ default: m.CirculationPage }))
);

const PageLoadingFallback: React.FC = () => (
  <div className="unilib-page-spinner">
    <div className="unilib-page-spinner__circle" />
  </div>
);

const LibrarianRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'LIBRARIAN') {
    return <Navigate to="/circulation" replace />;
  }
  return <>{children}</>;
};

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

              <Route
                path="my-loans"
                element={
                  <AuthGuard>
                    <LibrarianRedirect>
                      <MyLoansPage />
                    </LibrarianRedirect>
                  </AuthGuard>
                }
              />
              <Route
                path="reading-tracker"
                element={
                  <AuthGuard>
                    <LibrarianRedirect>
                      <ReadingTrackerPage />
                    </LibrarianRedirect>
                  </AuthGuard>
                }
              />
              <Route
                path="wishlist"
                element={
                  <AuthGuard>
                    <LibrarianRedirect>
                      <WishlistPage />
                    </LibrarianRedirect>
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

              <Route
                path="circulation"
                element={
                  <AuthGuard requiredRole="LIBRARIAN">
                    <CirculationPage />
                  </AuthGuard>
                }
              />

              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

              <Route path="*" element={<Navigate to="/books" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;

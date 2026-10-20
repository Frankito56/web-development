import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Book } from '@/types';
import { OpenLibraryService } from '@/services/openLibraryService';
import { StorageService } from '@/services/storageService';
import { LoanService } from '@/services/loanService';
import { WishlistService } from '@/services/wishlistService';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookDetailCover } from '../components/BookDetailCover';
import { BookDetailInfo } from '../components/BookDetailInfo';
import { BookDetailActions } from '../components/BookDetailActions';
import { BorrowBookModal } from '../components/BorrowBookModal';
import { ReserveBookModal } from '../components/ReserveBookModal';
import { calculateDueDate } from '@/utils/dateUtils';
import { ROLE_LIMITS } from '@/config';
import { ArrowLeft, BookOpen } from 'lucide-react';
import './BookDetailPage.css';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    if (user?.id) {
      WishlistService.fetchUserWishlist(user.id).catch(() => {});
      LoanService.fetchUserReservations(user.id).catch(() => {});
    }

    OpenLibraryService.getBookById(id)
      .then((data) => {
        setBook(data);
        if (data && user) {
          setInWishlist(WishlistService.isInWishlist(user.id, data.id, data.title));
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, user]);

  const [, setStorageTick] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setStorageTick((t) => t + 1);
      if (!id) return;
      const cleanId = id.replace(/^\/?works\//, '');
      const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);
      const matched = localBooks.find((b) => {
        const cleanBId = b.id.replace(/^\/?works\//, '');
        return b.id === id || cleanBId === cleanId;
      });
      if (matched) {
        setBook(matched);
      }
      const targetBook = matched || book;
      if (targetBook && user) {
        setInWishlist(WishlistService.isInWishlist(user.id, targetBook.id, targetBook.title));
      }
    };

    const unsubscribe = StorageService.subscribe(handleStorageChange);
    return () => unsubscribe();
  }, [id, book, user]);

  const handleToggleWishlist = () => {
    if (!user || !book) {
      showToast('Authentication Required', 'Please sign in to save books to your wishlist.', 'WARNING');
      return;
    }

    if (inWishlist) {
      WishlistService.removeFromWishlist(user.id, book.id, book.title);
      setInWishlist(false);
      showToast('Wishlist', `Removed "${book.title}" from wishlist.`, 'INFO');
    } else {
      WishlistService.addToWishlist(user.id, book, true);
      setInWishlist(true);
      showToast('Wishlist', `Added "${book.title}" to wishlist with availability alert.`, 'SUCCESS');
    }
  };

  const handleConfirmBorrow = async () => {
    if (!book || !user) return;
    setActionLoading(true);

    const result = await LoanService.borrowBook(book, user);
    setActionLoading(false);
    setIsBorrowModalOpen(false);

    if (result.success) {
      showToast('Borrow Successful', result.message, 'SUCCESS');
    } else {
      showToast('Cannot Borrow', result.message, 'ERROR');
    }
  };

  const handleConfirmReserve = async () => {
    if (!book || !user) return;
    setActionLoading(true);

    const result = await LoanService.reserveBook(book, user);
    setActionLoading(false);
    setIsReserveModalOpen(false);

    if (result.success) {
      showToast('Reservation Placed', result.message, 'SUCCESS');
    } else {
      showToast('Cannot Reserve', result.message, 'ERROR');
    }
  };

  if (isLoading) {
    return (
      <div className="unilib-detail-container">
        <Skeleton className="unilib-detail-skeleton-back" />
        <div className="unilib-detail-layout">
          <Skeleton className="unilib-detail-skeleton-cover" />
          <div className="unilib-detail-skeleton-content">
            <Skeleton className="unilib-detail-skeleton-title" />
            <Skeleton className="unilib-detail-skeleton-subtitle" />
            <Skeleton className="unilib-detail-skeleton-desc" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="unilib-detail-notfound">
        <BookOpen size={48} color="var(--color-text-subtle)" className="unilib-detail-notfound-icon" />
        <h2 className="unilib-detail-notfound-title">
          Book record not found in university catalog
        </h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/books')}>
          Return to Catalog
        </Button>
      </div>
    );
  }

  const isAvailable = book.availabilityStatus === 'AVAILABLE' && book.availableCopies > 0;
  const isOnLoan = book.availabilityStatus === 'ON_LOAN' || book.availableCopies === 0;
  const loanDays = user ? ROLE_LIMITS[user.role]?.maxLoanDays || 14 : 14;
  const dueDate = calculateDueDate(new Date(), loanDays);
  const alreadyBorrowed = user ? LoanService.isBookBorrowedByUser(user.id, book.id) : false;
  const alreadyReserved = user ? LoanService.isBookReservedByUser(user.id, book.id, book.title) : false;

  return (
    <div className="unilib-detail-container animate-fade-in">
      <nav aria-label="Breadcrumb">
        <Link to="/books" className="unilib-back-link">
          <ArrowLeft size={16} />
          <span>Back to Academic Catalog</span>
        </Link>
      </nav>

      <div className="unilib-detail-layout">
        <BookDetailCover
          book={book}
          inWishlist={inWishlist}
          alreadyBorrowed={alreadyBorrowed}
          alreadyReserved={alreadyReserved}
          isAvailable={isAvailable}
          isOnLoan={isOnLoan}
          onToggleWishlist={handleToggleWishlist}
        />

        <div className="unilib-detail-right">
          <BookDetailInfo book={book} />

          <BookDetailActions
            alreadyBorrowed={alreadyBorrowed}
            alreadyReserved={alreadyReserved}
            isAvailable={isAvailable}
            loanDays={loanDays}
            dueDate={dueDate}
            onOpenBorrowModal={() => setIsBorrowModalOpen(true)}
            onOpenReserveModal={() => setIsReserveModalOpen(true)}
          />
        </div>
      </div>

      <BorrowBookModal
        isOpen={isBorrowModalOpen}
        book={book}
        user={user}
        loanDays={loanDays}
        dueDate={dueDate}
        actionLoading={actionLoading}
        onClose={() => setIsBorrowModalOpen(false)}
        onConfirm={handleConfirmBorrow}
      />

      <ReserveBookModal
        isOpen={isReserveModalOpen}
        book={book}
        actionLoading={actionLoading}
        onClose={() => setIsReserveModalOpen(false)}
        onConfirm={handleConfirmReserve}
      />
    </div>
  );
};

/**
 * UniLib - BookDetailPage Component
 * Detailed view for an individual book with metadata, availability status, reading tracker, and loan actions.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Book } from '@/types';
import { OpenLibraryService } from '@/services/openLibraryService';
import { StorageService } from '@/services/storageService';
import { LoanService } from '@/services/loanService';
import { WishlistService } from '@/services/wishlistService';
import { ReadingTrackerService } from '@/services/readingTrackerService';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { ReadingTrackerDropdown } from '../components/ReadingTrackerDropdown';
import { calculateDueDate, formatDate } from '@/utils/dateUtils';
import { ROLE_LIMITS } from '@/config';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Building,
  Hash,
  MapPin,
  Star,
  Heart,
  Share2,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

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

    OpenLibraryService.getBookById(id)
      .then((data) => {
        setBook(data);
        if (data && user) {
          setInWishlist(WishlistService.isInWishlist(user.id, data.id));
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, user]);

  // Sync with storage for instant availability updates
  useEffect(() => {
    const handleStorageChange = () => {
      if (!id) return;
      const localBooks = StorageService.getItem<Book[]>(StorageService.KEYS.BOOKS, []);
      const matched = localBooks.find((b) => b.id === id);
      if (matched) {
        setBook(matched);
      }
    };

    const unsubscribe = StorageService.subscribe(handleStorageChange);
    return () => unsubscribe();
  }, [id]);

  const handleToggleWishlist = () => {
    if (!user || !book) {
      showToast('Authentication Required', 'Please sign in to save books to your wishlist.', 'WARNING');
      return;
    }

    if (inWishlist) {
      WishlistService.removeFromWishlist(user.id, book.id);
      setInWishlist(false);
      showToast('Wishlist', `Removed "${book.title}" from wishlist.`, 'INFO');
    } else {
      WishlistService.addToWishlist(user.id, book, true);
      setInWishlist(true);
      showToast('Wishlist', `Added "${book.title}" to wishlist with availability alert.`, 'SUCCESS');
    }
  };

  const handleConfirmBorrow = () => {
    if (!book || !user) return;
    setActionLoading(true);

    const result = LoanService.borrowBook(book, user);
    setActionLoading(false);
    setIsBorrowModalOpen(false);

    if (result.success) {
      showToast('Borrow Successful', result.message, 'SUCCESS');
    } else {
      showToast('Cannot Borrow', result.message, 'ERROR');
    }
  };

  const handleConfirmReserve = () => {
    if (!book || !user) return;
    setActionLoading(true);

    const result = LoanService.reserveBook(book, user);
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
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <Skeleton className="w-32 h-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-96 rounded-2xl" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="w-3/4 h-10" />
            <Skeleton className="w-1/2 h-6" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-16 space-y-4">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Breadcrumb back navigation */}
      <nav aria-label="Breadcrumb">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Academic Catalog</span>
        </Link>
      </nav>

      {/* Main Book Detail Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Cover Column */}
        <div className="md:col-span-4 space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-book flex items-center justify-center">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={`Cover for ${book.title}`}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="p-8 text-center text-slate-400">
                <BookOpen className="w-16 h-16 mx-auto mb-2 opacity-60" />
                <span className="text-xs font-bold uppercase tracking-wider">{book.title}</span>
              </div>
            )}

            {/* Availability Floating Badge */}
            <div className="absolute top-4 left-4">
              {isAvailable ? (
                <Badge variant="available">Available ({book.availableCopies} in stock)</Badge>
              ) : isOnLoan ? (
                <Badge variant="on_loan">All Copies On Loan</Badge>
              ) : (
                <Badge variant="reserved">Reserved for Queue</Badge>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Reading Status</span>
              <ReadingTrackerDropdown book={book} />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Button
                variant={inWishlist ? 'danger' : 'outline'}
                size="sm"
                leftIcon={<Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />}
                onClick={handleToggleWishlist}
                className="w-full"
              >
                {inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="md:col-span-8 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {book.subjects.slice(0, 4).map((sub, i) => (
                <span
                  key={i}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-900"
                >
                  {sub}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
              {book.title}
            </h1>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              By <span className="font-bold text-slate-800 dark:text-slate-200">{book.authors.join(', ')}</span>
            </p>
          </div>

          {/* Rating & Availability Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Campus Shelf</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                {book.locationShelf || 'Circulation Desk'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">First Published</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {book.firstPublishYear || 'Classical Edition'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Rating Score</span>
              <span className="font-bold text-amber-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                {book.averageRating || '4.5'} / 5.0
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Overview & Abstract
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {book.description || 'Academic catalog summary currently in preparation.'}
            </p>
          </div>

          {/* Publishing Metadata Details */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Bibliographic Information
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Publisher</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {book.publisher || 'University Press'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">ISBN</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {book.isbn || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Length</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {book.pageCount ? `${book.pageCount} pages` : 'Standard monograph'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            {isAvailable ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsBorrowModalOpen(true)}
                className="w-full sm:w-auto px-8"
              >
                Borrow Book Now ({loanDays} Days)
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsReserveModalOpen(true)}
                className="w-full sm:w-auto px-8"
              >
                Reserve Next Available Copy
              </Button>
            )}

            <p className="text-[11px] text-slate-400">
              {isAvailable
                ? `Free checkout for enrolled students & faculty. Due on ${formatDate(dueDate)}.`
                : 'All copies checked out. Reservation queue notifies you immediately upon return.'}
            </p>
          </div>
        </div>
      </div>

      {/* Borrow Modal */}
      <Modal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        title="Confirm Book Checkout"
        description="Verify borrowing details for this academic title."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Title:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{book.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duration:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{loanDays} Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Due Date:</span>
              <span className="font-bold text-primary-600 dark:text-primary-400">{formatDate(dueDate)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsBorrowModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={actionLoading} onClick={handleConfirmBorrow}>
              Confirm Borrow
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reserve Modal */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        title="Place Reservation Queue"
        description="Queue for the next physical copy returned."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            When another patron returns "{book.title}", the library circulation desk will hold the copy under your name for 3 days.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsReserveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" isLoading={actionLoading} onClick={handleConfirmReserve}>
              Join Queue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

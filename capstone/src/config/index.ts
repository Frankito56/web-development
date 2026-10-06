/**
 * UniLib - Application Configuration & Constants
 */

export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'UniLib - University Library Management System',
  API_BASE_URL: import.meta.env.VITE_BOOK_API_BASE_URL || 'https://openlibrary.org',
  MAX_LOAN_DAYS: Number(import.meta.env.VITE_MAX_LOAN_DAYS) || 14,
  MAX_RENEWS_ALLOWED: 2,
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || true,
  STORAGE_PREFIX: 'unilib_v1_',
  DEFAULT_PAGE_SIZE: 12,
  SEARCH_DEBOUNCE_MS: 300,
};

export const CATEGORIES = [
  { id: 'all', name: 'All Subjects', query: '' },
  { id: 'computer_science', name: 'Computer Science', query: 'computer science algorithms software programming' },
  { id: 'science', name: 'Science & Physics', query: 'science physics chemistry astronomy' },
  { id: 'history', name: 'History & Civilization', query: 'world history civilization archaeology' },
  { id: 'literature', name: 'Literature & Poetry', query: 'classic literature fiction novels' },
  { id: 'philosophy', name: 'Philosophy & Ethics', query: 'philosophy logic ethics epistemology' },
  { id: 'mathematics', name: 'Mathematics', query: 'mathematics calculus algebra statistics' },
  { id: 'arts', name: 'Arts & Architecture', query: 'arts design architecture art history' },
] as const;

export const ROLE_LIMITS = {
  STUDENT: {
    maxLoans: 5,
    maxLoanDays: 14,
    canManageInventory: false,
    label: 'Student',
  },
  PROFESSOR: {
    maxLoans: 15,
    maxLoanDays: 30,
    canManageInventory: false,
    label: 'Professor / Researcher',
  },
  LIBRARIAN: {
    maxLoans: 25,
    maxLoanDays: 60,
    canManageInventory: true,
    label: 'Library Staff / Administrator',
  },
} as const;

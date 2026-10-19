import { UserRole } from '@/types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentOrEmployeeId: string;
  department: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export interface ApiBook {
  id: string;
  openLibraryKey?: string;
  isbn?: string;
  title: string;
  authors: string[];
  publishYear?: number;
  coverUrl?: string;
  description?: string;
  subjects: string[];
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  availabilityStatus: 'AVAILABLE' | 'ON_LOAN' | 'RESERVED';
}

export interface ApiLoan {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  renewCount: number;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  notes?: string;
}

export interface ApiReservation {
  id: string;
  bookId: string;
  userId: string;
  reservedAt: string;
  status: 'WAITING' | 'READY_FOR_PICKUP' | 'FULFILLED' | 'CANCELLED';
  priorityOrder: number;
}

export interface ApiReadingRecord {
  id: string;
  userId: string;
  bookId: string;
  status: 'WANT_TO_READ' | 'READING' | 'COMPLETED';
  progressPercentage: number;
  notes?: string;
  updatedAt: string;
}

export interface ApiWishlistItem {
  id: string;
  userId: string;
  bookId: string;
  addedAt: string;
  notifyWhenAvailable: boolean;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('unilib_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('unilib_token', token);
    } else {
      localStorage.removeItem('unilib_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return (data.data !== undefined ? data.data : data) as T;
  }

  auth = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
      const res = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(res.token);
      return res;
    },
    register: async (userData: {
      email: string;
      password: string;
      name: string;
      role?: UserRole;
      studentOrEmployeeId: string;
      department: string;
      avatarUrl?: string;
    }): Promise<AuthResponse> => {
      const res = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      this.setToken(res.token);
      return res;
    },
    getProfile: async (): Promise<ApiUser> => {
      return this.request<ApiUser>('/auth/me');
    },
    updateProfile: async (data: { name?: string; department?: string; avatarUrl?: string }): Promise<ApiUser> => {
      return this.request<ApiUser>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    logout: () => {
      this.setToken(null);
    },
  };

  books = {
    getAll: async (params?: { search?: string; subject?: string; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.subject) query.set('subject', params.subject);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      return this.request<{ books: ApiBook[]; total: number; page: number; limit: number; totalPages: number }>(
        `/books?${query.toString()}`
      );
    },
    getById: async (id: string): Promise<ApiBook> => {
      return this.request<ApiBook>(`/books/${id}`);
    },
    import: async (openLibraryKey: string, totalCopies = 2): Promise<ApiBook> => {
      return this.request<ApiBook>('/books/import', {
        method: 'POST',
        body: JSON.stringify({ openLibraryKey, totalCopies }),
      });
    },
  };

  loans = {
    getMyLoans: async (): Promise<ApiLoan[]> => {
      return this.request<ApiLoan[]>('/loans/my');
    },
    borrow: async (bookId: string): Promise<ApiLoan> => {
      return this.request<ApiLoan>('/loans', {
        method: 'POST',
        body: JSON.stringify({ bookId }),
      });
    },
    renew: async (loanId: string): Promise<ApiLoan> => {
      return this.request<ApiLoan>(`/loans/${loanId}/renew`, {
        method: 'PATCH',
      });
    },
    returnLoan: async (loanId: string): Promise<ApiLoan> => {
      return this.request<ApiLoan>(`/loans/${loanId}/return`, {
        method: 'PATCH',
      });
    },
  };

  reservations = {
    getMyReservations: async (): Promise<ApiReservation[]> => {
      return this.request<ApiReservation[]>('/reservations/my');
    },
    create: async (bookId: string): Promise<ApiReservation> => {
      return this.request<ApiReservation>('/reservations', {
        method: 'POST',
        body: JSON.stringify({ bookId }),
      });
    },
    cancel: async (id: string): Promise<ApiReservation> => {
      return this.request<ApiReservation>(`/reservations/${id}`, {
        method: 'DELETE',
      });
    },
  };

  readingRecords = {
    getMyRecords: async (): Promise<ApiReadingRecord[]> => {
      return this.request<ApiReadingRecord[]>('/reading-records/my');
    },
    upsert: async (record: {
      bookId: string;
      status: 'WANT_TO_READ' | 'READING' | 'COMPLETED';
      progressPercentage?: number;
      notes?: string;
    }): Promise<ApiReadingRecord> => {
      return this.request<ApiReadingRecord>('/reading-records', {
        method: 'PUT',
        body: JSON.stringify(record),
      });
    },
    delete: async (bookId: string): Promise<void> => {
      await this.request<void>(`/reading-records/${bookId}`, {
        method: 'DELETE',
      });
    },
  };

  wishlist = {
    getMyWishlist: async (): Promise<ApiWishlistItem[]> => {
      return this.request<ApiWishlistItem[]>('/wishlist/my');
    },
    add: async (bookId: string, notifyWhenAvailable = true): Promise<ApiWishlistItem> => {
      return this.request<ApiWishlistItem>('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ bookId, notifyWhenAvailable }),
      });
    },
    remove: async (bookId: string): Promise<void> => {
      await this.request<void>(`/wishlist/${bookId}`, {
        method: 'DELETE',
      });
    },
  };
}

export const apiClient = new ApiClient();

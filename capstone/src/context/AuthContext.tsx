import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { apiClient } from '@/services/apiClient';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  studentOrEmployeeId: string;
  department: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { name?: string; department?: string; avatarUrl?: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = apiClient.getToken();
    if (!token) return null;
    try {
      const saved = localStorage.getItem('unilib_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = apiClient.getToken();
    const saved = localStorage.getItem('unilib_user');
    return !!token && !saved;
  });

  const persistUser = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('unilib_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('unilib_user');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await apiClient.auth.getProfile();
        persistUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          studentOrEmployeeId: profile.studentOrEmployeeId,
          department: profile.department,
          avatarUrl: profile.avatarUrl || '/placeholder-avatar.svg',
          maxBorrowLimit: profile.role === 'LIBRARIAN' ? 25 : profile.role === 'PROFESSOR' ? 15 : 5,
          joinedDate: profile.createdAt ? String(profile.createdAt) : new Date().toISOString(),
        });
      } catch {
        apiClient.auth.logout();
        persistUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.auth.login(email, password);
      persistUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        studentOrEmployeeId: res.user.studentOrEmployeeId,
        department: res.user.department,
        avatarUrl: res.user.avatarUrl || '/placeholder-avatar.svg',
        maxBorrowLimit: res.user.role === 'LIBRARIAN' ? 25 : res.user.role === 'PROFESSOR' ? 15 : 5,
        joinedDate: res.user.createdAt ? String(res.user.createdAt) : new Date().toISOString(),
      });
      return true;
    } catch {
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.auth.register(userData);
      persistUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        studentOrEmployeeId: res.user.studentOrEmployeeId,
        department: res.user.department,
        avatarUrl: res.user.avatarUrl || '/placeholder-avatar.svg',
        maxBorrowLimit: res.user.role === 'LIBRARIAN' ? 25 : res.user.role === 'PROFESSOR' ? 15 : 5,
        joinedDate: res.user.createdAt ? String(res.user.createdAt) : new Date().toISOString(),
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const updateProfile = async (data: { name?: string; department?: string; avatarUrl?: string }): Promise<boolean> => {
    try {
      const updated = await apiClient.auth.updateProfile(data);
      const updatedUser: User | null = user
        ? {
            ...user,
            name: updated.name,
            department: updated.department,
            avatarUrl: updated.avatarUrl || '/placeholder-avatar.svg',
          }
        : null;
      persistUser(updatedUser);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    apiClient.auth.logout();
    persistUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        register,
        updateProfile,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

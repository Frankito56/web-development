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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await apiClient.auth.getProfile();
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          studentOrEmployeeId: profile.studentOrEmployeeId,
          department: profile.department,
          avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          maxBorrowLimit: profile.role === 'LIBRARIAN' ? 25 : profile.role === 'PROFESSOR' ? 15 : 5,
          joinedDate: '2024-01-01',
        });
      } catch {
        apiClient.auth.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.auth.login(email, password);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        studentOrEmployeeId: res.user.studentOrEmployeeId,
        department: res.user.department,
        avatarUrl: res.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        maxBorrowLimit: res.user.role === 'LIBRARIAN' ? 25 : res.user.role === 'PROFESSOR' ? 15 : 5,
        joinedDate: '2024-01-01',
      });
      return true;
    } catch {
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiClient.auth.register(userData);
      setUser({
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        role: res.user.role,
        studentOrEmployeeId: res.user.studentOrEmployeeId,
        department: res.user.department,
        avatarUrl: res.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        maxBorrowLimit: res.user.role === 'LIBRARIAN' ? 25 : res.user.role === 'PROFESSOR' ? 15 : 5,
        joinedDate: '2024-01-01',
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    apiClient.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        register,
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

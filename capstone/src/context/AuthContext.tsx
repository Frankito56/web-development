/**
 * UniLib - Authentication Context
 * Simulates university authentication with role-based UI access (Student, Professor, Librarian)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { StorageService } from '@/services/storageService';
import { INITIAL_USERS } from '@/utils/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  allDemoUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    return StorageService.getItem<User | null>(StorageService.KEYS.CURRENT_USER, INITIAL_USERS[0]);
  });

  const [allDemoUsers] = useState<User[]>(INITIAL_USERS);

  useEffect(() => {
    if (user) {
      StorageService.setItem(StorageService.KEYS.CURRENT_USER, user);
    } else {
      StorageService.removeItem(StorageService.KEYS.CURRENT_USER);
    }
  }, [user]);

  const login = (email: string, role?: UserRole): boolean => {
    // Find matching user from mock users or assign selected role
    const matched = allDemoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      return true;
    }

    if (role) {
      const template = allDemoUsers.find((u) => u.role === role) || allDemoUsers[0];
      const customUser: User = {
        ...template,
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0].replace('.', ' '),
        role,
      };
      setUser(customUser);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const targetUser = allDemoUsers.find((u) => u.role === newRole) || {
      ...allDemoUsers[0],
      role: newRole,
    };
    setUser(targetUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || null,
        login,
        logout,
        switchRole,
        allDemoUsers,
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

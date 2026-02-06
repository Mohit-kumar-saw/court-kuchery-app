import React, { createContext, useCallback, useContext, useState } from 'react';

import { authService } from '@/services';
import type { User } from '@/types';

type AuthContextType = {
  hasCompletedSplash: boolean;
  completeSplash: () => void;
  user: User | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string) => Promise<void>;
  signUp: (name: string, phone: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedSplash, setHasCompletedSplash] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const completeSplash = useCallback(() => setHasCompletedSplash(true), []);
  const isLoggedIn = !!user;

  const login = useCallback(async (phone: string, password: string) => {
    const loggedInUser = await authService.login({ phone, password });
    setUser(loggedInUser);
  }, []);

  const signUp = useCallback(
    async (name: string, phone: string, email: string, password?: string) => {
      const newUser = await authService.signUp({
        name,
        phone,
        email,
        password: password ?? '',
      });
      setUser(newUser);
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        hasCompletedSplash,
        completeSplash,
        user,
        isLoggedIn,
        login,
        signUp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

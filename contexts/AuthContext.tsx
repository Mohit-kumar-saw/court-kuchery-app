import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { authService } from "@/services/auth.service";
import { tokenStorage } from "@/services/tokenStorage";
import type { User } from "@/types";

type AuthContextType = {
  hasCompletedSplash: boolean;
  completeSplash: () => void;
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, phone:string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedSplash, setHasCompletedSplash] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const isLoggedIn = !!user;

  /* =============================
     RESTORE SESSION
  ============================== */
  useEffect(() => {
    const restoreSession = async () => {
      const token = await tokenStorage.getAccessToken();

      if (token) {
        // OPTIONAL:
        // Later create GET /auth/me to fetch user
        // For now just assume logged in
      }
    };

    restoreSession();
  }, []);

  /* =============================
     SPLASH
  ============================== */
  const completeSplash = useCallback(() => {
    setHasCompletedSplash(true);
  }, []);

  /* =============================
     LOGIN
  ============================== */
  const login = useCallback(async (email: string, password: string) => {
    const user = await authService.login({ email, password });

    setUser(user);
  }, []);

  /* =============================
     SIGN UP
  ============================== */
  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const user = await authService.signUp({
        name,
        email,
        password,
      });

      setUser(user);
    },
    []
  );

  /* =============================
     LOGOUT
  ============================== */
  const logout = useCallback(async () => {
    await authService.logout();
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

/* =============================
   HOOK
============================= */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

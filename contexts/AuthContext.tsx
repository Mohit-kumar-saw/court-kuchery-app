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
  signUp: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  activeSessionId: string | null;
  activeLawyerId: string | null;
  trackActiveSession: (sessionId: string, lawyerId: string) => Promise<void>;
  clearActiveSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hasCompletedSplash, setHasCompletedSplash] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeLawyerId, setActiveLawyerId] = useState<string | null>(null);

  const isLoggedIn = !!user;

  const SESSION_ID_KEY = "active_session_data";

  const trackActiveSession = useCallback(async (sessionId: string, lawyerId: string) => {
    setActiveSessionId(sessionId);
    setActiveLawyerId(lawyerId);
    await tokenStorage.setActiveSessionData(JSON.stringify({ sessionId, lawyerId }));
  }, []);

  const clearActiveSession = useCallback(async () => {
    setActiveSessionId(null);
    setActiveLawyerId(null);
    await tokenStorage.clearActiveSessionData();
  }, []);

  /* =============================
     RESTORE SESSION
  ============================== */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await tokenStorage.getAccessToken();

        if (token) {
          const userProfile = await authService.getProfile();
          setUser(userProfile);

          const storedData = await tokenStorage.getActiveSessionData();
          if (storedData) {
            const { sessionId, lawyerId } = JSON.parse(storedData);
            setActiveSessionId(sessionId);
            setActiveLawyerId(lawyerId);
          }
        }
      } catch (err) {
        console.log("RESTORE SESSION ERROR", err);
        await tokenStorage.clear();
      } finally {
        setHasCompletedSplash(true);
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
        activeSessionId,
        activeLawyerId,
        trackActiveSession,
        clearActiveSession,
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

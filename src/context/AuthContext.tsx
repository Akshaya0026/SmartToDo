import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from 'firebase/auth';
import {
  onAuthStateChanged,
  loginUser,
  registerUser,
  logoutUser,
} from '../services/authService';
import { initFirebase } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Initializing Firebase...');
    import('../utils/DebugLogger').then(({ logger }) => {
      logger.log('Firebase Init Triggered');
    });

    initFirebase();
    console.log('[AuthContext] Setting up auth listener...');

    const unsubscribe = onAuthStateChanged((u) => {
      console.log('[AuthContext] Auth state changed:', u ? u.uid : 'null');
      import('../utils/DebugLogger').then(({ logger }) => {
        logger.log('Auth State Change', { uid: u?.uid || 'logout' });
      });
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await loginUser(email, password);
  };

  const register = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    await registerUser(email, password, displayName);
  };

  const logout = async () => {
    await logoutUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

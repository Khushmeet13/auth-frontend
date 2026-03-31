import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '../api/services';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const [isLoading, setIsLoading] = useState(true);

  // On mount — try to restore session from stored token
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const { data } = await authApi.getMe();
          setUser(data.data.user);
          setAccessToken(token);
        } catch {
          localStorage.removeItem('accessToken');
          setAccessToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const setAuth = (token: string, userData: User) => {
    localStorage.setItem('accessToken', token);
    setAccessToken(token);
    setUser(userData);
  };

  const clearAuth = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authApi.getMe();
      setUser(data.data.user);
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, setAuth, clearAuth, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

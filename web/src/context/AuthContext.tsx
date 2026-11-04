import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/services';

interface User {
  id: string;
  idName: string;
  mailId: string | null;
  balanceCoin: number;
  withdrawCoin: number;
  remainingCoin: number;
  totalCoin: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('coin_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate token on mount
    authService.me()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('coin_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('coin_user');
        localStorage.removeItem('auth_token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authService.login(username, password);
    const { user: userData, token } = res.data;
    setUser(userData);
    localStorage.setItem('coin_user', JSON.stringify(userData));
    if (token) localStorage.setItem('auth_token', token);
  };

  const logout = async () => {
    await authService.logout().catch(() => {});
    setUser(null);
    localStorage.removeItem('coin_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

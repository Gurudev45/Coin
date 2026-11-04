import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/services';
import { getToken, setToken, removeToken } from '../services/api';
import type { Admin } from '../types';

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, admin: Admin) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = await getToken();
      if (storedToken) {
        setTokenState(storedToken);
        const res = await authService.me();
        setAdmin(res.data.user || res.data.admin);
      }
    } catch {
      await removeToken();
      setTokenState(null);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newAdmin: Admin) => {
    await setToken(newToken);
    setTokenState(newToken);
    setAdmin(newAdmin);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      await removeToken();
      setTokenState(null);
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

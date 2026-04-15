import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService, AuthResponse, RegisterRequest } from '../services/apiService';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  token: string | null;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_STORAGE_KEY = 'user';

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));

  const applyAuthResponse = useCallback((response: AuthResponse) => {
    localStorage.setItem('token', response.token);
    const nextUser: AuthUser | null =
      response.userId != null
        ? {
            id: response.userId,
            name: response.name ?? '',
            email: response.email ?? '',
          }
        : null;
    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    setUser(nextUser);
    setToken(response.token);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiService.login({ email, password });
      applyAuthResponse(response);
    },
    [applyAuthResponse]
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const response = await apiService.register(payload);
      applyAuthResponse(response);
    },
    [applyAuthResponse]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem(USER_STORAGE_KEY);
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    apiService.logout();
  }, []);

  useEffect(() => {
    const axiosInstance = apiService['api'] as import('axios').AxiosInstance;
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

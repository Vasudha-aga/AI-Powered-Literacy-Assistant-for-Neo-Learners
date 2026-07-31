import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface User {
  id: number;
  name: string;
  email: string;
  preferred_language?: string;
  // Add other fields as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Attempt to fetch current user profile
          const response = await api.get('/auth/me');
          setUser(response.data);
          if (response.data.preferred_language) {
            localStorage.setItem('preferred_language', response.data.preferred_language);
            i18n.changeLanguage(response.data.preferred_language);
          }
        } catch (error) {
          console.error("Failed to fetch user, token might be invalid", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token, i18n]);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    if (userData.preferred_language) {
      localStorage.setItem('preferred_language', userData.preferred_language);
      i18n.changeLanguage(userData.preferred_language);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import TokenService from '../services/tokenService';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const accessToken = TokenService.getAccessToken();
      const refreshToken = TokenService.getRefreshToken();

      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(accessToken);
        setUser(decoded);
      } catch (error) {
        TokenService.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
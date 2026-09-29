import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../service/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('railvista.user') || 
        localStorage.getItem('aerorail.user') || 
        'null'
      );
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => 
    localStorage.getItem('railvista.token') || 
    localStorage.getItem('aerorail.token') || 
    null
  );

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Verify and sync token on initial mount
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    if (token) {
      getMe()
        .then((freshUser) => {
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem('railvista.user', JSON.stringify(freshUser));
          }
        })
        .catch((err) => {
          // If token is invalid or expired, clear stale state
          if (err.response?.status === 401) {
            logout();
          }
        });
    }

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  const login = async (credentials) => {
    const result = await loginUser(credentials);
    const userToken = result.token;
    const userData = result.user;

    localStorage.setItem('railvista.token', userToken);
    localStorage.setItem('railvista.user', JSON.stringify(userData));
    localStorage.setItem('aerorail.token', userToken);
    localStorage.setItem('aerorail.user', JSON.stringify(userData));

    setToken(userToken);
    setUser(userData);
    setAuthModalOpen(false);
    return userData;
  };

  const register = async (details) => {
    const result = await registerUser(details);
    const userToken = result.token;
    const userData = result.user;

    localStorage.setItem('railvista.token', userToken);
    localStorage.setItem('railvista.user', JSON.stringify(userData));
    localStorage.setItem('aerorail.token', userToken);
    localStorage.setItem('aerorail.user', JSON.stringify(userData));

    setToken(userToken);
    setUser(userData);
    setAuthModalOpen(false);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('railvista.token');
    localStorage.removeItem('railvista.user');
    localStorage.removeItem('aerorail.token');
    localStorage.removeItem('aerorail.user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        authModalOpen,
        authMode,
        setAuthMode,
        openAuth,
        closeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

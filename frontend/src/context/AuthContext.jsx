import React, { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../service/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('aerorail.user') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('aerorail.token') || null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  const login = async (credentials) => {
    const result = await loginUser(credentials);
    localStorage.setItem('aerorail.token', result.token);
    localStorage.setItem('aerorail.user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    setAuthModalOpen(false);
    return result.user;
  };

  const register = async (details) => {
    const result = await registerUser(details);
    localStorage.setItem('aerorail.token', result.token);
    localStorage.setItem('aerorail.user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    setAuthModalOpen(false);
    return result.user;
  };

  const logout = () => {
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

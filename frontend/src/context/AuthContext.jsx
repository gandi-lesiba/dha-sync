import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import {
  clearTokens,
  getAccessToken,
  setAccessToken,
  setRememberMe,
  getActiveStorage,
} from '../utils/tokenStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if we have a token
  useEffect(() => {
    const token = getAccessToken();
    const storedUser = getActiveStorage().getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({ ...parsedUser, role: parsedUser.role?.toLowerCase() });
      } catch (e) {
        clearTokens();
      }
    }
    setLoading(false);
  }, []);

  // Login function - matches our backend
  const login = async (username, password, remember = true) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, user: userData } = response.data;
      const normalizedUser = { ...userData, role: userData.role?.toLowerCase() };

      setRememberMe(remember);
      setAccessToken(access_token);
      getActiveStorage().setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  // Logout function
  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

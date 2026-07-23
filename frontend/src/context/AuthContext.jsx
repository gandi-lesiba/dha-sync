import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on app load
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    console.log('AuthProvider - token found:', !!token);
    console.log('AuthProvider - storedUser found:', !!storedUser);
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('AuthProvider - user restored:', userData);
      } catch (e) {
        console.error('AuthProvider - error restoring user:', e);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    console.log('✅ AuthContext - login response:', response.data);
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(userData);
    
    return { success: true };   //  MUST return { success: true }
  } catch (error) {
    console.error('❌ AuthContext - login error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.error || 'Login failed' };
  }
};

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
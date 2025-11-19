import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          try {
            const userData = await authService.getMe();
            setUser(userData);
            setToken(storedToken);
          } catch (error) {
            console.error('Auth init error:', error);
            await AsyncStorage.removeItem('token');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Storage error:', error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const register = async (email, password, name, role = 'professional') => {
    const response = await authService.register(email, password, name, role);
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const loginAnonymous = async () => {
    const response = await authService.anonymousLogin();
    setToken(response.token);
    setUser(response.user);
    return response;
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        updateUser,
        loginAnonymous,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


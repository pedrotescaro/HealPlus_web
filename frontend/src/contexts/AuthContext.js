import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';

const DEMO_MODE = String(process.env.REACT_APP_DEMO_MODE).toLowerCase() === 'true';
const DEMO_AUTOSIGNIN = String(process.env.REACT_APP_DEMO_AUTOSIGNIN).toLowerCase() === 'true';

// ==================== Context ====================

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// ==================== Provider ====================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('healplus_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Limpa o estado de autenticação
   */
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('healplus_token');
    localStorage.removeItem('healplus_user');
  }, []);

  /**
   * Configura o estado de autenticação
   */
  const setAuthState = useCallback((userData, tokenValue) => {
    setUser(userData);
    setToken(tokenValue);
    setIsAuthenticated(true);
    if (tokenValue) {
      localStorage.setItem('healplus_token', tokenValue);
    }
    if (userData) {
      localStorage.setItem('healplus_user', JSON.stringify(userData));
    }
  }, []);

  /**
   * Inicializa a autenticação ao carregar a aplicação
   */
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      setError(null);

      try {
        // Tentar obter dados do usuário (cookies serão enviados automaticamente)
        const userData = await authService.getMe();
        setAuthState(userData, localStorage.getItem('healplus_token'));
      } catch (err) {
        // Se falhar, tentar com token do localStorage
        const storedToken = localStorage.getItem('healplus_token');
        if (storedToken) {
          try {
            // Tentar refresh token
            const refreshResponse = await authService.refresh();
            setAuthState(refreshResponse.user, refreshResponse.token);
          } catch (refreshErr) {
            // Refresh falhou, limpar tudo
            clearAuth();
            
            // Se modo demo com auto-login, fazer login anônimo
            if (DEMO_MODE && DEMO_AUTOSIGNIN) {
              try {
                const response = await authService.anonymousLogin();
                setAuthState(response.user, response.token);
              } catch {
                // Ignorar erros de login anônimo
              }
            }
          }
        } else if (DEMO_MODE && DEMO_AUTOSIGNIN) {
          // Modo demo sem token, fazer login anônimo
          try {
            const response = await authService.anonymousLogin();
            setAuthState(response.user, response.token);
          } catch {
            // Ignorar
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [clearAuth, setAuthState]);

  /**
   * Listener para eventos de logout forçado (ex: token expirado)
   */
  useEffect(() => {
    const handleForceLogout = () => {
      clearAuth();
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => {
      window.removeEventListener('auth:logout', handleForceLogout);
    };
  }, [clearAuth]);

  /**
   * Login com email e senha
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);
      setAuthState(response.user, response.token);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao fazer login. Verifique suas credenciais.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registro de novo usuário
   */
  const register = async (email, password, name, role = 'professional') => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(email, password, name, role);
      setAuthState(response.user, response.token);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao criar conta. Tente novamente.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout - revoga tokens e limpa estado
   */
  const logout = async () => {
    setLoading(true);

    try {
      await authService.logout();
    } catch (err) {
      // Mesmo com erro na API, limpar localmente
      console.error('Erro no logout:', err);
    } finally {
      clearAuth();
      setLoading(false);
    }
  };

  /**
   * Login anônimo para modo demo
   */
  const loginAnonymous = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.anonymousLogin();
      setAuthState(response.user, response.token);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Erro ao entrar como visitante.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Callback para autenticação social (Google, etc.)
   */
  const handleSocialAuth = async (tokenValue) => {
    setLoading(true);
    setError(null);

    try {
      localStorage.setItem('healplus_token', tokenValue);
      const userData = await authService.getMe();
      setAuthState(userData, tokenValue);
      return userData;
    } catch (err) {
      clearAuth();
      const errorMessage = err.message || 'Erro na autenticação social.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Atualiza dados do usuário localmente
   */
  const updateUser = (userData) => {
    setUser(prev => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('healplus_user', JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Renova tokens manualmente
   */
  const refreshTokens = async () => {
    try {
      const response = await authService.refresh();
      setAuthState(response.user, response.token);
      return response;
    } catch (err) {
      clearAuth();
      throw err;
    }
  };

  /**
   * Limpa mensagens de erro
   */
  const clearError = () => {
    setError(null);
  };

  // ==================== Context Value ====================

  const value = {
    // Estado
    user,
    token,
    loading,
    error,
    isAuthenticated,

    // Ações
    login,
    register,
    logout,
    loginAnonymous,
    handleSocialAuth,
    updateUser,
    refreshTokens,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

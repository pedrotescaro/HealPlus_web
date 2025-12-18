import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para proteger rotas que requerem autenticação
 * - Redireciona para login se não autenticado
 * - Mostra loading enquanto verifica autenticação
 * - Suporta roles para controle de acesso
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated || !user) {
    // Salvar a rota atual para redirecionar após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar role se especificado
  if (requiredRole && user.role !== requiredRole) {
    // Redirecionar para página de acesso negado ou dashboard
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <a href="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">
            Voltar ao Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
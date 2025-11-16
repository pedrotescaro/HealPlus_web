import React from 'react';

export const LoadingPage = ({ message = 'Carregando...' }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      <p className="text-gray-700 dark:text-gray-300">{message}</p>
    </div>
  </div>
);

export default LoadingPage;
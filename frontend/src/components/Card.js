import React from 'react';

const Card = ({ children, className = '', onClick, hover = true }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700
        ${hover ? 'hover:shadow-lg dark:hover:shadow-gray-900/40 transition-shadow duration-200 cursor-pointer' : ''}
        ${onClick ? 'hover:shadow-lg dark:hover:shadow-gray-900/40' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;

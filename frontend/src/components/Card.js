import React from 'react';

const Card = ({ children, className = '', onClick, hover = true }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-md p-6
        ${hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''}
        ${onClick ? 'hover:shadow-lg' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;

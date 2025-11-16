import React from 'react';

const Input = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  name,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-500/80
          transition duration-200
          
          /* --- ESTILOS PADRÃO (LIGHT MODE) --- */
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white text-gray-900'}
          
          /* --- ESTILOS DARK MODE --- */
          dark:bg-gray-700 dark:text-white
          dark:placeholder-gray-400
          ${error 
            ? 'dark:border-red-400 dark:focus:ring-red-400' 
            : 'dark:border-gray-600 dark:focus:ring-primary-400'
          }
          ${disabled ? 'dark:bg-gray-800 dark:cursor-not-allowed dark:text-gray-500' : ''}
          
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
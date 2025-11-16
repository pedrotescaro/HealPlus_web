import React from 'react';

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const variants = {
  default: 'bg-primary-600 text-white hover:bg-primary-500',
  ghost: 'bg-transparent text-foreground hover:bg-primary/10 hover:text-primary',
};

export const Button = ({
  children,
  className = '',
  size = 'md',
  variant = 'default',
  asChild = false,
  ...props
}) => {
  const classes = `inline-flex items-center justify-center rounded-md transition-all duration-300 ${sizes[size]} ${variants[variant]} ${className}`;
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { className: `${classes} ${children.props.className || ''}` });
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
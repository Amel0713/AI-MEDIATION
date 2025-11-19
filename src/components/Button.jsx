import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  lift = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200';

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md focus:ring-primary-500 active:bg-primary-800',
    secondary: 'bg-neutral-600 text-white hover:bg-neutral-700 hover:shadow-md focus:ring-neutral-500 active:bg-neutral-800',
    outline: 'border-2 border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-md focus:ring-primary-500 active:bg-neutral-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md focus:ring-red-500 active:bg-red-800',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const liftClass = lift ? 'btn-hover-lift' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${liftClass} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
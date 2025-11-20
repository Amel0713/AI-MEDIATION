import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'normal',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8',
  };

  const baseClasses = 'bg-black shadow-lg rounded-2xl border border-gray-700 backdrop-blur-sm transition-all duration-300 text-white';
  const hoverClass = hover ? 'card-hover' : '';

  const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClass} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
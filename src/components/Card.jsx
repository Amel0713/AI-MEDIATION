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

  const baseClasses = 'bg-white shadow-lg rounded-2xl border border-neutral-200 backdrop-blur-sm transition-all duration-300';
  const hoverClass = hover ? 'card-hover' : '';

  const classes = `${baseClasses} ${paddingClasses[padding]} ${hoverClass} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
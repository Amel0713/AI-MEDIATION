import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  const classes = `bg-white shadow-md rounded-lg p-6 border border-gray-200 ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
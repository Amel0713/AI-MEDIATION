import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  const classes = `bg-white shadow-lg rounded-xl p-6 border border-secondary-200 ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
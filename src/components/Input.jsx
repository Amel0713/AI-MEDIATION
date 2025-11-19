import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  className = '',
  icon,
  ...props
}) => {
  const inputClasses = `w-full px-4 py-3 border-2 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-50 ${
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-neutral-300 hover:border-neutral-400'
  } ${icon ? 'pl-12' : ''} ${className}`;

  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
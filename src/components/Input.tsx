import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: React.ReactNode;
}

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
}: InputProps) => {
  const inputClasses = `w-full px-4 py-3 border-2 rounded-xl bg-gray-800 text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-700 ${
    error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-600 hover:border-gray-500'
  } ${icon ? 'pl-12' : ''} ${className}`;

  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-semibold text-white mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
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
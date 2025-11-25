import React from 'react';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
}

const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  rows = 3,
  error,
  ...props
}: TextareaProps) => {
  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-semibold text-white mb-2">
          {label}{required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-4 py-3 border-2 rounded-xl bg-gray-800 text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-gray-700 resize-none ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-600 hover:border-gray-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;
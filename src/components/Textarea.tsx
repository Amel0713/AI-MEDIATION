import React from 'react';

interface TextareaProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  rows?: number;
  [key: string]: any;
}

const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  rows = 3,
  ...props
}: TextareaProps) => {
  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-semibold text-white mb-2">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-4 py-3 border-2 border-gray-600 rounded-xl bg-gray-800 text-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-gray-700 resize-none ${className}`}
        {...props}
      />
    </div>
  );
};

export default Textarea;
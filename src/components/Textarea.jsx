import React from 'react';

const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  rows = 3,
  ...props
}) => {
  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full px-4 py-3 border-2 border-neutral-300 rounded-xl bg-white shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:bg-neutral-50 resize-none ${className}`}
        {...props}
      />
    </div>
  );
};

export default Textarea;
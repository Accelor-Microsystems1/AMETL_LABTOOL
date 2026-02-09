import React from 'react';

const TextArea = ({
  label,
  error,
  className = '',
  id,
  required,
  rows = 5,   
  ...props
}) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        rows={rows}
        className={`
          w-full px-3 py-2 
          bg-gray-900 
          border border-gray-600 
          rounded-lg 
          text-gray-100 
          placeholder-gray-500
          focus:ring-2 focus:ring-teal-500 focus:border-transparent
          transition-all duration-200
          resize-none
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default TextArea;
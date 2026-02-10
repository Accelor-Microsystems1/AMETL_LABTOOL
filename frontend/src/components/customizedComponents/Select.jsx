import React from 'react';

const Select = ({
  label,                              
  error,                              
  options = [],                       
  placeholder = 'Select an option',  
  className = '',
  id,
  required,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        className={`
          w-full px-3 py-2 
          bg-gray-900 
          border border-gray-600 
          rounded-lg 
          text-gray-100
          focus:ring-2 focus:ring-teal-500 focus:border-transparent
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="" className="bg-gray-900">{placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            className="bg-gray-900"
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Select;
import React from 'react';

const Badge = ({
  variant = 'default',  
  children,            
  className = ''
}) => {
  const variants = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
    danger: 'bg-red-500/20 text-red-400 border-red-500/50',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    default: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
  };

  return (
    <span 
      className={`
        inline-flex items-center px-2.5 py-0.5 
        rounded-full text-xs font-medium 
        border
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
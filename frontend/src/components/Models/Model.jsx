import React, { useEffect } from 'react';

const Modal = ({
  isOpen,       
  onClose,     
  title,  
  subtitle,     
  children, 
  size = 'md'
}) => {
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`
            relative w-full ${sizes[size]}
            bg-gray-800 rounded-xl shadow-2xl
            border border-gray-700
            transform transition-all
          `}
          onClick={(e) => e.stopPropagation()}  
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
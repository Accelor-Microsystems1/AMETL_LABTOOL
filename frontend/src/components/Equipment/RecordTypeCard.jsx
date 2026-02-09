import React from 'react';
import Button from '../customizedComponents/Button';

const RecordTypeCard = ({ 
  title,        
  icon,         
  description,  
  recordCount,  
  onAddClick    
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gray-900 rounded-lg text-teal-500">
          {icon}
        </div>
        {recordCount > 0 && (
          <span className="text-sm text-gray-400">
            {recordCount} record{recordCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-100 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={onAddClick}
        leftIcon={
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      >
        Add New
      </Button>
    </div>
  );
};

export default RecordTypeCard;
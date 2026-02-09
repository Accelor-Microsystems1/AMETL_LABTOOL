import React, { useRef, useState } from 'react';
const FileUpload = ({
  label,
  accept = '.pdf,.jpg,.jpeg,.png', 
  error,
  onChange,   
  value       
}) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);  
    } else if (e.type === 'dragleave') {
      setDragActive(false);  
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);  
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';  
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      {!value ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6
            transition-all duration-200 cursor-pointer
            ${dragActive 
              ? 'border-teal-500 bg-teal-500/10' 
              : 'border-gray-600 hover:border-gray-500'
            }
            ${error ? 'border-red-500' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />
          
          <div className="text-center">
            <svg className="mx-auto h-10 w-10 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-gray-400">
              <span className="text-teal-500">Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-3">
            <svg className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-sm text-gray-200">{value.name}</p>
              <p className="text-xs text-gray-500">{(value.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
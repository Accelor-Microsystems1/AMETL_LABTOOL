import React from 'react';
import { Paginator } from 'primereact/paginator';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight 
} from 'react-icons/fi';

const Pagination = ({ 
  totalRecords,
  rowsPerPage = 10,
  currentPage = 0,
  onPageChange,
  variant = 'default', 
  color = 'blue' 
}) => {
  
  const colorSchemes = {
    blue: {
      active: 'bg-blue-600 text-white shadow-lg shadow-blue-600/30',
      hover: 'hover:bg-blue-50 hover:text-blue-600',
      text: 'text-blue-600'
    },
    purple: {
      active: 'bg-purple-600 text-white shadow-lg shadow-purple-600/30',
      hover: 'hover:bg-purple-50 hover:text-purple-600',
      text: 'text-purple-600'
    },
    green: {
      active: 'bg-green-600 text-white shadow-lg shadow-green-600/30',
      hover: 'hover:bg-green-50 hover:text-green-600',
      text: 'text-green-600'
    },
    gray: {
      active: 'bg-gray-800 text-white shadow-lg shadow-gray-800/30',
      hover: 'hover:bg-gray-100 hover:text-gray-800',
      text: 'text-gray-600'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  function getLayout() {
    const templates = {
      default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
      simple: 'PrevPageLink CurrentPageReport NextPageLink',
      minimal: 'PrevPageLink PageLinks NextPageLink',
      full: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown JumpToPageDropdown'
    };
    return templates[variant] || templates.default;
  }

  const customTemplate = {
    layout: getLayout(),
    
    // First Page Button
    FirstPageLink: (options) => {
      return (
        <button
          type="button"
          className={`
            relative inline-flex items-center p-2 rounded-lg
            text-gray-600 bg-white border border-gray-200
            transition-all duration-200 ease-in-out
            ${options.disabled 
              ? 'opacity-40 cursor-not-allowed' 
              : `${scheme.hover} transform hover:scale-105`
            }
          `}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <FiChevronsLeft className="w-5 h-5" />
        </button>
      );
    },

    // Previous Page Button
    PrevPageLink: (options) => {
      return (
        <button
          type="button"
          className={`
            relative inline-flex items-center p-2 rounded-lg
            text-gray-600 bg-white border border-gray-200
            transition-all duration-200 ease-in-out
            ${options.disabled 
              ? 'opacity-40 cursor-not-allowed' 
              : `${scheme.hover} transform hover:scale-105`
            }
          `}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
      );
    },

    // Next Page Button
    NextPageLink: (options) => {
      return (
        <button
          type="button"
          className={`
            relative inline-flex items-center p-2 rounded-lg
            text-gray-600 bg-white border border-gray-200
            transition-all duration-200 ease-in-out
            ${options.disabled 
              ? 'opacity-40 cursor-not-allowed' 
              : `${scheme.hover} transform hover:scale-105`
            }
          `}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      );
    },

    // Last Page Button
    LastPageLink: (options) => {
      return (
        <button
          type="button"
          className={`
            relative inline-flex items-center p-2 rounded-lg
            text-gray-600 bg-white border border-gray-200
            transition-all duration-200 ease-in-out
            ${options.disabled 
              ? 'opacity-40 cursor-not-allowed' 
              : `${scheme.hover} transform hover:scale-105`
            }
          `}
          onClick={options.onClick}
          disabled={options.disabled}
        >
          <FiChevronsRight className="w-5 h-5" />
        </button>
      );
    },

    // Page Links
    PageLinks: (options) => {
      if ((options.view.startPage === options.page && options.view.startPage !== 0) || 
          (options.view.endPage === options.page && options.page + 1 !== options.totalPages)) {
        return (
          <span className="mx-1 px-2 py-1 text-gray-500">...</span>
        );
      }

      return (
        <button
          type="button"
          className={`
            mx-1 px-4 py-2 rounded-lg font-medium
            transition-all duration-200 ease-in-out transform
            ${options.active 
              ? `${scheme.active} scale-105` 
              : `bg-white border border-gray-200 text-gray-600 ${scheme.hover} hover:scale-105`
            }
          `}
          onClick={options.onClick}
        >
          {options.page + 1}
        </button>
      );
    },

    // Current Page Report
    CurrentPageReport: (options) => {
      return (
        <span className="text-sm text-gray-600 mx-2">
          Showing {options.first + 1} to {Math.min(options.first + options.rows, options.totalRecords)} of {options.totalRecords}
        </span>
      );
    },

    // Rows Per Page Dropdown - FIXED
    RowsPerPageDropdown: (options) => {
      const dropdownOptions = [5, 10, 20, 30, 50];

      const handleRowsChange = (e) => {
        const newRows = parseInt(e.target.value, 10);
        
        // Call the parent's onPageChange with updated rows
        // Reset to first page when changing rows per page
        onPageChange({
          first: 0,
          rows: newRows,
          page: 0,
          pageCount: Math.ceil(totalRecords / newRows)
        });
      };

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium hidden sm:inline">Rows per page:</span>
          <select
            className={`
              px-3 py-2 bg-white border border-gray-200 rounded-lg
              text-sm font-medium text-gray-700
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              hover:border-gray-300 cursor-pointer
            `}
            value={rowsPerPage}
            onChange={handleRowsChange}
          >
            {dropdownOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    },
 
    // Jump To Page Dropdown - FIXED
    JumpToPageDropdown: (options) => {
      const totalPages = Math.ceil(totalRecords / rowsPerPage);
      const currentPageNumber = Math.floor(currentPage / rowsPerPage);

      const handlePageJump = (e) => {
        const pageNumber = parseInt(e.target.value, 10);
        
        onPageChange({
          first: pageNumber * rowsPerPage,
          rows: rowsPerPage,
          page: pageNumber,
          pageCount: totalPages
        });
      };

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium hidden sm:inline">Go to:</span>
          <select
            className={`
              px-3 py-2 bg-white border border-gray-200 rounded-lg
              text-sm font-medium text-gray-700
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              hover:border-gray-300 cursor-pointer
            `}
            value={currentPageNumber}
            onChange={handlePageJump}
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <option key={i} value={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      );
    }
  };

  return (
    <div className="w-full">
      <Paginator
        first={currentPage}
        rows={rowsPerPage}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
        template={customTemplate}
        rowsPerPageOptions={[5, 10, 20, 30, 50]}
        className="flex items-center justify-center flex-wrap gap-4 px-4 py-3 bg-linear-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm"
      />
    </div>
  );
};

export default Pagination;
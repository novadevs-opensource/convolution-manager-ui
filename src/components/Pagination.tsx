// src/components/Pagination.tsx
import React from 'react';

interface PaginationProps {
  pagination: {
    current_page: number;
    from: number;
    to: number;
    total: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: {
      url: string | null;
      label: string;
      active: boolean;
    }[];
  };
  onPageChange: (page: number) => void;
  isLoading: boolean; // New prop for loading state
}

const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange, isLoading }) => {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      onPageChange(page);
    }
  };

  // Exclude the first and last link (those are the 'Prev' and 'Next' buttons)
  const pageLinks = pagination.links.slice(1, -1);

  return (
    <div className="flex justify-between items-center px-4 py-3">
      <div className="text-sm text-slate-500">
        Showing <b>{pagination.from ?? 0} to {pagination.to ?? 0}</b> of {pagination.total}
      </div>
      <div className="flex space-x-1">
        {isLoading ? (
          <div className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded">
            Loading...
          </div>
        ) : (
          <>
            {/* 'Prev' */}
            {pagination.prev_page_url && (
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease"
              >
                Prev
              </button>
            )}

            {/* Render only the numbered links that have a valid URL */}
            {pageLinks
              .filter((link) => link.url !== null)
              .map((link) => (
                <button
                  key={link.label}
                  onClick={() => handlePageChange(parseInt(link.label))}
                  disabled={!link.url}
                  className={`px-3 py-1 min-w-9 min-h-9 text-sm font-normal ${link.active ? 'text-white bg-slate-800' : 'text-slate-500 bg-white border border-slate-200'} rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease`}
                >
                  {link.label}
                </button>
              ))}

            {/* 'Next' */}
            {pagination.next_page_url && (
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                className="px-3 py-1 min-w-9 min-h-9 text-sm font-normal text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-400 transition duration-200 ease"
              >
                Next
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Pagination;

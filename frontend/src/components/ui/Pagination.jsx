import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, currentPage, totalPages, totalCount, onPageChange, className = '' }) {
  // Accept both `page` and `currentPage` for backward compatibility across callers.
  const activePage = Number(page ?? currentPage) || 1;
  if (!totalPages || totalPages <= 0) return null;

  // Generate page numbers array with optional ellipsis for large page counts
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (activePage > 3) pages.push('...');

      const start = Math.max(2, activePage - 1);
      const end = Math.min(totalPages - 1, activePage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (activePage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-3 px-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] font-sans ${className}`}>
      {/* Total Items Info */}
      <div className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5 text-center">
        <span className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
        <span>
          Page <strong className="text-[var(--ink)]">{activePage}</strong> of{' '}
          <strong className="text-[var(--ink)]">{totalPages}</strong>
          {totalCount ? ` (${totalCount} notes)` : ''}
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          disabled={activePage <= 1}
          onClick={() => onPageChange(activePage - 1)}
          className="h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          title="Previous Page"
        >
          <ChevronLeft size={14} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Number Pills - Fixed width to prevent hover layout shifts */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs font-semibold text-[var(--muted)] select-none">
                  ...
                </span>
              );
            }
            const isCurrent = p === activePage;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-[var(--radius-sm)] text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors border ${
                  isCurrent
                    ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold'
                    : 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          disabled={activePage >= totalPages}
          onClick={() => onPageChange(activePage + 1)}
          className="h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          title="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

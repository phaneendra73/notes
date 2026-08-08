import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 sm:py-5 px-3.5 sm:px-5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-md ${className}`}>
      {/* Total Items Info */}
      <div className="text-[11px] sm:text-xs font-bold text-muted-foreground flex items-center gap-1.5 text-center">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
        <span>
          Showing <span className="text-foreground font-extrabold">{totalCount > 0 ? activePage : 0}</span> of{' '}
          <span className="text-foreground font-extrabold">{totalPages}</span> pages
          {totalCount ? ` (${totalCount} notes)` : ''}
        </span>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center max-w-full">
        {/* Previous Button */}
        <button
          disabled={activePage <= 1}
          onClick={() => onPageChange(activePage - 1)}
          className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-border/80 bg-background/80 hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all duration-200 shadow-xs hover:border-primary/50 disabled:hover:border-border/80"
          title="Previous Page"
        >
          <FiChevronLeft size={15} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Number Pills */}
        <div className="flex items-center gap-1 px-0.5 overflow-x-auto max-w-full no-scrollbar">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-xs font-bold text-muted-foreground select-none">
                  ...
                </span>
              );
            }
            const isCurrent = p === activePage;
            return (
              <motion.button
                key={p}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-black flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,229,122,0.35)] border border-primary/50'
                    : 'bg-background/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/60'
                }`}
              >
                {p}
              </motion.button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          disabled={activePage >= totalPages}
          onClick={() => onPageChange(activePage + 1)}
          className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-border/80 bg-background/80 hover:bg-muted/80 text-foreground disabled:opacity-40 disabled:cursor-not-allowed text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-all duration-200 shadow-xs hover:border-primary/50 disabled:hover:border-border/80"
          title="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

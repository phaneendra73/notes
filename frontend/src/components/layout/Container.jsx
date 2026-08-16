import React from 'react';

/**
 * Container Component
 * Provides consistent max-width and padding for main content areas
 * Follows the 8-point grid system for consistent spacing
 */
export default function Container({ 
  children, 
  className = '',
  maxWidth = 'lg',
  padding = 'md',
  role = 'main'
}) {
  const maxWidthClasses = {
    sm: 'max-w-[640px]',
    md: 'max-w-[768px]',
    lg: 'max-w-[1024px]',
    xl: 'max-w-[1200px]',
    '2xl': 'max-w-[1536px]'
  };

  const paddingClasses = {
    sm: 'px-4 py-3 sm:px-5 sm:py-4',
    md: 'px-4 py-6 sm:px-6 sm:py-8',
    lg: 'px-4 py-8 sm:px-8 sm:py-12',
    xl: 'px-4 py-10 sm:px-10 sm:py-14'
  };

  return (
    <main 
      className={`w-full mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`}
      role={role}
    >
      {children}
    </main>
  );
}

/**
 * Section Component
 * A wrapper for section-level content with consistent spacing
 */
export function Section({ children, className = '', title = null }) {
  return (
    <section className={`w-full ${className}`}>
      {title && (
        <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight mb-6">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

import * as React from "react";
import { cn } from "../../lib/utils.js";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs sm:text-sm text-[var(--ink)] shadow-[var(--shadow-sm)] transition-colors duration-[var(--dur)] ease-[var(--ease)] file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-[var(--muted)] focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-1 focus-visible:ring-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };

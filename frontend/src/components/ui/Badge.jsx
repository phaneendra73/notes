import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const badgeVariants = cva(
  "inline-flex items-center rounded-[var(--radius-sm)] border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors select-none font-mono",
  {
    variants: {
      variant: {
        default:
          "border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold",
        secondary:
          "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)] font-medium",
        accent:
          "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-on)] font-bold",
        destructive:
          "border-[var(--err-soft)] bg-[var(--err-soft)] text-[var(--err)] font-semibold",
        outline:
          "border-[var(--line)] bg-transparent text-[var(--ink)]",
        draft:
          "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

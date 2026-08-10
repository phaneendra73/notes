import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-[var(--dur)] ease-[var(--ease)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] shadow-[var(--shadow-sm)] hover:bg-[var(--accent-strong)] font-bold",
        primary:
          "bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] shadow-[var(--shadow-sm)] hover:bg-[var(--accent-strong)] font-bold",
        destructive:
          "bg-[var(--err)] text-white shadow-[var(--shadow-sm)] hover:opacity-90 font-bold",
        outline:
          "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-[var(--shadow-sm)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] font-semibold",
        secondary:
          "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--line)] font-semibold",
        ghost:
          "bg-transparent text-[var(--ink)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)] font-semibold",
        link:
          "text-[var(--accent)] underline-offset-4 hover:underline font-semibold",
        neon:
          "border border-[var(--accent-soft)] text-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-[var(--accent-on)] font-semibold",
        view:
          "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)] font-semibold",
        edit:
          "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-[var(--accent-on)] font-semibold",
        publish:
          "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-[var(--accent-on)] font-semibold",
        unpublish:
          "bg-[var(--surface-2)] text-[var(--ink-2)] border border-[var(--line)] hover:border-[var(--line-strong)] hover:text-[var(--ink)] font-semibold",
        delete:
          "bg-[var(--err-soft)] text-[var(--err)] border border-[var(--err-soft)] hover:bg-[var(--err)] hover:text-white font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        xs: "h-7 px-2.5 text-[11px] rounded-[var(--radius-sm)] gap-1",
        sm: "h-8 px-3 text-xs rounded-[var(--radius-md)] gap-1.5",
        lg: "h-10 px-8 text-base rounded-[var(--radius-md)] gap-2",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

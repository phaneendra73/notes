import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98] duration-200 will-change-transform",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:opacity-90 hover:shadow-md font-bold",
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:opacity-90 hover:shadow-md font-bold",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 font-bold",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:shadow-md font-bold",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 font-bold",
        ghost:
          "hover:bg-accent hover:text-accent-foreground font-bold",
        link:
          "text-primary underline-offset-4 hover:underline font-bold",
        neon:
          "border border-primary/40 text-primary bg-primary/10 hover:bg-primary/20 shadow-[0_0_12px_rgba(0,229,122,0.15)] font-bold",
        info:
          "bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 font-bold",
        success:
          "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 font-bold",
        purple:
          "bg-purple-500/15 text-purple-400 border border-purple-500/30 hover:bg-purple-500/25 font-bold",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        xs: "h-7 px-2.5 text-[11px] rounded-lg gap-1",
        sm: "h-8 px-3 text-xs rounded-xl gap-1.5",
        lg: "h-10 px-8 text-base rounded-xl gap-2",
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

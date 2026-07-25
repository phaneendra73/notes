import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "../../lib/utils.js";
import { FiX } from "react-icons/fi";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = {
  default: {
    backgroundColor: "var(--card)",
    color: "var(--foreground)",
    borderColor: "var(--border)",
  },
  success: {
    backgroundColor: "color-mix(in srgb, var(--primary) 14%, var(--card) 86%)",
    color: "var(--foreground)",
    borderColor: "var(--primary)",
  },
  destructive: {
    backgroundColor: "rgba(239, 68, 68, 0.14)",
    color: "var(--foreground)",
    borderColor: "#ef4444",
  },
};

const Toast = React.forwardRef(({ className, variant = "default", style, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      "group pointer-events-auto relative flex w-full items-center justify-between gap-3 overflow-hidden rounded-xl border p-4 shadow-lg transition-all duration-300 backdrop-blur-sm",
      "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
      "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80",
      "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
      className
    )}
    style={{
      ...toastVariants[variant],
      ...style,
    }}
    {...props}
  />
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    style={{ color: "var(--foreground)" }}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs", className)}
    style={{ color: "var(--muted-foreground)" }}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-0.5 opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100",
      className
    )}
    style={{ color: "var(--muted-foreground)" }}
    toast-close=""
    {...props}
  >
    <FiX className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose };

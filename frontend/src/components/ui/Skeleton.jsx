import * as React from "react";
import { cn } from "../../lib/utils.js";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse bg-[var(--surface-2)] rounded-[var(--radius-md)]", className)}
      {...props}
    />
  );
}

export { Skeleton };
export default Skeleton;

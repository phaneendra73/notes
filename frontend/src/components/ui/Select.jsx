import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export function CustomSelect({ value, onValueChange, options, placeholder = "Select an option...", className = "" }) {
  return (
    <RadixSelect.Root value={String(value)} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        className={`inline-flex items-center justify-between gap-2 px-3 py-2 rounded-[var(--radius-sm)] border border-border bg-card/90 text-foreground text-xs font-extrabold cursor-pointer outline-none transition-all hover:border-primary hover:text-primary focus:border-primary focus:ring-1 focus:ring-primary shadow-sm ${className}`}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="text-primary">
          <ChevronDown size={14} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className="z-[200] min-w-[12rem] overflow-hidden rounded-[var(--radius-md)] border border-primary/40 bg-card/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1.5 animate-in fade-in-80 zoom-in-95"
          position="popper"
          sideOffset={5}
        >
          <RadixSelect.ScrollUpButton className="flex items-center justify-center h-6 bg-muted text-muted-foreground cursor-default">
            <ChevronUp size={14} />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="p-1 space-y-1">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={String(opt.value)}
                className="relative flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] text-xs font-black text-foreground cursor-pointer outline-none select-none transition-colors data-[highlighted]:bg-primary/15 data-[highlighted]:text-primary"
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="text-primary">
                  <Check size={14} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex items-center justify-center h-6 bg-muted text-muted-foreground cursor-default">
            <ChevronDown size={14} />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

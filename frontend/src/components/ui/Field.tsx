import { forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-line bg-white dark:bg-zinc-900 dark:border-zinc-700 px-3 text-sm text-ink-900 dark:text-zinc-100 placeholder:text-ink-400 dark:placeholder:text-zinc-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/50 focus-visible:ring-2 focus-visible:ring-brand-500",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-line bg-white dark:bg-zinc-900 dark:border-zinc-700 px-3 text-sm text-ink-700 dark:text-zinc-200 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/50 focus-visible:ring-2 focus-visible:ring-brand-500",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-line bg-white dark:bg-zinc-900 dark:border-zinc-700 px-3 py-2 text-sm text-ink-900 dark:text-zinc-100 placeholder:text-ink-400 dark:placeholder:text-zinc-500 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/50 focus-visible:ring-2 focus-visible:ring-brand-500",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-ink-700 dark:text-zinc-300">
      {children}
    </label>
  );
}

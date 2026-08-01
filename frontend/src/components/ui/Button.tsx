import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'soft'
  | 'danger'
  | 'success'
  | 'warning';

type Size = 'sm' | 'md' | 'lg' | 'icon' | 'icon-lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows an inline spinner and disables the button while true */
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: [
    'gradient-brand text-white',
    'shadow-[0_2px_8px_rgba(99,102,241,0.35)]',
    'hover:shadow-[0_4px_16px_rgba(99,102,241,0.45)]',
    'hover:-translate-y-0.5',
    'active:translate-y-0',
    'disabled:opacity-60 disabled:shadow-none disabled:translate-y-0',
  ].join(' '),

  secondary: [
    'bg-white border border-slate-200 text-ink-700',
    'shadow-sm',
    'hover:bg-slate-50 hover:border-slate-300 hover:shadow-md',
    'disabled:opacity-60 disabled:shadow-none',
  ].join(' '),

  ghost: [
    'text-ink-500',
    'hover:bg-slate-100 hover:text-ink-900',
    'disabled:opacity-60',
  ].join(' '),

  soft: [
    'bg-brand-50 text-brand-700',
    'border border-brand-100',
    'hover:bg-brand-100',
    'disabled:opacity-60',
  ].join(' '),

  danger: [
    'bg-rose-500 text-white',
    'shadow-[0_2px_8px_rgba(239,68,68,0.3)]',
    'hover:bg-rose-600 hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)]',
    'disabled:opacity-60 disabled:shadow-none',
  ].join(' '),

  success: [
    'bg-emerald-500 text-white',
    'shadow-[0_2px_8px_rgba(16,185,129,0.3)]',
    'hover:bg-emerald-600',
    'disabled:opacity-60 disabled:shadow-none',
  ].join(' '),

  warning: [
    'bg-amber-500 text-white',
    'hover:bg-amber-600',
    'disabled:opacity-60',
  ].join(' '),
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-sm gap-2',
  icon: 'h-9 w-9 rounded-xl',
  'icon-lg': 'h-11 w-11 rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isIconSize = size === 'icon' || size === 'icon-lg';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-medium select-none',
          'rounded-xl',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500',
          'disabled:cursor-not-allowed',
          // Variant & size
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2
              className={cn(
                'animate-spin shrink-0',
                size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
                !isIconSize && children && 'mr-1',
              )}
              aria-hidden="true"
            />
            {!isIconSize && children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, Variant as ButtonVariant, Size as ButtonSize };

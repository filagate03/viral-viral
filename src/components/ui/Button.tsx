import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-ember-500 hover:bg-ember-400 text-white shadow-card focus-visible:outline-ember-400',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus-visible:outline-slate-500',
  ghost: 'bg-transparent hover:bg-slate-900 text-slate-200 focus-visible:outline-slate-600',
  danger: 'bg-red-600 hover:bg-red-500 text-white focus-visible:outline-red-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm font-semibold',
  lg: 'px-6 py-3 text-base font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading,
    icon,
    iconPosition = 'left',
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && 'cursor-not-allowed opacity-70',
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {icon && iconPosition === 'left' && icon}
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span className="truncate">{children}</span>
        {icon && iconPosition === 'right' && icon}
      </button>
    );
  },
);

Button.displayName = 'Button';

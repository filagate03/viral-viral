import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Input = ({
  label,
  helper,
  error,
  className,
  leadingIcon,
  trailingIcon,
  ...props
}: InputProps) => {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-slate-100">
      {label && <span className="font-medium text-slate-200">{label}</span>}
      <div
        className={cn(
          'flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 transition focus-within:border-ember-400 focus-within:shadow-[0_0_0_1px_rgba(255,51,71,0.4)]',
          error && 'border-ember-500',
        )}
      >
        {leadingIcon && <span className="text-slate-500">{leadingIcon}</span>}
        <input
          className={cn(
            'flex-1 bg-transparent text-base text-slate-100 outline-none placeholder:text-slate-500',
            className,
          )}
          {...props}
        />
        {trailingIcon && <span className="text-slate-500">{trailingIcon}</span>}
      </div>
      {helper && !error && <span className="text-xs text-slate-500">{helper}</span>}
      {error && <span className="text-xs text-ember-300">{error}</span>}
    </label>
  );
};

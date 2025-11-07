import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type CardTone = 'default' | 'accent' | 'muted';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
  header?: ReactNode;
  footer?: ReactNode;
  dense?: boolean;
}

const toneClasses: Record<CardTone, string> = {
  default: 'bg-coal/80 border border-slate-800/60 backdrop-blur-md shadow-inset',
  accent: 'bg-ember-500 text-white shadow-card border border-ember-400/40',
  muted: 'bg-slate-900/70 border border-slate-800/80',
};

export const Card = ({
  children,
  className,
  tone = 'default',
  header,
  footer,
  dense,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col rounded-3xl p-6 transition shadow-[0_1px_0_rgba(255,255,255,0.05)]',
        dense && 'p-4',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {header && <div className="mb-4 flex items-start justify-between gap-2">{header}</div>}
      <div className="flex-1 space-y-3 text-sm text-slate-200">{children}</div>
      {footer && <div className="mt-5 border-t border-white/5 pt-4 text-xs text-slate-400">{footer}</div>}
    </div>
  );
};

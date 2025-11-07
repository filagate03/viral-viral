import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type TagTone = 'neutral' | 'positive' | 'alert' | 'custom';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
}

const toneClasses: Record<Exclude<TagTone, 'custom'>, string> = {
  neutral: 'bg-slate-800 text-slate-200',
  positive: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40',
  alert: 'bg-ember-500/20 text-ember-200 border border-ember-400/40',
};

export const Tag = ({ tone = 'neutral', className, children, ...props }: TagProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
      tone !== 'custom' && toneClasses[tone],
      className,
    )}
    {...props}
  >
    {children}
  </span>
);

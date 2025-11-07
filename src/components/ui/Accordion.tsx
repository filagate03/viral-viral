import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AccordionItem {
  id: string;
  title: string;
  description?: string;
  body: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
}

export const Accordion = ({ items, defaultOpenId, allowMultiple = false }: AccordionProps) => {
  const [openIds, setOpenIds] = useState<string[]>(() => (defaultOpenId ? [defaultOpenId] : []));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      }
      return prev[0] === id ? [] : [id];
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
          >
            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold transition',
                isOpen ? 'bg-slate-900 text-ember-200' : 'text-slate-200 hover:bg-slate-900/80',
              )}
              onClick={() => toggle(item.id)}
            >
              <div className="flex flex-col gap-1">
                <span>{item.title}</span>
                {item.description && <span className="text-xs font-normal text-slate-400">{item.description}</span>}
              </div>
              <ChevronDown
                className={cn('h-4 w-4 transition-transform', isOpen ? 'rotate-180 text-ember-300' : 'text-slate-500')}
              />
            </button>
            {isOpen && (
              <div className="border-t border-slate-800 px-5 py-4 text-sm text-slate-200">
                {item.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

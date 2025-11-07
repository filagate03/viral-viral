import type { ChangeEvent } from 'react';
import { cn } from '@/utils/cn';

interface SliderProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  marks?: Record<number, string>;
}

export const Slider = ({
  label,
  value,
  min = 10,
  max = 1000,
  step = 10,
  onChange,
  marks,
}: SliderProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {label && <div className="flex items-center justify-between text-sm text-slate-300"><span>{label}</span><span className="font-semibold text-ember-400">{value}</span></div>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-ember-500',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember-400',
        )}
      />
      {marks && (
        <div className="flex justify-between text-[11px] text-slate-500">
          {Object.entries(marks).map(([key, labelMark]) => (
            <span key={key} className="relative flex-1 text-center">
              <span className="absolute left-1/2 top-[-8px] h-3 w-[1px] -translate-x-1/2 bg-slate-700" />
              {labelMark}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

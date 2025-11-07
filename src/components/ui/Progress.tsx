interface ProgressProps {
  value: number;
  label?: string;
}

export const Progress = ({ value, label }: ProgressProps) => {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="flex w-full flex-col gap-2">
      {label && <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>}
      <div className="h-2 w-full rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-ember-400 to-ember-500 transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="text-right text-xs font-semibold text-slate-300">{clamped}%</span>
    </div>
  );
};

import { CircleCheck, HelpCircle, Settings, Zap } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header = ({ onOpenSettings }: HeaderProps) => {
  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-coal/80 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.25)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-ember-500 to-ember-700 shadow-card">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-ember-200">VIRAL OS</p>
          <h1 className="text-xl font-semibold">VIRAL OS</h1>
          <p className="text-sm text-slate-400">Разведка экспертных трендов YouTube</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2 rounded-full bg-slate-900/80 px-4 py-2">
          <CircleCheck className="h-4 w-4 text-ember-300" />
          <span>API работает стабильно</span>
        </div>
        <button
          className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-2 text-slate-200 transition hover:border-ember-400 hover:text-ember-200"
          onClick={onOpenSettings}
        >
          <Settings className="h-4 w-4" />
          Настройки
        </button>
        <button className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-2 text-slate-200 transition hover:border-ember-400 hover:text-ember-200">
          <HelpCircle className="h-4 w-4" />
          Помощь
        </button>
      </div>
    </header>
  );
};

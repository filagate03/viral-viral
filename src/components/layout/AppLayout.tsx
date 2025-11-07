import { useState, type PropsWithChildren } from 'react';
import { Header } from '@/components/layout/Header';
import { SettingsPanel } from '@/components/features/SettingsPanel';

export const AppLayout = ({ children }: PropsWithChildren) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-charcoal text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-[-10%] h-80 w-80 rounded-full bg-ember-500/30 blur-3xl" />
        <div className="absolute -right-24 bottom-[-20%] h-96 w-96 rounded-full bg-ember-600/25 blur-3xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 pb-16 pt-10 lg:px-12">
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        <main className="flex flex-1 flex-col gap-6 lg:gap-8">{children}</main>
      </div>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

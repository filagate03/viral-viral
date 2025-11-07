import { Download, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useScraper } from '@/hooks/useScraper';
import { secondsToClock } from '@/utils/format';
import { downloadScenarioPdf } from '@/utils/pdf';

export const ScenarioPanel = () => {
  const { scenarios, guide } = useScraper();

  const handleExport = () => {
    downloadScenarioPdf(scenarios, guide ?? null);
  };

  if (scenarios.length === 0) {
    return (
      <Card tone="muted" header={<h2 className="text-base font-semibold text-white">Сценарии сториборда</h2>}>
        <p className="text-sm text-slate-400">После генерации мы предложим три варианта сториборда с ключевыми сценами.</p>
      </Card>
    );
  }

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember-500/30">
              <LayoutDashboard className="h-5 w-5 text-ember-200" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Сценарии сториборда</h2>
              <p className="text-xs text-slate-400">Три готовых нарратива под вашу аудиторию.</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />} onClick={handleExport} disabled={scenarios.length === 0}>
            Экспорт PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{scenario.title}</h3>
                <Tag tone="neutral">{scenario.targetAudience}</Tag>
              </div>
              <p className="text-xs text-ember-200">{scenario.hook}</p>
              <p className="text-sm text-slate-300">{scenario.narrative}</p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {scenario.beats.slice(0, 3).map((beat) => (
                <div key={beat.title} className="rounded-2xl bg-slate-900/70 p-3 text-xs text-slate-300">
                  <p className="font-semibold text-white">{beat.title}</p>
                  <p className="text-slate-400">{beat.description}</p>
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-ember-200">
                    {secondsToClock(beat.durationSeconds)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span>Призыв: {scenario.callToAction}</span>
              <span>Визуальный стиль: {scenario.visualStyle}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

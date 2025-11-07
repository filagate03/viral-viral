import { ClipboardCheck, ListChecks } from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useScraper } from '@/hooks/useScraper';

export const TipsAccordion = () => {
  const { guide } = useScraper();

  if (!guide) {
    return (
      <Card tone="muted" header={<h2 className="text-base font-semibold text-white">План съёмки</h2>}>
        <p className="text-sm text-slate-400">После генерации гида здесь появятся советы по продакшену.</p>
      </Card>
    );
  }

  const accordionItems = guide.tips.map((tip) => ({
    id: tip.id,
    title: `${tip.category} — ${tip.headline}`,
    description: tip.summary,
    body: (
      <div className="space-y-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Шаги</p>
          <ul className="mt-1 space-y-1 text-sm text-slate-200">
            {tip.tips.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Оборудование</p>
          <p className="text-sm text-slate-200">{tip.equipment.join(', ')}</p>
        </div>
        {tip.backupPlan && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">План Б</p>
            <p className="text-sm text-slate-200">{tip.backupPlan}</p>
          </div>
        )}
      </div>
    ),
  }));

  return (
    <Card
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember-500/30">
              <ListChecks className="h-5 w-5 text-ember-200" />
            </div>
            <div>
              <h2 className="text-base font-semibold">План съёмки</h2>
              <p className="text-xs text-slate-400">Тактические рекомендации под выбранный сценарий.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" icon={<ClipboardCheck className="h-4 w-4" />}>
            Скопировать чек-лист
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Ключевые моменты</p>
          <p>{guide.keyMoments.join(' · ')}</p>
        </div>
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Производственный календарь</p>
          <p>{guide.productionCalendar.join(' · ')}</p>
        </div>
        <Accordion items={accordionItems} defaultOpenId={accordionItems[0]?.id} allowMultiple />
      </div>
    </Card>
  );
};

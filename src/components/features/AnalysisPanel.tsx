import { Lightbulb, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useScraper } from '@/hooks/useScraper';
import { riskToColor } from '@/utils/format';

const sentimentLabels: Record<'positive' | 'neutral' | 'negative', string> = {
  positive: 'позитив',
  neutral: 'нейтрально',
  negative: 'негатив',
};

const riskLabels: Record<'low' | 'medium' | 'high', string> = {
  low: 'низкий',
  medium: 'средний',
  high: 'высокий',
};

const formatSentiment = (value: 'positive' | 'neutral' | 'negative'): string => sentimentLabels[value] ?? value;
const formatRiskLevel = (value: 'low' | 'medium' | 'high'): string => riskLabels[value] ?? value;


export const AnalysisPanel = () => {
  const { analysis } = useScraper();

  if (analysis.length === 0) {
    return (
      <Card tone="muted" header={<h2 className="text-base font-semibold text-white">Сигналы популярности</h2>}>
        <p className="text-sm text-slate-400">Этот блок заполнится после завершения аналитики.</p>
      </Card>
    );
  }

  return (
    <Card
      header={
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember-500/30">
            <Lightbulb className="h-5 w-5 text-ember-200" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Сигналы популярности</h2>
            <p className="text-xs text-slate-400">Главные выводы по ведущим роликам в нише.</p>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {analysis.slice(0, 4).map((item) => (
          <div key={item.videoId} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-white">{item.summary}</h3>
              <Tag tone={item.sentiment === 'negative' ? 'alert' : 'neutral'}>{formatSentiment(item.sentiment)}</Tag>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              <p className={riskToColor(item.riskLevel)}>Уровень риска: {formatRiskLevel(item.riskLevel)}</p>
              <div className="space-y-1">
                {item.factors.slice(0, 3).map((factor) => (
                  <div key={factor.factor} className="flex items-start gap-2">
                    <ShieldAlert className="mt-[2px] h-3.5 w-3.5 text-ember-300" />
                    <div>
                      <p className="font-semibold text-slate-100">{factor.factor}</p>
                      <p className="text-slate-400">{factor.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
              {item.opportunities.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Возможности</p>
                  <ul className="mt-1 space-y-1 text-slate-300">
                    {item.opportunities.slice(0, 3).map((opportunity) => (
                      <li key={opportunity}>• {opportunity}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

import { AlertTriangle, CheckCircle, PlayCircle, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useScraper } from '@/hooks/useScraper';
import { formatPercent } from '@/utils/format';

const statusIcon = {
  idle: <RotateCcw className="h-4 w-4 text-slate-500" />,
  running: <PlayCircle className="h-4 w-4 text-ember-300 animate-pulse" />,
  success: <CheckCircle className="h-4 w-4 text-emerald-300" />,
  error: <AlertTriangle className="h-4 w-4 text-ember-300" />,
};

export const ProgressPanel = () => {
  const { progress, retryStage, isRunning, error } = useScraper();

  return (
    <Card
      dense
      header={<h2 className="text-base font-semibold text-white">Ход выполнения</h2>}
      footer={
        error ? (
          <div className="flex items-center justify-between text-amber-200">
            <span>{error}</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => retryStage(progress.activeStage)}
              loading={isRunning}
            >
              Повторить
            </Button>
          </div>
        ) : (
          <span className="text-slate-500">
            {progress.percent === 100 ? 'Все этапы завершены.' : 'Ждём завершения пайплайна.'}
          </span>
        )
      }
    >
      <div className="space-y-6">
        <Progress value={progress.percent} label="Общий прогресс" />
        <div className="space-y-3">
          {progress.stages.map((stage) => (
            <div
              key={stage.key}
              className="flex items-center justify-between rounded-2xl bg-slate-900/50 p-3"
            >
              <div className="flex items-center gap-3">
                {statusIcon[stage.status]}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{stage.label}</span>
                  {stage.errorMessage && (
                    <span className="text-xs text-ember-200">{stage.errorMessage}</span>
                  )}
                  {stage.hint && <span className="text-xs text-slate-500">Подсказка: {stage.hint}</span>}
                </div>
              </div>
              <Tag tone={stage.status === 'error' ? 'alert' : 'neutral'}>
                {stage.status === 'success' && 'Готово'}
                {stage.status === 'running' && formatPercent(progress.percent)}
                {stage.status === 'idle' && 'В очереди'}
                {stage.status === 'error' && 'Ошибка'}
              </Tag>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};


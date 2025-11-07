import type { PipelineStageUpdate, ScraperProgress, ScraperStageKey } from '@/types';
import { stageLabels, stageOrder } from '@/styles/theme';

export const buildInitialProgress = (): ScraperProgress => {
  const stages = stageOrder.map((key) => ({
    key: key as ScraperStageKey,
    label: stageLabels[key],
    status: 'idle' as const,
  }));

  return {
    stages,
    total: stages.length,
    completedCount: 0,
    percent: 0,
  };
};

export const applyStageUpdate = (
  prev: ScraperProgress,
  update: PipelineStageUpdate,
): ScraperProgress => {
  const stages = prev.stages.map((stage) => {
    if (stage.key !== update.stage) return stage;
    const now = new Date().toISOString();
    return {
      ...stage,
      status: update.status,
      startedAt: stage.startedAt ?? now,
      finishedAt: update.status === 'success' || update.status === 'error' ? now : stage.finishedAt,
      errorMessage: update.errorMessage,
      hint: update.hint,
    };
  });

  const completedCount = stages.filter((stage) => stage.status === 'success').length;
  const percent = Math.round((completedCount / stages.length) * 100);

  return {
    ...prev,
    stages,
    completedCount,
    percent,
    activeStage: update.status === 'success' ? undefined : update.stage,
    lastUpdatedAt: new Date().toISOString(),
  };
};

export const resetProgress = (): ScraperProgress => buildInitialProgress();

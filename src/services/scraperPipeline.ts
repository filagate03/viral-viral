import { openAiService } from '@/services/openAiService';
import { youtubeService } from '@/services/youtubeService';
import type {
  PipelineStageUpdate,
  ScraperError,
  ScraperFormValues,
  ScraperResult,
  ScraperStageKey,
} from '@/types';
import { stageOrder } from '@/styles/theme';

const emitStageUpdate = (
  onUpdate: (update: PipelineStageUpdate) => void,
  update: PipelineStageUpdate,
) => {
  onUpdate(update);
};

const wrapStage = async <T>(
  stage: ScraperStageKey,
  task: () => Promise<T>,
  onUpdate: (update: PipelineStageUpdate) => void,
): Promise<T> => {
  emitStageUpdate(onUpdate, { stage, status: 'running' });
  try {
    const result = await task();
    emitStageUpdate(onUpdate, { stage, status: 'success' });
    return result;
  } catch (error) {
    const scraperError = error as ScraperError;
    emitStageUpdate(onUpdate, {
      stage,
      status: 'error',
      errorMessage: scraperError.message,
      hint: scraperError.hint,
    });
    throw error;
  }
};

export const scraperPipeline = {
  async runPipeline(
    { searchQuery, requestCount }: ScraperFormValues,
    onStageUpdate: (update: PipelineStageUpdate) => void,
  ): Promise<ScraperResult> {
    const result: ScraperResult = {
      queries: [],
      videos: [],
      analysis: [],
      scenarios: [],
      guide: null,
    };

    const queries = await wrapStage(
      'generateQueries',
      () => openAiService.generateQueries(searchQuery, requestCount),
      onStageUpdate,
    );
    result.queries = Array.from(new Set([searchQuery, ...queries]));

    const videos = await wrapStage(
      'fetchVideos',
      () => youtubeService.fetchTrendingVideos(result.queries, requestCount),
      onStageUpdate,
    );
    result.videos = videos;

    const analysis = await wrapStage(
      'analyzePopularity',
      () => openAiService.analyzePopularity(result.videos),
      onStageUpdate,
    );
    result.analysis = analysis;

    const scenarios = await wrapStage(
      'createScenarios',
      () => openAiService.createScenarios(result.analysis),
      onStageUpdate,
    );
    result.scenarios = scenarios;

    const guide = await wrapStage(
      'generateTips',
      () => openAiService.generateShootingGuide(result.scenarios),
      onStageUpdate,
    );
    result.guide = guide;

    return result;
  },

  buildInitialStages(): PipelineStageUpdate[] {
    return stageOrder.map((stage) => ({ stage: stage as ScraperStageKey, status: 'idle' }));
  },
};

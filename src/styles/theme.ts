export const stageLabels = {
  generateQueries: 'Генерация запросов ИИ',
  fetchVideos: 'Поиск видео на YouTube',
  analyzePopularity: 'Анализ популярности',
  createScenarios: 'Создание сценариев',
  generateTips: 'Гид по съёмке',
} as const;

export const stageOrder = [
  'generateQueries',
  'fetchVideos',
  'analyzePopularity',
  'createScenarios',
  'generateTips',
] as const;

export const requestCountMarks: Record<number, string> = {
  10: '10',
  100: '100',
  500: '500',
  1000: '1000',
};

export const openAiModel = 'gpt-4.1-mini';

export const youtubeMaxPageSize = 50;

export const defaultTrendThreshold = 72;

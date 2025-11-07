export type ScraperStageKey =
  | 'generateQueries'
  | 'fetchVideos'
  | 'analyzePopularity'
  | 'createScenarios'
  | 'generateTips';

export type StageStatus = 'idle' | 'running' | 'success' | 'error';

export interface ScraperFormValues {
  searchQuery: string;
  requestCount: number;
}

export interface StageState {
  key: ScraperStageKey;
  label: string;
  status: StageStatus;
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
  hint?: string;
}

export interface VideoMetric {
  label: string;
  value: string;
}

export interface VideoData {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  duration: string;
  durationSeconds: number;
  trendScore: number;
  url: string;
}

export interface PopularityFactor {
  factor: string;
  weight: number;
  insight: string;
}

export interface PopularityAnalysis {
  videoId: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  opportunities: string[];
  riskLevel: 'low' | 'medium' | 'high';
  factors: PopularityFactor[];
}

export interface VideoBeat {
  title: string;
  description: string;
  durationSeconds: number;
}

export interface VideoScenario {
  id: string;
  title: string;
  hook: string;
  targetAudience: string;
  callToAction: string;
  visualStyle: string;
  narrative: string;
  beats: VideoBeat[];
}

export interface ShootingTip {
  id: string;
  category: string;
  headline: string;
  summary: string;
  tips: string[];
  equipment: string[];
  backupPlan?: string;
}

export interface ShootingGuide {
  keyMoments: string[];
  productionCalendar: string[];
  tips: ShootingTip[];
}

export interface ScraperResult {
  queries: string[];
  videos: VideoData[];
  analysis: PopularityAnalysis[];
  scenarios: VideoScenario[];
  guide: ShootingGuide | null;
}

export interface ScraperProgress {
  stages: StageState[];
  activeStage?: ScraperStageKey;
  completedCount: number;
  total: number;
  percent: number;
  lastUpdatedAt?: string;
}

export interface ScraperContextState extends ScraperResult {
  formValues: ScraperFormValues | null;
  progress: ScraperProgress;
  isRunning: boolean;
  error?: string;
}

export interface ScraperContextValue extends ScraperContextState {
  startScrape: (values: ScraperFormValues) => Promise<void>;
  retryStage: (stage?: ScraperStageKey) => Promise<void>;
  reset: () => void;
}

export interface ScraperError extends Error {
  stage: ScraperStageKey;
  hint?: string;
}

export interface PipelineStageUpdate {
  stage: ScraperStageKey;
  status: StageStatus;
  errorMessage?: string;
  hint?: string;
}



export interface AppSettings {
  openAiApiKey: string;
  openAiProjectId: string;
  youtubeApiKey: string;
}

export interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (values: Partial<AppSettings>) => void;
  resetSettings: () => void;
}


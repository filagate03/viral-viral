import type { AxiosError } from 'axios';
import { getOpenAiClient } from '@/services/apiClient';
import { openAiModel } from '@/styles/theme';
import type {
  PopularityAnalysis,
  ScraperError,
  ScraperStageKey,
  ShootingGuide,
  ShootingTip,
  VideoData,
  VideoScenario,
} from '@/types';

interface ChatCompletionChoice {
  message?: { content?: string };
}

interface ChatCompletionResponse {
  choices?: ChatCompletionChoice[];
}

const extractJson = <T>(content: string): T => {
  const firstBrace = content.indexOf('{');
  const firstBracket = content.indexOf('[');
  const startIndex = firstBrace === -1 ? firstBracket : firstBracket === -1 ? firstBrace : Math.min(firstBrace, firstBracket);

  if (startIndex === -1) {
    throw new Error('OpenAI response did not include JSON payload.');
  }

  const lastBrace = content.lastIndexOf('}');
  const lastBracket = content.lastIndexOf(']');
  const endIndex = lastBrace === -1 ? lastBracket : lastBracket === -1 ? lastBrace : Math.max(lastBrace, lastBracket);

  const jsonText = content.slice(startIndex, endIndex + 1);
  return JSON.parse(jsonText) as T;
};

const toScraperError = (stage: ScraperStageKey, rawError: unknown, fallbackHint?: string): ScraperError => {
  const error = new Error('Stage failed') as ScraperError;
  error.stage = stage;

  if (rawError instanceof Error && rawError.message) {
    error.message = rawError.message;
  } else {
    error.message = `Failed to execute stage: ${stage}`;
  }

  if (fallbackHint) {
    error.hint = fallbackHint;
  }

  if (rawError && typeof rawError === 'object' && 'response' in rawError) {
    const axiosError = rawError as AxiosError;
    const payload = axiosError.response?.data;
    if (payload && typeof payload === 'object' && 'error' in payload) {
      const openAiError = (payload as { error?: { message?: string } }).error;
      if (openAiError?.message) {
        error.message = openAiError.message;
      }
    } else if (axiosError.message) {
      error.message = axiosError.message;
    }
  }

  return error;
};

const bannedQueryPatterns = [
  /toyota/iu,
  /corolla/iu,
  /нумеролог/iu,
  /астролог/iu,
  /forester/iu,
  /subaru/iu,
  /wilderness/iu,
  /полит/iu,
  /выборы/iu,
  /украин/iu,
  /гороскоп/iu,
];

const defaultModifiers = [
  'аналитика',
  'новости',
  'экспертный разбор',
  'исследование рынка',
  'прогноз',
  'кейсы',
  'best practices',
];

const sanitizeText = (value: string): string =>
  value
    .replace(/^role:\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const sanitizeOptional = (value?: string): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const sanitized = sanitizeText(value);
  return sanitized || undefined;
};

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-zа-я0-9ё]+/iu)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const enrichKeywords = (tokens: string[]): string[] => {
  if (tokens.some((token) => ['ai', 'ии', 'нейросеть', 'нейросети', 'искусственный', 'интеллект'].includes(token))) {
    return Array.from(
      new Set([
        ...tokens,
        'искусственный интеллект',
        'ai',
        'нейросети',
        'machine learning',
      ]),
    );
  }
  return tokens;
};

const containsKeyword = (text: string, keywords: string[]): boolean => {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword));
};

const normalizeQuery = (query: string): string => query.replace(/\s+/g, ' ').trim();

const cleanQueries = (seed: string, queries: string[]): string[] => {
  const keywords = enrichKeywords(tokenize(seed));
  const unique = new Set<string>();

  const push = (candidate: string) => {
    const normalized = normalizeQuery(candidate);
    if (!normalized) return;
    if (bannedQueryPatterns.some((pattern) => pattern.test(normalized))) return;
    if (keywords.length > 0 && !containsKeyword(normalized, keywords)) return;
    unique.add(normalized);
  };

  queries.forEach(push);
  if (unique.size < 5) {
    defaultModifiers.forEach((modifier) => push(`${seed} ${modifier}`));
  }

  if (!unique.has(seed.trim())) {
    push(seed);
  }

  return Array.from(unique).slice(0, 12);
};

const toTextArray = (items: unknown[]): string[] =>
  items
    .map((item) => {
      if (typeof item === 'string') return sanitizeText(item);
      if (item && typeof item === 'object') {
        const value = (item as Record<string, unknown>).title ??
          (item as Record<string, unknown>).name ??
          (item as Record<string, unknown>).summary;
        if (typeof value === 'string') return sanitizeText(value);
        return JSON.stringify(item);
      }
      if (item === undefined || item === null) return '';
      return String(item);
    })
    .filter((item) => Boolean(item));

const toStringArray = (items: unknown[]): string[] =>
  items
    .map((item) => {
      if (typeof item === 'string') return sanitizeText(item);
      if (item === undefined || item === null) return '';
      return sanitizeText(String(item));
    })
    .filter((item) => Boolean(item));

const normalizeGuide = (guide: ShootingGuide): ShootingGuide => ({
  ...guide,
  keyMoments: toTextArray(Array.isArray(guide.keyMoments) ? guide.keyMoments : []),
  productionCalendar: toTextArray(Array.isArray(guide.productionCalendar) ? guide.productionCalendar : []),
  tips: guide.tips.map((tip) => ({
    ...tip,
    category: sanitizeOptional(tip.category) ?? 'Советы',
    headline: sanitizeOptional(tip.headline) ?? 'Шаги',
    summary: sanitizeOptional(tip.summary) ?? '',
    tips: toTextArray(Array.isArray(tip.tips) ? tip.tips : tip.tips ? [tip.tips] : []),
    equipment: toStringArray(Array.isArray(tip.equipment) ? tip.equipment : tip.equipment ? [tip.equipment] : []),
    backupPlan: tip.backupPlan ? sanitizeText(String(tip.backupPlan)) : undefined,
  } as ShootingTip)),
});

const requestJson = async <T>(stage: ScraperStageKey, messages: { role: 'system' | 'user'; content: string }[]): Promise<T> => {
  try {
    const client = getOpenAiClient();
    const { data } = await client.post<ChatCompletionResponse>('/chat/completions', {
      model: openAiModel,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages,
    });

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response empty.');
    }

    return extractJson<T>(content);
  } catch (error) {
    throw toScraperError(stage, error, 'Verify OpenAI API credentials and quota.');
  }
};

export const openAiService = {
  async generateQueries(searchQuery: string, requestCount: number): Promise<string[]> {
    const result = await requestJson<{ queries: string[] }>('generateQueries', [
      {
        role: 'system',
        content:
          'Ты — эксперт по росту YouTube-каналов на русском языке. На основе исходного запроса верни JSON вида { "queries": string[] } с релевантными поисковыми фразами (только по теме пользователя, без политики, астрологии, автомобилей и т.п.). Уточняй, что искать именно про технологии/ИИ, избегай развлекательных подсказок. Добавляй короткие и длинные ключи, но не более 12 штук.',
      },
      {
        role: 'user',
        content: JSON.stringify({ searchQuery, targetVideoCount: requestCount }),
      },
    ]);

    return cleanQueries(searchQuery, result.queries ?? []);
  },

  async analyzePopularity(videos: VideoData[]): Promise<PopularityAnalysis[]> {
    const condensed = videos.slice(0, 20).map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description.slice(0, 300),
      stats: {
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
      },
      tags: video.tags.slice(0, 10),
      publishedAt: video.publishedAt,
    }));

    const result = await requestJson<{ analyses: PopularityAnalysis[] }>('analyzePopularity', [
      {
        role: 'system',
        content:
          'Ты аналитик контента на русском языке. Верни JSON { "analyses": Analysis[] }, где каждый элемент содержит videoId, summary, sentiment, opportunities[], riskLevel, factors[]. Пиши кратко по-русски, используй sentiment только из positive|neutral|negative и riskLevel из low|medium|high. Сосредоточься на экспертных выводах.',
      },
      {
        role: 'user',
        content: JSON.stringify({ videos: condensed }),
      },
    ]);

    return result.analyses;
  },

  async createScenarios(analyses: PopularityAnalysis[]): Promise<VideoScenario[]> {
    const result = await requestJson<{ scenarios: VideoScenario[] }>('createScenarios', [
      {
        role: 'system',
        content:
          'Ты креативный директор. Верни JSON { "scenarios": Scenario[] } (на русском языке). Каждый сценарий: id, title, hook, targetAudience, callToAction, visualStyle, narrative, beats[] с title, description, durationSeconds. Держись исходной тематики и избегай эзотерики/политики.',
      },
      {
        role: 'user',
        content: JSON.stringify({ analyses: analyses.slice(0, 10) }),
      },
    ]);

    return result.scenarios;
  },

  async generateShootingGuide(scenarios: VideoScenario[]): Promise<ShootingGuide> {
    const guide = await requestJson<ShootingGuide>('generateTips', [
      {
        role: 'system',
        content:
          'Ты производственный консультант. Верни JSON с keyMoments[], productionCalendar[], tips[] (id, category, headline, summary, tips[], equipment[], optional backupPlan). Все текстовые поля — на русском и по теме исходного запроса.',
      },
      {
        role: 'user',
        content: JSON.stringify({ scenarios }),
      },
    ]);

    return normalizeGuide({
      ...guide,
      tips: Array.isArray(guide.tips) ? guide.tips : [],
    });
  },
};

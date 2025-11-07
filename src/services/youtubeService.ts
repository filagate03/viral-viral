import { attachYoutubeKey, getYoutubeClient } from '@/services/apiClient';
import { defaultTrendThreshold, youtubeMaxPageSize } from '@/styles/theme';
import type { ScraperError, ScraperStageKey, VideoData } from '@/types';

interface SearchResponseItem {
  id: { videoId?: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails?: Record<string, { url: string }>;
    tags?: string[];
  };
}

interface SearchResponse {
  items: SearchResponseItem[];
  nextPageToken?: string;
}

interface VideoResponseItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    thumbnails?: Record<string, { url: string }>;
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  contentDetails?: {
    duration?: string;
  };
}

interface VideoResponse {
  items: VideoResponseItem[];
}

interface SearchProfile {
  order: 'relevance' | 'date' | 'viewCount';
  videoDuration?: 'short' | 'medium' | 'long';
  publishedAfterDays: number;
  videoCategoryId?: string;
}

const dayInMs = 1000 * 60 * 60 * 24;
const viralViewThreshold = 750_000;
const fallbackViewThreshold = 200_000;
const shortDurationLimit = 90;

const qualityModifiers = [
  'аналитика',
  'обзор',
  'разбор трендов',
  'viral shorts',
  'короткое видео',
  'best cases',
  'case study',
  'explain',
  'podcast',
];

const lowQualityPatterns = [
  /детск/iu,
  /kids?/i,
  /мульт/iu,
  /мем/iu,
  /roblox/iu,
  /minecraft/iu,
];

const lowQualityTagHints = ['kids', 'детям', 'мем', 'мульт', 'roblox', 'игрушки'];

const techKeywords = [/нейросет/iu, /искусствен/iu, /ai/i, /ml/i, /machine learning/i, /technology/iu, /генератив/iu];

const baseSearchProfiles: SearchProfile[] = [
  { order: 'viewCount', videoDuration: 'short', publishedAfterDays: 45 },
  { order: 'relevance', videoDuration: 'short', publishedAfterDays: 90 },
  { order: 'date', videoDuration: 'short', publishedAfterDays: 30 },
  { order: 'viewCount', videoDuration: 'medium', publishedAfterDays: 180 },
  { order: 'relevance', videoDuration: 'medium', publishedAfterDays: 120 },
  { order: 'viewCount', publishedAfterDays: 365 },
];

const toScraperError = (stage: ScraperStageKey, message: string, hint?: string): ScraperError => {
  const error = new Error(message) as ScraperError;
  error.stage = stage;
  error.hint = hint;
  return error;
};

const isoDurationToSeconds = (isoDuration?: string): number => {
  if (!isoDuration) return 0;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, hoursStr, minutesStr, secondsStr] = match;
  const hours = Number(hoursStr ?? 0);
  const minutes = Number(minutesStr ?? 0);
  const seconds = Number(secondsStr ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const secondsToDuration = (seconds: number): string => {
  if (seconds === 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
};

const calculateTrendScore = (viewCount: number, likeCount: number, commentCount: number): number => {
  const engagement = likeCount * 2 + commentCount * 3;
  const baseScore = Math.min(100, Math.log10(viewCount + 1) * 22 + Math.log10(engagement + 10) * 16);
  return Math.round(baseScore);
};

const collectSearchIds = async (
  query: string,
  limit: number,
  profile: SearchProfile,
  forceTechCategory: boolean,
): Promise<string[]> => {
  const client = getYoutubeClient();
  let pageToken: string | undefined;
  const ids = new Set<string>();

  while (ids.size < limit) {
    const params = attachYoutubeKey({
      part: 'snippet',
      type: 'video',
      order: profile.order,
      maxResults: Math.min(youtubeMaxPageSize, limit - ids.size),
      q: query,
      pageToken,
      relevanceLanguage: 'ru',
      regionCode: 'RU',
      publishedAfter: new Date(Date.now() - profile.publishedAfterDays * dayInMs).toISOString(),
      safeSearch: 'none',
      videoDuration: profile.videoDuration,
      videoCategoryId: forceTechCategory ? '28' : profile.videoCategoryId,
    });

    const { data } = await client.get<SearchResponse>('/search', { params });
    data.items.forEach((item) => {
      if (item.id.videoId) {
        ids.add(item.id.videoId);
      }
    });

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return Array.from(ids);
};

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const fetchDetails = async (ids: string[]): Promise<VideoData[]> => {
  const client = getYoutubeClient();
  const batches = chunk(ids, youtubeMaxPageSize);
  const aggregated: VideoData[] = [];

  for (const batch of batches) {
    const params = attachYoutubeKey({
      part: 'snippet,statistics,contentDetails',
      id: batch.join(','),
    });

    const { data } = await client.get<VideoResponse>('/videos', { params });
    data.items.forEach((item) => {
      const viewCount = Number(item.statistics?.viewCount ?? 0);
      const likeCount = Number(item.statistics?.likeCount ?? 0);
      const commentCount = Number(item.statistics?.commentCount ?? 0);
      const durationSeconds = isoDurationToSeconds(item.contentDetails?.duration);
      const trendScore = calculateTrendScore(viewCount, likeCount, commentCount);

      aggregated.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails?.maxres?.url ??
          item.snippet.thumbnails?.high?.url ??
          item.snippet.thumbnails?.default?.url ?? '',
        tags: item.snippet.tags ?? [],
        viewCount,
        likeCount,
        commentCount,
        duration: secondsToDuration(durationSeconds),
        durationSeconds,
        trendScore,
        url: `https://www.youtube.com/watch?v=${item.id}`,
      });
    });
  }

  return aggregated;
};

const isShortFormVideo = (video: VideoData): boolean => {
  const hasShortTag = /#?shorts?/i.test(`${video.title} ${video.description} ${video.tags.join(' ')}`);
  return video.durationSeconds <= shortDurationLimit || hasShortTag;
};

const isViralVideo = (video: VideoData): boolean => video.viewCount >= viralViewThreshold;

const isViralShort = (video: VideoData): boolean => isShortFormVideo(video) && isViralVideo(video);

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-zа-я0-9ё]+/iu)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const expandTechKeywords = (tokens: string[]): string[] => {
  const markers = ['ai', 'ии', 'нейросеть', 'нейросети', 'искусственный', 'интеллект'];
  const hasMarker = tokens.some((token) => markers.some((marker) => token.includes(marker)));
  if (!hasMarker) {
    return tokens;
  }
  return Array.from(
    new Set([
      ...tokens,
      'искусственный интеллект',
      'нейросеть',
      'нейросети',
      'ai',
      'ml',
      'machine learning',
      'artificial intelligence',
    ]),
  );
};

interface SeedKeywords {
  all: string[];
  lexical: string[];
}

const buildSeedKeywords = (query: string): SeedKeywords => {
  const expanded = expandTechKeywords(tokenize(query));
  const lexical = expanded.filter((token) => /[a-zа-яё]/iu.test(token));
  return {
    all: expanded,
    lexical,
  };
};

const videoMatchesKeywords = (video: VideoData, keywords: SeedKeywords): boolean => {
  if (keywords.all.length === 0) return true;
  const haystack = `${video.title} ${video.description} ${video.tags.join(' ')}`.toLowerCase();
  const lexicalPool = keywords.lexical.length > 0 ? keywords.lexical : keywords.all;
  const matchesLexical = lexicalPool.some((keyword) => haystack.includes(keyword));
  const matchesRegex = techKeywords.some((pattern) => pattern.test(haystack));
  return matchesLexical || matchesRegex;
};

const shouldForceTechCategory = (query: string): boolean => {
  return techKeywords.some((pattern) => pattern.test(query));
};

const buildQueryVariants = (query: string): string[] => {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }
  const variants = new Set<string>([normalized]);
  qualityModifiers.forEach((modifier) => {
    variants.add(`${normalized} ${modifier}`.trim());
  });
  if (!normalized.toLowerCase().includes('новости')) {
    variants.add(`новости ${normalized}`.trim());
  }
  return Array.from(variants).slice(0, 8);
};

const isLowQualityVideo = (video: VideoData): boolean => {
  const haystack = `${video.title} ${video.description} ${video.channelTitle}`.toLowerCase();
  if (lowQualityPatterns.some((pattern) => pattern.test(haystack))) {
    return true;
  }
  if (video.tags.some((tag) => lowQualityTagHints.some((hint) => tag.toLowerCase().includes(hint)))) {
    return true;
  }
  if (!isViralVideo(video) && !isShortFormVideo(video) && video.viewCount < fallbackViewThreshold) {
    return true;
  }
  return false;
};

const calculateQualityScore = (video: VideoData): number => {
  const engagement = (video.likeCount + video.commentCount * 2) / Math.max(video.viewCount, 1);
  const recencyDays = (Date.now() - new Date(video.publishedAt).getTime()) / dayInMs;
  const recencyBoost = recencyDays <= 30 ? 25 : recencyDays <= 90 ? 12 : recencyDays <= 180 ? 6 : 0;
  const shortBoost = isShortFormVideo(video) ? 18 : video.durationSeconds <= 240 ? 6 : 0;
  const viralBoost = isViralShort(video) ? 30 : isViralVideo(video) ? 10 : 0;
  const viewBoost = Math.log10(video.viewCount + 1) * 30;
  return Math.round(video.trendScore + engagement * 420 + recencyBoost + shortBoost + viralBoost + viewBoost);
};

export const youtubeService = {
  async fetchTrendingVideos(queries: string[], requestCount: number): Promise<VideoData[]> {
    try {
      const collected = new Map<string, VideoData>();
      const expandedQueries = queries.flatMap((query) => buildQueryVariants(query));
      const queriesToRun = (expandedQueries.length > 0 ? expandedQueries : queries).slice(0, 30);
      const seedKeywords = buildSeedKeywords(queries[0] ?? '');
      const targetPool = Math.min(Math.max(requestCount * 2, requestCount + 10), 800);

      for (const query of queriesToRun) {
        if (collected.size >= targetPool) {
          break;
        }
        const forceTechCategory = shouldForceTechCategory(query);
        for (const profile of baseSearchProfiles) {
          if (collected.size >= targetPool) {
            break;
          }
          const remaining = targetPool - collected.size;
          if (remaining <= 0) {
            break;
          }
          const ids = await collectSearchIds(query, remaining, profile, forceTechCategory);
          if (ids.length === 0) continue;
          const details = await fetchDetails(ids);
          details.forEach((video) => {
            if (collected.has(video.id)) {
              return;
            }
            if (!videoMatchesKeywords(video, seedKeywords)) {
              return;
            }
            if (!collected.has(video.id)) {
              collected.set(video.id, video);
            }
          });
        }
      }

      const pool = Array.from(collected.values());
      const cleanedPool = pool.filter((video) => !isLowQualityVideo(video));
      const viralShorts = cleanedPool.filter((video) => isViralShort(video));
      const viralVideos = cleanedPool.filter((video) => isViralVideo(video) && !isViralShort(video));
      const momentumShorts = cleanedPool.filter((video) => isShortFormVideo(video) && video.viewCount >= fallbackViewThreshold);

      const prioritized = [
        ...viralShorts,
        ...viralVideos,
        ...momentumShorts,
        ...cleanedPool,
      ];
      const unique = Array.from(new Map(prioritized.map((video) => [video.id, video])).values());

      return unique
        .sort((a, b) => calculateQualityScore(b) - calculateQualityScore(a))
        .slice(0, requestCount);
    } catch (error) {
      throw toScraperError(
        'fetchVideos',
        'Ошибка запроса к YouTube API. Проверьте квоты и параметры поиска.',
        'Убедитесь, что ключ YouTube Data API активирован для методов search и videos.',
      );
    }
  },

  summarizeTrends(videos: VideoData[]): {
    total: number;
    strongPerformers: VideoData[];
    needsImprovement: VideoData[];
  } {
    const strongPerformers = videos.filter((video) => video.trendScore >= defaultTrendThreshold);
    const needsImprovement = videos.filter((video) => video.trendScore < defaultTrendThreshold);

    return {
      total: videos.length,
      strongPerformers,
      needsImprovement,
    };
  },
};

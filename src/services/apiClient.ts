import axios from 'axios';
import type { AxiosInstance } from 'axios';

let openAiClient: AxiosInstance | null = null;
let youtubeClient: AxiosInstance | null = null;

let runtimeOpenAiKey: string | null = null;
let runtimeOpenAiProject: string | null = null;
let runtimeYoutubeKey: string | null = null;

const resolveValue = (runtime: string | null | undefined, envValue: string | undefined, name: string): string => {
  const value = (runtime ?? '').trim() || (envValue ?? '').trim();
  if (!value) {
    throw new Error(`Missing required credential: ${name}`);
  }
  return value;
};

export const setOpenAiCredentials = ({
  apiKey,
  projectId,
}: {
  apiKey?: string;
  projectId?: string;
}) => {
  runtimeOpenAiKey = apiKey?.trim() ?? null;
  runtimeOpenAiProject = projectId?.trim() ?? null;
  openAiClient = null;
};

export const setYoutubeApiKey = (apiKey?: string) => {
  runtimeYoutubeKey = apiKey?.trim() ?? null;
  youtubeClient = null;
};

export const getOpenAiClient = (): AxiosInstance => {
  if (openAiClient) return openAiClient;

  const apiKey = resolveValue(runtimeOpenAiKey, import.meta.env.VITE_OPENAI_API_KEY, 'OpenAI API key');
  const projectId = (runtimeOpenAiProject ?? '').trim() || (import.meta.env.VITE_OPENAI_PROJECT_ID ?? '').trim();

  openAiClient = axios.create({
    baseURL: 'https://api.openai.com/v1',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(projectId ? { 'OpenAI-Project': projectId } : {}),
    },
    timeout: 60_000,
  });

  return openAiClient;
};

export const getYoutubeClient = (): AxiosInstance => {
  if (youtubeClient) return youtubeClient;

  youtubeClient = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
    timeout: 30_000,
  });

  return youtubeClient;
};

export const attachYoutubeKey = (
  params: Record<string, string | number | undefined>,
): Record<string, string | number> => {
  const apiKey = resolveValue(runtimeYoutubeKey, import.meta.env.VITE_YOUTUBE_API_KEY, 'YouTube Data API key');
  return {
    ...params,
    key: apiKey,
  };
};

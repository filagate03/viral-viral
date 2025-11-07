import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { setOpenAiCredentials, setYoutubeApiKey } from '@/services/apiClient';
import type { AppSettings, SettingsContextValue } from '@/types';

const STORAGE_KEY = 'viral-os::settings';

const defaultSettings: AppSettings = {
  openAiApiKey: '',
  openAiProjectId: '',
  youtubeApiKey: '',
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const readSettingsFromStorage = (): AppSettings => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      openAiApiKey: parsed.openAiApiKey ?? '',
      openAiProjectId: parsed.openAiProjectId ?? '',
      youtubeApiKey: parsed.youtubeApiKey ?? '',
    };
  } catch (error) {
    console.warn('Failed to parse stored settings', error);
    return defaultSettings;
  }
};

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = readSettingsFromStorage();
    setSettings(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Unable to persist settings', error);
    }
  }, [settings, hydrated]);

  useEffect(() => {
    setOpenAiCredentials({
      apiKey: settings.openAiApiKey,
      projectId: settings.openAiProjectId,
    });
    setYoutubeApiKey(settings.youtubeApiKey);
  }, [settings]);

  const updateSettings = useCallback((values: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...values,
    }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const value = useMemo<SettingsContextValue>(() => ({
    settings,
    updateSettings,
    resetSettings,
  }), [settings, updateSettings, resetSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettingsContext = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }
  return context;
};

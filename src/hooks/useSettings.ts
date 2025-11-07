import { useMemo } from 'react';
import { useSettingsContext } from '@/context/SettingsContext';

export const useSettings = () => {
  const { settings, updateSettings, resetSettings } = useSettingsContext();

  const isConfigured = useMemo(() => {
    return Boolean(settings.openAiApiKey && settings.youtubeApiKey);
  }, [settings.openAiApiKey, settings.youtubeApiKey]);

  return {
    settings,
    updateSettings,
    resetSettings,
    isConfigured,
  };
};

import { useMemo } from 'react';
import { useScraperContext } from '@/context/ScraperContext';
import { youtubeService } from '@/services/youtubeService';

export const useScraper = () => {
  const context = useScraperContext();

  const videoSegments = useMemo(() => {
    if (context.videos.length === 0) {
      return null;
    }

    return youtubeService.summarizeTrends(context.videos);
  }, [context.videos]);

  return {
    ...context,
    videoSegments,
  };
};

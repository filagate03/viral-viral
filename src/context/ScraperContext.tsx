import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import { scraperPipeline } from '@/services/scraperPipeline';
import { applyStageUpdate, buildInitialProgress, resetProgress } from '@/utils/progress';
import type {
  PipelineStageUpdate,
  ScraperContextState,
  ScraperContextValue,
  ScraperFormValues,
  ScraperStageKey,
} from '@/types';

const initialState: ScraperContextState = {
  formValues: null,
  queries: [],
  videos: [],
  analysis: [],
  scenarios: [],
  guide: null,
  progress: buildInitialProgress(),
  isRunning: false,
  error: undefined,
};

const ScraperContext = createContext<ScraperContextValue | undefined>(undefined);

export const ScraperProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<ScraperContextState>(initialState);

  const handleStageUpdate = useCallback((update: PipelineStageUpdate) => {
    setState((prev) => ({
      ...prev,
      progress: applyStageUpdate(prev.progress, update),
    }));
  }, []);

  const mutation = useMutation({
    mutationFn: async (values: ScraperFormValues) => scraperPipeline.runPipeline(values, handleStageUpdate),
    onMutate: async (values) => {
      setState((prev) => ({
        ...prev,
        isRunning: true,
        error: undefined,
        formValues: values,
        progress: resetProgress(),
      }));
    },
    onSuccess: (result) => {
      setState((prev) => ({
        ...prev,
        ...result,
        isRunning: false,
        error: undefined,
        progress: {
          ...prev.progress,
          percent: 100,
          completedCount: prev.progress.total,
        },
      }));
    },
    onError: (error) => {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Неожиданная ошибка пайплайна',
      }));
    },
  });

  const startScrape = useCallback(async (values: ScraperFormValues) => {
    await mutation.mutateAsync(values);
  }, [mutation]);

  const retryStage = useCallback(async (_stage?: ScraperStageKey) => {
    if (!state.formValues) return;
    await startScrape(state.formValues);
  }, [startScrape, state.formValues]);

  const reset = useCallback(() => {
    setState(initialState);
    mutation.reset();
  }, [mutation]);

  const value = useMemo<ScraperContextValue>(() => ({
    ...state,
    startScrape,
    retryStage,
    reset,
  }), [state, startScrape, retryStage, reset]);

  return <ScraperContext.Provider value={value}>{children}</ScraperContext.Provider>;
};

export const useScraperContext = (): ScraperContextValue => {
  const ctx = useContext(ScraperContext);
  if (!ctx) {
    throw new Error('useScraperContext must be used within a ScraperProvider');
  }
  return ctx;
};

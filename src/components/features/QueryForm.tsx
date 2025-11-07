import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { useScraper } from '@/hooks/useScraper';
import { useSettings } from '@/hooks/useSettings';
import { requestCountMarks } from '@/styles/theme';
import type { ScraperFormValues } from '@/types';

const formSchema = z.object({
  searchQuery: z
    .string()
    .trim()
    .min(3, 'Введите минимум 3 символа')
    .max(120, 'Формулируйте запрос короче (до 120 символов).'),
  requestCount: z.number().min(10).max(1000),
});

export const QueryForm = () => {
  const { startScrape, isRunning, formValues, progress } = useScraper();
  const { isConfigured } = useSettings();
  const envPrefilled = Boolean(import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_YOUTUBE_API_KEY);
  const needsKeys = !isConfigured && !envPrefilled;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ScraperFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: formValues ?? { searchQuery: '', requestCount: 100 },
  });

  const requestCount = watch('requestCount');

  const onSubmit = handleSubmit(async (values) => {
    await startScrape(values);
  });

  return (
    <Card
      dense
      header={
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember-500/30 text-ember-100">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Брифинг с подсказками ИИ</h2>
            <p className="text-xs text-slate-400">
              Опишите идею и выберите сколько видео анализируем.
            </p>
          </div>
        </div>
      }
      footer={`Прогресс: ${progress.completedCount}/${progress.total} этапов завершено`}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Input
          label="Исходная идея"
          placeholder="Например: Аналитика рынка ИИ в 2025"
          helper="Мы расширим запросы с помощью ИИ, затем соберём трендовые ролики."
          error={errors.searchQuery?.message}
          {...register('searchQuery')}
          leadingIcon={<Search className="h-4 w-4" />}
        />
        <Controller
          control={control}
          name="requestCount"
          render={({ field }) => (
            <Slider
              label="Видео для анализа"
              value={field.value}
              min={10}
              max={1000}
              step={10}
              marks={requestCountMarks}
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
        {needsKeys && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-100">
            Для запуска пайплайна добавьте ключи OpenAI и YouTube через кнопку <span className="font-semibold">Настройки</span> в шапке приложения.
          </div>
        )}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span>Оценка времени</span>
            <span className="font-semibold text-ember-300">
              {Math.ceil(requestCount / 50)} - {Math.ceil(requestCount / 20)} сек.
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Расход квоты YouTube</span>
            <span className="font-semibold text-slate-200">{Math.ceil(requestCount / 50)} единиц</span>
          </div>
        </div>
        <Button type="submit" size="lg" loading={isRunning} disabled={needsKeys} icon={<Sparkles className="h-5 w-5" />}>
          {isRunning ? 'Пайплайн в работе…' : 'Запустить анализ'}
        </Button>
      </form>
    </Card>
  );
};

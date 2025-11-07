import { useEffect, useMemo, useState } from 'react';
import { Shield, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useSettings } from '@/hooks/useSettings';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  openAiApiKey: string;
  openAiProjectId: string;
  youtubeApiKey: string;
}

export const SettingsPanel = ({ open, onClose }: SettingsPanelProps) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [form, setForm] = useState<FormState>(settings);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(settings);
      setShowSecrets(false);
    }
  }, [open, settings]);

  const isDirty = useMemo(() => {
    return (
      form.openAiApiKey !== settings.openAiApiKey ||
      form.openAiProjectId !== settings.openAiProjectId ||
      form.youtubeApiKey !== settings.youtubeApiKey
    );
  }, [form, settings]);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings(form);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setForm({
      openAiApiKey: '',
      openAiProjectId: '',
      youtubeApiKey: '',
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10">
      <Card className="w-full max-w-xl gap-0 p-0">
        <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/80 px-6 py-4">
          <div className="flex items-center gap-3 text-sm text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ember-500/30 text-ember-100">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Параметры API</h2>
              <p className="text-xs text-slate-400">Ключи хранятся локально в браузере и не передаются третьим лицам.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-transparent px-3 py-1 text-xs uppercase tracking-wide text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
          >
            Закрыть
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-6 py-6">
          <div className="grid gap-4">
            <Input
              label="Ключ OpenAI API"
              placeholder="sk-..."
              type={showSecrets ? 'text' : 'password'}
              value={form.openAiApiKey}
              onChange={handleChange('openAiApiKey')}
              autoComplete="off"
            />
            <Input
              label="ID проекта OpenAI (опционально)"
              placeholder="proj_..."
              value={form.openAiProjectId}
              onChange={handleChange('openAiProjectId')}
              autoComplete="off"
            />
            <Input
              label="Ключ YouTube Data API"
              placeholder="AIza..."
              type={showSecrets ? 'text' : 'password'}
              value={form.youtubeApiKey}
              onChange={handleChange('youtubeApiKey')}
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-ember-200">
              <Sparkles className="h-4 w-4" />
              <span>После сохранения пайплайн использует указанные ключи без перезапуска.</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Wand2 className="h-4 w-4" />
              <span>Ключи можно сбросить — данные удаляются из localStorage.</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <input
                id="toggle-secret"
                type="checkbox"
                checked={showSecrets}
                onChange={(event) => setShowSecrets(event.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-ember-400 focus:ring-ember-500"
              />
              <label htmlFor="toggle-secret">Показать символы ключей</label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={handleReset}>
                Сбросить
              </Button>
              <Button type="submit" variant="primary" disabled={!isDirty}>
                Сохранить
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

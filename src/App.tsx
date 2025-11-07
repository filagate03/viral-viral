import { QueryForm } from '@/components/features/QueryForm';
import { ProgressPanel } from '@/components/features/ProgressPanel';
import { ScenarioPanel } from '@/components/features/ScenarioPanel';
import { TipsAccordion } from '@/components/features/TipsAccordion';
import { VideoGrid } from '@/components/features/VideoGrid';
import { AnalysisPanel } from '@/components/features/AnalysisPanel';
import { AppLayout } from '@/components/layout/AppLayout';

const App = () => {
  return (
    <AppLayout>
      <section className="grid gap-6 lg:grid-cols-[360px_1fr] lg:gap-7">
        <div className="space-y-6">
          <QueryForm />
          <ProgressPanel />
        </div>
        <div className="space-y-6">
          <VideoGrid />
          <AnalysisPanel />
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <ScenarioPanel />
        <TipsAccordion />
      </section>
    </AppLayout>
  );
};

export default App;

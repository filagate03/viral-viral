import { Film, Flame, Gauge } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tag } from '@/components/ui/Tag';
import { useScraper } from '@/hooks/useScraper';
import { formatNumber, isoToRelative, trendColor } from '@/utils/format';

export const VideoGrid = () => {
  const { videos, isRunning, videoSegments } = useScraper();

  if (isRunning && videos.length === 0) {
    return (
      <Card tone="muted" header={<h2 className="text-base font-semibold text-white">Видеоаналитика</h2>}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-3xl" />
          ))}
        </div>
      </Card>
    );
  }

  if (videos.length === 0) {
    return (
      <Card tone="muted" header={<h2 className="text-base font-semibold text-white">Видеоаналитика</h2>}>
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-slate-400">
          <Film className="h-10 w-10 text-slate-600" />
          <p className="text-sm">Запустите поиск, чтобы получить подборку.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      header={
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-white">Видеоаналитика</h2>
          {videoSegments && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1">
                <Flame className="h-3.5 w-3.5 text-ember-300" />
                {videoSegments.strongPerformers.length} сильных кандидатов
              </span>
              <span className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1">
                <Gauge className="h-3.5 w-3.5 text-slate-400" />
                {videoSegments.needsImprovement.length} стоит доработать
              </span>
            </div>
          )}
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {videos.slice(0, 9).map((video) => (
          <div key={video.id} className="group flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="relative overflow-hidden rounded-2xl">
              <img src={video.thumbnailUrl} alt={video.title} className="aspect-video w-full object-cover" />
              <div className="absolute left-3 top-3">
                <Tag className={trendColor(video.trendScore)}>{video.trendScore} баллов</Tag>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-white hover:text-ember-300"
              >
                {video.title}
              </a>
              <span className="text-xs text-slate-400">{video.channelTitle} · {isoToRelative(video.publishedAt)}</span>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span>{formatNumber(video.viewCount)} просмотров</span>
                <span>· {formatNumber(video.likeCount)} лайков</span>
                <span>· {formatNumber(video.commentCount)} комментариев</span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-ember-100">
                {video.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-ember-500/10 px-2 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

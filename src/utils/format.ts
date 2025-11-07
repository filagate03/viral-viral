export const formatNumber = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

export const formatPercent = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const isoToRelative = (iso: string): string => {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  }
  if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} months ago`;
  }
  return `${Math.floor(diffDays / 365)} years ago`;
};

export const secondsToClock = (duration: number): string => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
};

export const trendColor = (score: number): string => {
  if (score >= 85) return 'bg-ember-500 text-white';
  if (score >= 70) return 'bg-ember-400/80 text-white';
  return 'bg-slate-800 text-slate-200';
};

export const riskToColor = (risk: 'low' | 'medium' | 'high'): string => {
  switch (risk) {
    case 'low':
      return 'text-emerald-400';
    case 'medium':
      return 'text-amber-300';
    case 'high':
      return 'text-ember-400';
    default:
      return 'text-slate-300';
  }
};

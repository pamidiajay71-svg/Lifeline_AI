import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/lib/supabase';

const RISK_META: Record<RiskLevel, { color: string; bg: string; pct: number; label: string }> = {
  low: { color: 'text-risk-low', bg: 'stroke-risk-low', pct: 25, label: 'risk.low' },
  medium: { color: 'text-risk-medium', bg: 'stroke-risk-medium', pct: 55, label: 'risk.medium' },
  high: { color: 'text-risk-high', bg: 'stroke-risk-high', pct: 80, label: 'risk.high' },
  critical: { color: 'text-risk-critical', bg: 'stroke-risk-critical', pct: 100, label: 'risk.critical' },
};

export function RiskGauge({ level, size = 180 }: { level: RiskLevel; size?: number }) {
  const meta = RISK_META[level];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const id = requestAnimationFrame(() => {
      setProgress(meta.pct);
    });
    return () => cancelAnimationFrame(id);
  }, [meta.pct]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center" role="status" aria-live="polite">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 200 200" className="-rotate-90">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth="16"
            className="stroke-muted"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth="16"
            strokeLinecap="round"
            className={cn('transition-all duration-1000 ease-out', meta.bg)}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-4xl font-bold', meta.color)}>{meta.pct}%</span>
          <span className="mt-1 text-sm font-medium text-muted-foreground">Urgency</span>
        </div>
      </div>
    </div>
  );
}

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const meta = RISK_META[level];
  const dotColor = {
    low: 'bg-risk-low',
    medium: 'bg-risk-medium',
    high: 'bg-risk-high',
    critical: 'bg-risk-critical',
  }[level];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold',
        'border-current/20',
        meta.color,
        className
      )}
    >
      <span className={cn('h-2.5 w-2.5 rounded-full', dotColor)} />
      {meta.label}
    </span>
  );
}

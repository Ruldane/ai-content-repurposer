'use client';

import { useMemo } from 'react';
import { analyzeContent } from '@/lib/score';
import { getCharCount } from '@/lib/metrics';
import type { Format } from '@/types';

interface ContentScoreProps {
  content: string;
  format: Format | string;
}

const PLATFORM_LIMITS: Record<string, number | null> = {
  linkedin: 3000,
  twitter: 280,
  email: null,
  docs: null,
};

function ScoreRing({ value, color }: { value: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  const strokeColor =
    color === 'green'
      ? 'oklch(0.6 0.17 150)'
      : color === 'yellow'
        ? 'oklch(0.75 0.17 85)'
        : 'oklch(0.6 0.2 25)';

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/40" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
      <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill={strokeColor}>
        {value}
      </text>
    </svg>
  );
}

function ProgressBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor =
    pct > 90
      ? 'bg-red-500'
      : pct > 70
        ? 'bg-yellow-500'
        : 'bg-[oklch(0.55_0.15_250)]';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{value.toLocaleString()} / {max.toLocaleString()} chars</span>
        <span className={pct > 90 ? 'text-red-500 font-semibold' : ''}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', icon: '😊', cls: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  neutral:  { label: 'Neutral',  icon: '😐', cls: 'bg-muted text-muted-foreground' },
  negative: { label: 'Negative', icon: '😟', cls: 'bg-red-500/10 text-red-600 dark:text-red-400' },
};

export default function ContentScore({ content, format }: ContentScoreProps) {
  const score = useMemo(() => analyzeContent(content), [content]);
  const charCount = getCharCount(content);
  const limit = PLATFORM_LIMITS[format] ?? null;
  const sent = SENTIMENT_CONFIG[score.sentiment];

  if (!content) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Generate content to see quality metrics
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {/* Top row: readability ring + sentiment + stats */}
      <div className="flex items-start gap-5">
        {/* Readability ring */}
        <div className="flex flex-col items-center gap-1">
          <ScoreRing value={score.readability} color={score.readabilityColor} />
          <span className="text-xs font-medium text-muted-foreground">Readability</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
              score.readabilityColor === 'green'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : score.readabilityColor === 'yellow'
                  ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {score.readabilityLabel}
          </span>
        </div>

        {/* Stats grid */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {/* Sentiment */}
          <div className="col-span-2 flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">Tone</span>
            <span className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${sent.cls}`}>
              {sent.icon} {sent.label}
            </span>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Words</div>
            <div className="text-base font-bold text-foreground">{score.wordCount}</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Sentences</div>
            <div className="text-base font-bold text-foreground">{score.sentenceCount}</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Avg sentence</div>
            <div className="text-base font-bold text-foreground">{score.avgSentenceLength} <span className="text-xs font-normal text-muted-foreground">words</span></div>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Avg word</div>
            <div className="text-base font-bold text-foreground">{score.avgWordLength} <span className="text-xs font-normal text-muted-foreground">chars</span></div>
          </div>
        </div>
      </div>

      {/* Platform character limit bar */}
      {limit && (
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-foreground capitalize">
              {format} limit
            </span>
            {charCount > limit && (
              <span className="text-xs font-semibold text-red-500">
                {(charCount - limit).toLocaleString()} over limit
              </span>
            )}
          </div>
          <ProgressBar value={charCount} max={limit} color="" />
        </div>
      )}
    </div>
  );
}

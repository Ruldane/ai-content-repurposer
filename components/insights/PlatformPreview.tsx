'use client';

import { useMemo } from 'react';
import type { Format } from '@/types';

interface PlatformPreviewProps {
  content: string;
  format: Format | string;
}

/* ──────────────────────────── helpers ──────────────────────────── */

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ background: color }}
    >
      {initials}
    </div>
  );
}

function parseEmailFields(content: string) {
  const lines = content.split('\n');
  const subject = lines.find((l) => /^subject:/i.test(l))?.replace(/^subject:\s*/i, '') ?? '';
  const preview = lines.find((l) => /^preview:/i.test(l))?.replace(/^preview:\s*/i, '') ?? '';
  const body = lines
    .filter((l) => !/^(subject|preview|from|to):/i.test(l))
    .join('\n')
    .trim();
  return { subject, preview, body };
}

function parseTwitterThreads(content: string): string[] {
  // Split on "1/" "2/" style thread numbering or double newline
  const byNumber = content.split(/\n\s*\d+\/\s*\n/).filter(Boolean);
  if (byNumber.length > 1) return byNumber.map((t) => t.trim()).slice(0, 4);
  return [content.slice(0, 280)];
}

/* ──────────────────────────── previews ──────────────────────────── */

function LinkedInPreview({ content }: { content: string }) {
  const truncated = content.length > 500 ? content.slice(0, 497) + '…' : content;
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="h-14 bg-gradient-to-r from-[oklch(0.45_0.18_250)] to-[oklch(0.35_0.2_270)]" />
      <div className="px-5 pb-4">
        {/* Avatar overlapping header */}
        <div className="-mt-6 mb-3 flex items-end justify-between">
          <Avatar initials="YN" color="oklch(0.45 0.18 250)" />
          <button className="rounded-full border border-[oklch(0.45_0.18_250)] px-3 py-1 text-xs font-semibold text-[oklch(0.45_0.18_250)] hover:bg-[oklch(0.45_0.18_250/8%)]">
            + Follow
          </button>
        </div>
        <div className="mb-3">
          <div className="text-sm font-semibold text-foreground">Your Name</div>
          <div className="text-xs text-muted-foreground">Content Creator · 500+ connections</div>
        </div>
        <p className="whitespace-pre-line text-sm text-foreground/90 leading-relaxed">
          {truncated}
        </p>
        {/* Reactions bar */}
        <div className="mt-4 border-t border-border/50 pt-2 flex gap-5 text-xs text-muted-foreground">
          {['👍 Like', '💬 Comment', '↗ Share'].map((label) => (
            <button
              key={label}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TwitterPreview({ content }: { content: string }) {
  const tweets = parseTwitterThreads(content);
  return (
    <div className="space-y-2">
      {tweets.map((tweet, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex gap-3">
            <Avatar initials="YN" color="#1d9bf0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-foreground">Your Name</span>
                <span className="text-xs text-muted-foreground">@yourhandle</span>
                {tweets.length > 1 && (
                  <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {i + 1}/{tweets.length}
                  </span>
                )}
              </div>
              <p className="mt-1.5 whitespace-pre-line text-sm text-foreground/90 leading-relaxed">
                {tweet.slice(0, 280)}
              </p>
              {tweet.length > 280 && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  ⚠ Over 280 chars ({tweet.length})
                </p>
              )}
              <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
                {['♡ 0', '⟳ 0', '↗'].map((label) => (
                  <span
                    key={label}
                    className="flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors"
                  >
                    {label}
                  </span>
                ))}
                <span className="ml-auto text-[11px]">
                  {tweet.length > 280 ? (
                    <span className="text-red-500 font-medium">{tweet.length}/280</span>
                  ) : (
                    <span className="text-muted-foreground">{tweet.length}/280</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmailPreview({ content }: { content: string }) {
  const { subject, preview, body } = parseEmailFields(content);
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden text-sm">
      {/* Email header */}
      <div className="border-b border-border bg-muted/30 px-4 py-3 space-y-1.5">
        <div className="flex gap-2">
          <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">From</span>
          <span className="text-xs text-foreground">you@example.com</span>
        </div>
        <div className="flex gap-2">
          <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">To</span>
          <span className="text-xs text-foreground">recipient@example.com</span>
        </div>
        {subject && (
          <div className="flex gap-2">
            <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">Subject</span>
            <span className="text-xs font-semibold text-foreground truncate">{subject}</span>
          </div>
        )}
        {preview && (
          <div className="flex gap-2">
            <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">Preview</span>
            <span className="text-xs text-muted-foreground italic truncate">{preview}</span>
          </div>
        )}
      </div>
      {/* Body */}
      <div className="px-4 py-3">
        <p className="whitespace-pre-line text-sm text-foreground/90 leading-relaxed max-h-48 overflow-y-auto">
          {body || content}
        </p>
      </div>
    </div>
  );
}

function DocsPreview({ content }: { content: string }) {
  const lines = useMemo(
    () =>
      content
        .split('\n')
        .slice(0, 30)
        .map((line, i) => {
          const h1 = line.match(/^# (.+)/);
          const h2 = line.match(/^## (.+)/);
          const h3 = line.match(/^### (.+)/);
          const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          if (h1) return <h1 key={i} className="text-lg font-bold text-foreground mt-1">{h1[1]}</h1>;
          if (h2) return <h2 key={i} className="text-base font-semibold text-foreground mt-3 mb-1 border-b border-border pb-1">{h2[1]}</h2>;
          if (h3) return <h3 key={i} className="text-sm font-semibold text-foreground mt-2">{h3[1]}</h3>;
          if (!line.trim()) return <div key={i} className="h-2" />;
          return (
            <p
              key={i}
              className="text-sm text-foreground/85 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: bold }}
            />
          );
        }),
    [content]
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Doc chrome */}
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-2">
        <div className="size-2.5 rounded-full bg-red-400" />
        <div className="size-2.5 rounded-full bg-yellow-400" />
        <div className="size-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-xs text-muted-foreground">document.md</span>
      </div>
      <div className="p-4 max-h-56 overflow-y-auto space-y-0.5">{lines}</div>
    </div>
  );
}

/* ──────────────────────────── main export ──────────────────────────── */

export default function PlatformPreview({ content, format }: PlatformPreviewProps) {
  if (!content) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Generate content to see the platform preview
      </div>
    );
  }

  switch (format) {
    case 'linkedin':
      return <LinkedInPreview content={content} />;
    case 'twitter':
      return <TwitterPreview content={content} />;
    case 'email':
      return <EmailPreview content={content} />;
    case 'docs':
      return <DocsPreview content={content} />;
    default:
      return <LinkedInPreview content={content} />;
  }
}

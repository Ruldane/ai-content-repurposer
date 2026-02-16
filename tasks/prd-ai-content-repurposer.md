# Product Requirements Document: AI Content Repurposer

**Version:** 1.0
**Date:** February 6, 2026
**Author:** January / The Growth Angle
**Status:** Draft

---

## 1. Executive Summary

The AI Content Repurposer is a web application that transforms long-form content (blog posts, articles, newsletters) into platform-optimized formats in real-time. Users paste or upload markdown content and receive AI-generated variants for LinkedIn, Twitter/X, email newsletters, and documentation — all within a split-pane editor interface. Each output format can be refined, edited, and exported as individual `.md` files.

**Target Users:** Content creators, B2B marketers, solopreneurs, consultants, and GTM professionals who need to maximize a single piece of content across multiple distribution channels.

**Core Value Proposition:** Write once, publish everywhere — with AI-powered adaptation that respects each platform's tone, structure, and character constraints.

---

## 2. Problem Statement

Content creators and marketers face a recurring bottleneck: they invest significant effort in creating a single long-form piece (blog post, article, case study), but then need to manually adapt that content for 3–5 different platforms. This repurposing process is time-consuming, repetitive, and often results in poor-quality derivative content because creators rush through it or skip platforms entirely.

**Pain points:**
- Manual repurposing takes 30–60 minutes per format
- Tone and structure don't always translate well across platforms
- Creators default to copy-paste, losing platform-specific engagement
- No single tool handles the full repurposing workflow without subscriptions or complex setups

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js 16+ (App Router) | Server components, API routes, streaming |
| **AI Provider** | Z AI-compatible Anthropic API | Using `glm-4.7` model via Anthropic-compatible endpoint |
| **AI SDK** | Vercel AI SDK (`ai` package) | Streaming responses, Anthropic provider adapter |
| **Editor** | CodeMirror 6 | Lightweight, extensible, markdown mode built-in |
| **Markdown Parsing** | `unified` + `remark` + `rehype` | Parse → transform → render pipeline |
| **UI Components** | shadcn/ui (Radix primitives) | Accessible, composable, Tailwind-native |
| **Styling** | Tailwind CSS | Utility-first, responsive |
| **Storage** | Browser localStorage + File API | No backend database required |
| **Deployment** | Vercel (free tier) | Zero-config, edge-optimized |
| **Auth** | None (v1) | Optional Clerk integration in v2 |

### AI API Configuration

The application connects to a Z AI-compatible endpoint that mirrors the Anthropic Messages API format. The `glm-4.7` model is specified as the model identifier in all API calls.

```typescript
// Example: API route configuration
import { createAnthropic } from '@ai-sdk/anthropic';

const provider = createAnthropic({
  baseURL: process.env.Z_AI_BASE_URL,    // Z AI-compatible endpoint
  apiKey: process.env.Z_AI_API_KEY,
});

const model = provider('glm-4.7');
```

**Environment variables:**
- `Z_AI_BASE_URL` — Base URL of the Z AI-compatible Anthropic API
- `Z_AI_API_KEY` — API key for authentication

---

## 4. User Stories

### 4.1 Core User Stories

| ID | As a... | I want to... | So that... | Priority |
|---|---|---|---|---|
| US-01 | Content creator | Paste a blog post into the editor | I can use it as source material | P0 |
| US-02 | Content creator | Upload a `.md` file | I can import existing content | P0 |
| US-03 | Marketer | Select an output format (LinkedIn, Twitter, Email, Docs) | I get platform-specific content | P0 |
| US-04 | User | See original and AI output side-by-side | I can compare and verify quality | P0 |
| US-05 | User | Edit the AI-generated output directly | I can refine before publishing | P0 |
| US-06 | User | Export each format as a `.md` file | I can save or publish elsewhere | P0 |
| US-07 | User | Regenerate a specific output format | I can get alternative versions | P1 |
| US-08 | User | See word count and reading time for all outputs | I can gauge content length | P1 |
| US-09 | Power user | Customize tone/style per format via settings | Outputs match my brand voice | P1 |
| US-10 | User | View a live markdown preview of outputs | I can see rendered formatting | P2 |

### 4.2 Edge Cases

- **Empty input:** Show validation message, disable repurpose button
- **Very short input (<100 words):** Warn user that output quality may be limited
- **Very long input (>5,000 words):** Chunk and summarize before repurposing; show progress indicator
- **API timeout/failure:** Show error toast with retry option; preserve user's input
- **Partial streaming failure:** Display whatever was received with a "retry" action

---

## 5. Feature Specification

### 5.1 Content Input Panel (Left Pane)

**Description:** A full-height markdown editor where users write, paste, or upload source content.

**Requirements:**
- CodeMirror 6 instance with markdown syntax highlighting
- Drag-and-drop `.md` file upload
- "Upload file" button as fallback
- Paste detection for markdown content
- Live word count and estimated reading time in the footer
- Character count display
- "Clear" button with confirmation dialog
- Content persisted to localStorage on every change (debounced 500ms)
- Restore last session content on load with a dismissible banner

**Dimensions:** 50% width on desktop, full-width stacked on mobile (input on top, output below).

### 5.2 Output Format Selector

**Description:** A tab bar or segmented control to switch between output formats.

**Formats:**

| Format | Icon | Description |
|---|---|---|
| **LinkedIn Post** | 🔗 | Professional tone, hook-first structure, 1300 char target, hashtags, CTA |
| **Twitter/X Thread** | 🐦 | Numbered tweets, 280 char/tweet max, thread opener hook, engagement CTA |
| **Email Newsletter** | 📧 | Subject line, preview text, greeting, body with sections, sign-off |
| **Documentation** | 📄 | Technical rewrite with headers, code blocks (if applicable), structured sections |

**Requirements:**
- Tabs displayed above the output panel
- Active tab highlighted
- Badge indicating "generated" vs "not yet generated" per format
- Switching tabs preserves all generated content
- "Generate All" button to batch-process all formats at once

### 5.3 AI Output Panel (Right Pane)

**Description:** Displays the AI-generated repurposed content for the selected format.

**Requirements:**
- CodeMirror 6 instance (editable) with markdown highlighting
- Real-time streaming display as AI generates content
- Toolbar actions per output:
  - **Regenerate** — re-run AI for this format only
  - **Copy to clipboard** — one-click copy
  - **Export as .md** — download as `{format}-{timestamp}.md`
  - **Export all** — download all generated formats as a `.zip`
- Word count, character count, and platform-specific metrics (e.g., tweet count for Twitter, character count vs. LinkedIn limit)
- Visual indicator when content exceeds platform limits (red highlight on character count)
- Diff toggle: highlight changes between original and repurposed content

### 5.4 AI Repurposing Engine

**Description:** Server-side API route that handles AI content transformation.

**API Route:** `POST /api/repurpose`

**Request body:**
```json
{
  "content": "string (source markdown)",
  "format": "linkedin | twitter | email | docs",
  "tone": "professional | casual | technical | storytelling",
  "customInstructions": "string (optional user overrides)"
}
```

**Response:** Server-Sent Events (SSE) stream of markdown content.

**System prompts per format:**

- **LinkedIn:** "Transform this content into a LinkedIn post. Start with a strong hook (first line is critical). Use short paragraphs (1–2 sentences). Include line breaks for readability. End with a call-to-action or question. Add 3–5 relevant hashtags. Target ~1,300 characters."

- **Twitter/X:** "Transform this content into a Twitter/X thread. First tweet must hook the reader. Number each tweet (1/, 2/, etc.). Each tweet must be ≤280 characters. Use simple, punchy language. Final tweet should include a CTA or summary. Aim for 5–12 tweets."

- **Email Newsletter:** "Transform this content into an email newsletter. Generate a compelling subject line (under 50 chars) and preview text (under 90 chars). Open with a personal greeting. Structure the body with clear sections and transitions. Close with a CTA and sign-off. Tone should be conversational but authoritative."

- **Documentation:** "Transform this content into structured technical documentation. Use clear hierarchical headings (H2, H3). Add a TL;DR summary at the top. Include bullet points for key concepts. Add code examples where relevant. Use precise, unambiguous language. Include a 'Prerequisites' or 'Context' section if appropriate."

### 5.5 Settings / Preferences Panel

**Description:** Slide-over or modal panel for user customization.

**Options:**
- **Default tone** per format (professional / casual / technical / storytelling)
- **Custom instructions** — a text area for "always include..." type rules (e.g., "Always mention The Growth Angle", "Use British English")
- **Auto-save** toggle (localStorage)
- **Theme** — light / dark / system
- All settings persisted to localStorage

### 5.6 Export System

**Requirements:**
- Single-format export: Download as `linkedin-post-2026-02-06.md`
- Batch export: Download all formats as `content-repurposed-2026-02-06.zip` (using JSZip)
- Each exported file includes YAML frontmatter:

```yaml
---
source: "original-title"
format: "linkedin"
generated: "2026-02-06T14:30:00Z"
word_count: 187
character_count: 1,243
tool: "AI Content Repurposer"
---
```

---

## 6. Information Architecture

```
/
├── app/
│   ├── layout.tsx              # Root layout, theme provider, fonts
│   ├── page.tsx                # Main app (single-page application)
│   ├── api/
│   │   └── repurpose/
│   │       └── route.ts        # AI streaming endpoint
│   └── globals.css             # Tailwind + custom styles
├── components/
│   ├── editor/
│   │   ├── SourceEditor.tsx    # Left pane — CodeMirror input
│   │   ├── OutputEditor.tsx    # Right pane — CodeMirror output
│   │   └── EditorToolbar.tsx   # Actions: copy, export, regenerate
│   ├── format/
│   │   ├── FormatTabs.tsx      # LinkedIn | Twitter | Email | Docs tabs
│   │   └── FormatBadge.tsx     # Status badge per format
│   ├── settings/
│   │   └── SettingsPanel.tsx   # Preferences slide-over
│   ├── export/
│   │   └── ExportButton.tsx    # Single + batch export logic
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── ai.ts                   # Z AI provider config (glm-4.7)
│   ├── prompts.ts              # System prompts per format
│   ├── markdown.ts             # unified/remark/rehype pipeline
│   ├── storage.ts              # localStorage helpers
│   ├── export.ts               # File generation + zip logic
│   └── metrics.ts              # Word count, char count, reading time
├── hooks/
│   ├── useRepurpose.ts         # AI streaming hook
│   ├── useLocalStorage.ts      # Persisted state hook
│   └── useMetrics.ts           # Content metrics hook
├── types/
│   └── index.ts                # TypeScript interfaces
└── public/
    └── ...                     # Static assets
```

---

## 7. UI/UX Wireframe Description

### Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────┐
│  Logo        AI Content Repurposer          [⚙ Settings]│
├──────────────────────────┬──────────────────────────────┤
│                          │ [LinkedIn] [Twitter] [Email] │
│                          │ [Docs]          [Generate ▶] │
│   SOURCE CONTENT         ├──────────────────────────────┤
│                          │                              │
│   (CodeMirror Editor)    │   AI OUTPUT                  │
│                          │                              │
│   Paste or type your     │   (CodeMirror Editor)        │
│   blog post here...      │                              │
│                          │   Streaming AI response...   │
│                          │                              │
│                          │                              │
│   [📂 Upload .md]        │   [🔄 Regen] [📋 Copy] [⬇ Export]│
├──────────────────────────┼──────────────────────────────┤
│  📝 1,247 words · 5 min  │  📝 187 words · 1,243 chars  │
│  read                    │  ✅ Within LinkedIn limit     │
└──────────────────────────┴──────────────────────────────┘
```

### Mobile Layout (<1024px)

Stacked vertically: Source editor on top (collapsible), format tabs, output editor below. Sticky bottom bar with export actions.

---

## 8. API Specification

### `POST /api/repurpose`

**Headers:**
```
Content-Type: application/json
```

**Request:**
```typescript
interface RepurposeRequest {
  content: string;          // Source markdown content
  format: 'linkedin' | 'twitter' | 'email' | 'docs';
  tone?: 'professional' | 'casual' | 'technical' | 'storytelling';
  customInstructions?: string;
}
```

**Response:** Streamed text (SSE via Vercel AI SDK `streamText`)

**Error responses:**
| Status | Body | Reason |
|---|---|---|
| 400 | `{ error: "Content is required" }` | Empty content field |
| 400 | `{ error: "Invalid format" }` | Unrecognized format value |
| 429 | `{ error: "Rate limited" }` | Too many requests (client-side throttle) |
| 500 | `{ error: "AI generation failed" }` | Upstream API error |

### Server-side implementation pattern:

```typescript
import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

const provider = createAnthropic({
  baseURL: process.env.Z_AI_BASE_URL,
  apiKey: process.env.Z_AI_API_KEY,
});

export async function POST(req: Request) {
  const { content, format, tone, customInstructions } = await req.json();

  const systemPrompt = buildSystemPrompt(format, tone, customInstructions);

  const result = streamText({
    model: provider('glm-4.7'),
    system: systemPrompt,
    messages: [
      { role: 'user', content: `Repurpose the following content:\n\n${content}` }
    ],
  });

  return result.toDataStreamResponse();
}
```

---

## 9. Data Model

No database is required. All state is client-side.

### localStorage Schema

```typescript
interface AppState {
  sourceContent: string;
  outputs: {
    linkedin: string | null;
    twitter: string | null;
    email: string | null;
    docs: string | null;
  };
  settings: {
    defaultTone: Record<Format, Tone>;
    customInstructions: string;
    theme: 'light' | 'dark' | 'system';
    autoSave: boolean;
  };
  lastUpdated: string; // ISO timestamp
}
```

**Storage keys:**
- `repurposer:source` — Current source content
- `repurposer:outputs` — Generated outputs object
- `repurposer:settings` — User preferences

---

## 10. Non-Functional Requirements

| Requirement | Target | Notes |
|---|---|---|
| **First Contentful Paint** | < 1.5s | Static shell, lazy-load editors |
| **Time to Interactive** | < 3s | Code-split CodeMirror |
| **AI Response Start** | < 2s | Streaming begins within 2s of request |
| **Bundle Size** | < 300KB (initial) | Tree-shake, dynamic imports |
| **Accessibility** | WCAG 2.1 AA | Keyboard navigation, screen reader labels, color contrast |
| **Browser Support** | Last 2 versions of Chrome, Firefox, Safari, Edge | CodeMirror 6 handles compatibility |
| **Mobile Responsive** | Full functionality on 375px+ | Stacked layout, touch-friendly targets |
| **Offline Resilience** | Source content preserved | localStorage fallback if API fails |

---

## 11. Milestones & Phases

### Phase 1: MVP (Week 1–2)
- [ ] Project scaffolding (Next.js 16, Tailwind, shadcn/ui)
- [ ] Source editor with markdown highlighting (CodeMirror 6)
- [ ] Single format generation (LinkedIn) with streaming
- [ ] Z AI API route integration with `glm-4.7`
- [ ] Split-pane layout (desktop)
- [ ] Copy-to-clipboard functionality
- [ ] Basic localStorage persistence

### Phase 2: Full Format Support (Week 3)
- [ ] All 4 format tabs with format-specific prompts
- [ ] Output editor (editable) with streaming
- [ ] Export single format as `.md` with frontmatter
- [ ] Word count / char count / platform limits
- [ ] Regenerate per format
- [ ] Mobile responsive layout

### Phase 3: Polish & Power Features (Week 4)
- [ ] Settings panel (tone, custom instructions, theme)
- [ ] Batch "Generate All" functionality
- [ ] Batch export as `.zip` (JSZip)
- [ ] File upload (drag-and-drop `.md`)
- [ ] Diff view toggle (original vs. repurposed)
- [ ] Session restore with dismissible banner
- [ ] Error handling, loading states, edge cases

### Phase 4: Nice-to-Haves (Backlog)
- [ ] Content history (last 10 repurposed items)
- [ ] Custom format templates (user-defined output formats)
- [ ] Clerk authentication for cross-device persistence
- [ ] Analytics dashboard (which formats are used most)
- [ ] A/B variant generation (2 versions per format)
- [ ] Chrome extension for "Repurpose this page"

---

## 12. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Z AI API rate limits or downtime | Blocks core functionality | Medium | Client-side retry with exponential backoff; cache last successful outputs; show clear error state |
| `glm-4.7` output quality varies by format | Poor repurposed content | Medium | Invest in prompt engineering; allow user to provide custom instructions; regenerate option |
| CodeMirror 6 bundle size | Slow initial load | Low | Dynamic import, code-split editor component |
| localStorage limits (~5–10MB) | Data loss for heavy users | Low | Warn when approaching limits; offer export-and-clear |
| Platform format rules change (e.g., Twitter char limits) | Stale validation | Low | Centralize format config; easy to update |

---

## 13. Success Metrics

| Metric | Target (30 days post-launch) | How to measure |
|---|---|---|
| Content items repurposed | 100+ | Client-side event counter (localStorage) |
| Formats generated per session | ≥ 2.5 avg | Track format generation events |
| Export rate | ≥ 40% of generated outputs | Track export button clicks |
| Return visits | ≥ 30% weekly return rate | localStorage session tracking |
| Time to first export | < 3 minutes from landing | Timestamp tracking |

---

## 14. Open Questions

1. **Model fallback:** If `glm-4.7` is unavailable, should we fall back to another model or show an error?
2. **Content length limits:** What is the `glm-4.7` context window? Should we chunk content above a certain threshold?
3. **Rate limiting strategy:** Should we implement client-side rate limiting (e.g., max 20 generations/hour) to control API costs?
4. **Analytics:** Do we want a lightweight analytics solution (e.g., Plausible, Umami) for usage insights without a database?
5. **Custom formats:** Should v1 support user-defined output format templates, or defer to v2?

---

## Appendix A: Format Output Examples

### LinkedIn Post (Target)

```markdown
Most content creators waste 80% of their best work.

They publish a blog post. Share it once. Then move on.

Here's the thing: your audience doesn't live on one platform.

That 2,000-word article? It contains:
→ 3 LinkedIn posts
→ 1 Twitter thread
→ 1 newsletter issue
→ 1 documentation page

The best marketers don't create more. They distribute better.

Stop creating. Start repurposing.

What's your repurposing workflow? 👇

#ContentMarketing #B2B #GTM #ContentStrategy #Repurposing
```

### Twitter/X Thread (Target)

```markdown
1/ Most content creators waste 80% of their best work.

They publish a blog post, share it once, then move on.

Here's how to fix that 🧵

2/ Your audience doesn't live on one platform.

That 2,000-word article contains at least 5 pieces of content hiding in plain sight.

3/ Here's what a single blog post can become:

→ 3 LinkedIn posts
→ 1 Twitter thread
→ 1 newsletter
→ 1 documentation page

4/ The key insight: each platform has different expectations.

LinkedIn = professional narrative
Twitter = punchy, numbered insights
Email = personal, conversational
Docs = structured, scannable

5/ The best marketers don't create more.

They distribute better.

What's your repurposing stack? Reply below 👇
```

---

*End of PRD v1.0*

# PRD: AI Content Repurposer — Implementation Plan

## Introduction

The AI Content Repurposer is a single-page Next.js application that transforms long-form markdown content into platform-optimized formats (LinkedIn, Twitter/X, Email Newsletter, Documentation) using AI. Users paste or upload content in a split-pane editor, select a target format, and receive streamed AI-generated output they can edit, copy, and export.

This PRD breaks the full product (from `tasks/prd-ai-content-repurposer.md`) into ordered, implementable user stories. Each story = one git commit on the `master` branch. Every UI story is verified in-browser using Playwright MCP.

### Key Decisions

- **Branch:** All work committed directly to `master`, one commit per story
- **AI Config:** Environment variables use `Z_AI_` prefix (`Z_AI_API_KEY`, `Z_AI_BASE_URL`) per the original PRD
- **Model:** `glm-4.7` via Anthropic-compatible endpoint
- **Testing:** Playwright MCP browser verification after every UI feature (no test files)
- **Scope:** All 4 phases including backlog items

---

## Goals

- Deliver a fully functional content repurposing tool in incremental, verifiable steps
- Each commit is a working, non-breaking increment
- AI streaming works end-to-end by the end of Phase 1
- All 4 output formats with export by end of Phase 2
- Polish, settings, and power features in Phase 3
- Backlog items (history, custom templates, auth) in Phase 4

---

## User Stories

---

### Phase 1: MVP

---

#### US-001: Project scaffolding and shadcn/ui setup

**Description:** As a developer, I need the project configured with shadcn/ui, the correct dependencies, and proper project structure so that all subsequent stories have a solid foundation.

**Acceptance Criteria:**
- [ ] Install shadcn/ui and initialize it (Button, Tabs, Dialog, Toast, Sheet, Badge, Separator components)
- [ ] Install AI dependencies: `ai`, `@ai-sdk/anthropic`
- [ ] Install CodeMirror 6: `@codemirror/view`, `@codemirror/state`, `@codemirror/lang-markdown`, `@codemirror/language`, `@uiw/react-codemirror` (React wrapper)
- [ ] Install markdown processing: `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`, `rehype-sanitize`
- [ ] Create folder structure: `components/editor/`, `components/format/`, `components/settings/`, `components/export/`, `lib/`, `hooks/`, `types/`
- [ ] Create `types/index.ts` with core TypeScript interfaces (`Format`, `Tone`, `AppState`, `RepurposeRequest`)
- [ ] Rename `.env.local` variables to `Z_AI_API_KEY`, `Z_AI_BASE_URL`, `Z_AI_MODEL`
- [ ] Create `lib/ai.ts` — Z AI provider configuration using `createAnthropic` with env vars
- [ ] Create `lib/prompts.ts` — system prompts for all 4 formats (LinkedIn, Twitter, Email, Docs)
- [ ] Typecheck passes (`npx tsc --noEmit`)

---

#### US-002: Split-pane layout shell

**Description:** As a user, I want to see a split-pane layout with a header, left pane (source), and right pane (output) so that the app has its core structure.

**Acceptance Criteria:**
- [ ] `app/layout.tsx` — root layout with theme provider, proper fonts, metadata
- [ ] `app/page.tsx` — main page with header ("AI Content Repurposer" title, settings gear icon button) and split-pane container
- [ ] Left pane takes 50% width on desktop (>=1024px), full width stacked on mobile
- [ ] Right pane takes 50% width on desktop, full width stacked below on mobile
- [ ] Panes have visible borders/separators
- [ ] Header has logo/title on left, settings button on right
- [ ] Tailwind styling, clean minimal design
- [ ] Verify in browser using Playwright MCP

---

#### US-003: Source editor with CodeMirror

**Description:** As a content creator, I want a markdown editor in the left pane where I can type or paste my blog post so I can use it as source material.

**Acceptance Criteria:**
- [ ] `components/editor/SourceEditor.tsx` — CodeMirror 6 instance with markdown syntax highlighting
- [ ] Editor fills the entire left pane height (minus header and footer)
- [ ] Placeholder text: "Paste or type your blog post here..."
- [ ] Editor content accessible via a callback prop (`onChange`)
- [ ] Footer below editor shows word count and estimated reading time (e.g., "1,247 words · 5 min read")
- [ ] Character count also displayed in footer
- [ ] `lib/metrics.ts` — utility functions: `getWordCount(text)`, `getCharCount(text)`, `getReadingTime(text)`
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-004: AI streaming API route

**Description:** As a developer, I need a server-side API route that accepts source content and a format, then streams AI-generated repurposed content back to the client.

**Acceptance Criteria:**
- [ ] `app/api/repurpose/route.ts` — POST endpoint
- [ ] Validates request body: `content` (required, non-empty string), `format` (one of: linkedin, twitter, email, docs)
- [ ] Returns 400 with `{ error: "Content is required" }` if content is empty
- [ ] Returns 400 with `{ error: "Invalid format" }` if format is not recognized
- [ ] Builds system prompt from `lib/prompts.ts` based on format, optional tone, and optional customInstructions
- [ ] Uses `streamText` from Vercel AI SDK with the Z AI provider and `glm-4.7` model
- [ ] Returns streaming response via `result.toDataStreamResponse()`
- [ ] Returns 500 with `{ error: "AI generation failed" }` on upstream errors
- [ ] Typecheck passes

---

#### US-005: Output panel with streaming display

**Description:** As a user, I want to see the AI-generated content stream into the right pane in real-time so I can watch the repurposed content being created.

**Acceptance Criteria:**
- [ ] `components/editor/OutputEditor.tsx` — CodeMirror 6 instance (editable) in the right pane
- [ ] `hooks/useRepurpose.ts` — custom hook using `useCompletion` or `useChat` from Vercel AI SDK to call `/api/repurpose`
- [ ] "Repurpose" button visible above the output editor (default format: LinkedIn)
- [ ] Clicking "Repurpose" sends the source content to the API and streams the response into the output editor
- [ ] Loading state: button shows spinner/disabled while streaming
- [ ] Output editor footer shows word count and character count of generated content
- [ ] Error handling: if API fails, show a toast notification with the error message, preserve source content
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP — paste content, click Repurpose, see streaming output

---

#### US-006: Copy to clipboard

**Description:** As a user, I want to copy the generated output to my clipboard with one click so I can paste it into LinkedIn, Twitter, etc.

**Acceptance Criteria:**
- [ ] `components/editor/EditorToolbar.tsx` — toolbar row above the output editor with action buttons
- [ ] "Copy" button in the toolbar copies the output editor content to clipboard
- [ ] Show a toast notification: "Copied to clipboard!" on success
- [ ] Button is disabled when output is empty
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-007: Basic localStorage persistence

**Description:** As a user, I want my source content to be saved automatically so I don't lose my work if I refresh the page.

**Acceptance Criteria:**
- [ ] `lib/storage.ts` — helper functions: `saveToStorage(key, value)`, `loadFromStorage(key)`, `clearStorage(key)`
- [ ] `hooks/useLocalStorage.ts` — React hook for persisted state
- [ ] Source editor content saved to `repurposer:source` on every change (debounced 500ms)
- [ ] On page load, restore content from localStorage into the source editor
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP — type content, refresh page, content persists

---

### Phase 2: Full Format Support

---

#### US-008: Format tabs (LinkedIn, Twitter, Email, Docs)

**Description:** As a marketer, I want to select an output format from tabs above the output panel so I get platform-specific content.

**Acceptance Criteria:**
- [ ] `components/format/FormatTabs.tsx` — tab bar with 4 tabs: LinkedIn, Twitter/X, Email Newsletter, Documentation
- [ ] Each tab has an icon and label
- [ ] Active tab is visually highlighted
- [ ] `components/format/FormatBadge.tsx` — small badge per tab showing "generated" (green) or "not yet generated" (gray)
- [ ] Switching tabs does NOT discard previously generated content — each format's output is stored independently
- [ ] Selected format is passed to the repurpose API when generating
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP — switch between tabs, see correct states

---

#### US-009: Editable output editor with per-format storage

**Description:** As a user, I want to edit the AI-generated output directly and have my edits preserved per format so I can refine content before publishing.

**Acceptance Criteria:**
- [ ] Output editor is fully editable (user can type, delete, modify the AI output)
- [ ] Each format's content is stored in state independently (switching tabs preserves all content)
- [ ] Generated outputs stored to localStorage at `repurposer:outputs`
- [ ] Edits by the user are also persisted
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP — generate LinkedIn, edit it, switch to Twitter, switch back, edits preserved

---

#### US-010: Export single format as .md

**Description:** As a user, I want to export the generated content for a specific format as a `.md` file with YAML frontmatter so I can save or publish it elsewhere.

**Acceptance Criteria:**
- [ ] `lib/export.ts` — function `exportSingleFormat(format, content, sourceTitle)` that generates a `.md` file
- [ ] Exported file includes YAML frontmatter: source title, format, generated timestamp, word_count, character_count, tool name
- [ ] Filename pattern: `{format}-{date}.md` (e.g., `linkedin-post-2026-02-06.md`)
- [ ] `components/export/ExportButton.tsx` — "Export .md" button in the output toolbar
- [ ] Clicking triggers a browser file download
- [ ] Button disabled when no content is generated for the active format
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-011: Word count, char count, and platform limits

**Description:** As a user, I want to see word count, character count, and platform-specific metrics for the output so I can gauge content length and stay within limits.

**Acceptance Criteria:**
- [ ] Output footer shows: word count, character count
- [ ] Platform-specific metrics:
  - LinkedIn: character count vs. 1,300 target (green if under, red if over 3,000 max)
  - Twitter: tweet count, flag any tweet exceeding 280 chars
  - Email: subject line length (target < 50 chars), preview text length (target < 90 chars)
  - Docs: section count, estimated reading time
- [ ] `lib/metrics.ts` — add `getPlatformMetrics(format, content)` function
- [ ] Red visual indicator when content exceeds platform limits
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-012: Regenerate per format

**Description:** As a user, I want to regenerate the AI output for a specific format so I can get alternative versions without affecting other formats.

**Acceptance Criteria:**
- [ ] "Regenerate" button in the output toolbar
- [ ] Clicking regenerate re-calls the API for the currently selected format only
- [ ] Previous output is replaced with the new streamed response
- [ ] Other formats' content is untouched
- [ ] Button disabled while streaming is in progress
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-013: Mobile responsive layout

**Description:** As a mobile user, I want the app to stack vertically on small screens so I can use it on my phone or tablet.

**Acceptance Criteria:**
- [ ] Below 1024px: source editor on top (collapsible), format tabs, output editor below
- [ ] Source editor can be collapsed/expanded on mobile to save space
- [ ] Sticky bottom bar with export/copy actions on mobile
- [ ] Touch-friendly tap targets (minimum 44px)
- [ ] All functionality accessible on 375px width
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP (resize viewport to mobile)

---

### Phase 3: Polish & Power Features

---

#### US-014: Settings panel (tone, custom instructions, theme)

**Description:** As a power user, I want to customize the tone per format, add custom instructions, and switch themes so outputs match my brand voice.

**Acceptance Criteria:**
- [ ] `components/settings/SettingsPanel.tsx` — slide-over panel (Sheet component) triggered by the gear icon in the header
- [ ] **Default tone** selector per format: professional / casual / technical / storytelling (dropdown for each format)
- [ ] **Custom instructions** textarea: free-text rules like "Always mention The Growth Angle"
- [ ] **Theme** toggle: light / dark / system
- [ ] **Auto-save** toggle for localStorage
- [ ] All settings persisted to localStorage at `repurposer:settings`
- [ ] Settings are loaded on app init and passed to the repurpose API
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP — open settings, change tone, close, generate, verify tone is applied

---

#### US-015: Batch "Generate All" functionality

**Description:** As a user, I want to generate all 4 formats at once so I don't have to click each tab individually.

**Acceptance Criteria:**
- [ ] "Generate All" button next to the format tabs
- [ ] Clicking generates LinkedIn, Twitter, Email, and Docs sequentially (one after another, not parallel, to avoid API overload)
- [ ] Progress indicator showing which format is currently generating (e.g., "Generating 2/4: Twitter...")
- [ ] Each format tab badge updates to "generated" as it completes
- [ ] If one format fails, continue with remaining formats and show error toast for the failed one
- [ ] Button disabled while batch generation is in progress
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-016: Batch export as .zip

**Description:** As a user, I want to download all generated formats as a single `.zip` file so I can save everything at once.

**Acceptance Criteria:**
- [ ] Install `jszip` and `file-saver` packages
- [ ] `lib/export.ts` — add `exportAllFormats(outputs, sourceTitle)` function
- [ ] Creates a `.zip` containing one `.md` file per generated format (with YAML frontmatter)
- [ ] Filename: `content-repurposed-{date}.zip`
- [ ] "Export All" button in the toolbar (separate from single export)
- [ ] Button disabled if no formats have been generated
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-017: File upload (drag-and-drop .md)

**Description:** As a content creator, I want to upload a `.md` file by dragging it onto the editor or clicking an upload button so I can import existing content.

**Acceptance Criteria:**
- [ ] Drag-and-drop zone on the source editor — visual highlight when dragging a file over
- [ ] "Upload .md" button as fallback (below the source editor)
- [ ] Only accepts `.md` and `.txt` files
- [ ] File contents loaded into the source editor, replacing current content
- [ ] If editor has content, show confirmation dialog before replacing
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-018: Clear button with confirmation

**Description:** As a user, I want a "Clear" button to reset the source editor, with a confirmation dialog to prevent accidental data loss.

**Acceptance Criteria:**
- [ ] "Clear" button visible near the source editor (in the source editor footer or toolbar)
- [ ] Clicking shows a confirmation dialog: "Clear all content? This cannot be undone."
- [ ] Confirming clears the source editor and all generated outputs
- [ ] Canceling does nothing
- [ ] Also clears relevant localStorage keys
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-019: Session restore with dismissible banner

**Description:** As a user, I want to see a banner on page load if previous session content exists, so I can choose to continue or start fresh.

**Acceptance Criteria:**
- [ ] On page load, if `repurposer:source` exists in localStorage with non-empty content, show a banner at the top
- [ ] Banner message: "Welcome back! Your previous session has been restored."
- [ ] Dismiss button (X) to close the banner
- [ ] "Start fresh" link in the banner that clears all stored content
- [ ] Banner does not appear if no previous content exists
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-020: Error handling and loading states

**Description:** As a user, I want clear feedback when things are loading or when errors occur so I know what's happening.

**Acceptance Criteria:**
- [ ] Empty input: "Repurpose" button disabled, tooltip: "Enter some content first"
- [ ] Short input (<100 words): warning toast "Content is short — output quality may be limited" (non-blocking)
- [ ] Long input (>5,000 words): info toast "Long content detected — this may take longer"
- [ ] API timeout/failure: error toast with "Retry" action button
- [ ] Partial streaming failure: display whatever was received with a "Retry" action
- [ ] Skeleton/loading state in output panel while waiting for first stream chunk
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

### Phase 4: Backlog / Nice-to-Haves

---

#### US-021: Live markdown preview of outputs

**Description:** As a user, I want to toggle a rendered markdown preview of the output so I can see how it looks formatted.

**Acceptance Criteria:**
- [ ] "Preview" toggle button in the output toolbar
- [ ] When active, output pane switches from CodeMirror editor to rendered HTML (using unified/remark/rehype pipeline)
- [ ] `lib/markdown.ts` — function `renderMarkdown(text)` returns sanitized HTML
- [ ] Preview is read-only; toggling back returns to editable CodeMirror
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-022: Content history (last 10 items)

**Description:** As a user, I want to see my last 10 repurposed items so I can revisit previous work.

**Acceptance Criteria:**
- [ ] Store history entries in localStorage at `repurposer:history`
- [ ] Each entry: `{ id, sourceTitle (first 50 chars), sourceContent, outputs, timestamp }`
- [ ] Maximum 10 entries, oldest removed when limit exceeded
- [ ] History accessible via a panel/modal from the header
- [ ] Clicking a history entry restores its source content and outputs
- [ ] "Clear history" button
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-023: Custom format templates

**Description:** As a power user, I want to create my own output format templates so I can repurpose content for platforms not built in.

**Acceptance Criteria:**
- [ ] "Custom Format" option in the format tabs (appears as a "+" tab)
- [ ] Modal to create a custom format: name, icon (emoji picker or text), system prompt template, character limit (optional)
- [ ] Custom formats stored in localStorage at `repurposer:customFormats`
- [ ] Custom formats appear as additional tabs alongside the default 4
- [ ] Can edit or delete custom formats from the settings panel
- [ ] Maximum 5 custom formats
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-024: Diff view toggle

**Description:** As a user, I want to see a visual diff between my original content and the repurposed output so I can understand what changed.

**Acceptance Criteria:**
- [ ] "Diff" toggle button in the output toolbar
- [ ] When active, shows a side-by-side or inline diff highlighting additions, removals, and changes
- [ ] Uses a lightweight diff library (e.g., `diff` npm package)
- [ ] Diff view is read-only
- [ ] Toggle back to normal editable view
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-025: Analytics dashboard (client-side)

**Description:** As a user, I want to see basic usage stats (formats generated, exports made) so I can understand my usage patterns.

**Acceptance Criteria:**
- [ ] Track events in localStorage: `repurposer:analytics`
- [ ] Events: `format_generated`, `export_single`, `export_all`, `copy_clipboard`, `session_start`
- [ ] Simple dashboard accessible from header (icon button)
- [ ] Shows: total generations, generations per format (bar chart), total exports, most-used format
- [ ] "Reset stats" button
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

#### US-026: A/B variant generation

**Description:** As a marketer, I want to generate 2 alternative versions of the same format so I can pick the best one or A/B test them.

**Acceptance Criteria:**
- [ ] "Generate Variant" button in the output toolbar (appears after initial generation)
- [ ] Generates a second version with a slightly modified prompt (e.g., "Generate an alternative version with a different angle")
- [ ] Toggle between Variant A and Variant B within the same format tab
- [ ] Both variants independently editable, copyable, exportable
- [ ] Export includes variant label in frontmatter (`variant: A` or `variant: B`)
- [ ] Typecheck passes
- [ ] Verify in browser using Playwright MCP

---

## Functional Requirements

- FR-1: Source editor uses CodeMirror 6 with markdown syntax highlighting
- FR-2: AI generation uses Z AI endpoint (`Z_AI_BASE_URL`) with `glm-4.7` model via Anthropic-compatible SDK
- FR-3: API route at `POST /api/repurpose` validates input and returns SSE stream
- FR-4: 4 built-in output formats: LinkedIn, Twitter/X, Email Newsletter, Documentation
- FR-5: Each format has a dedicated system prompt controlling tone, structure, and constraints
- FR-6: Output is streamed in real-time to the output editor
- FR-7: All generated outputs stored independently per format
- FR-8: Single export downloads a `.md` file with YAML frontmatter
- FR-9: Batch export downloads a `.zip` containing all generated formats
- FR-10: All user content and settings persisted to localStorage
- FR-11: File upload supports `.md` and `.txt` via drag-and-drop or file picker
- FR-12: Settings panel allows tone customization, custom instructions, and theme switching
- FR-13: Platform-specific metrics shown with visual warnings when limits exceeded
- FR-14: Mobile responsive layout with stacked panes below 1024px

## Non-Goals (Out of Scope)

- No user authentication in this version (deferred to v2 with Clerk)
- No server-side database — all storage is client-side localStorage
- No real-time collaboration or sharing
- No Chrome extension (listed in backlog but not implemented here)
- No automated CI/CD pipeline setup
- No Playwright test files — verification is done manually via Playwright MCP during development

## Technical Considerations

- **Next.js 16** with App Router (server components, API routes, streaming)
- **Vercel AI SDK** (`ai` package) handles streaming with `streamText` and `useCompletion`
- **CodeMirror 6** dynamically imported to minimize initial bundle size
- **shadcn/ui** for all UI primitives (accessible, composable)
- **JSZip** for client-side zip generation (Phase 3)
- **unified/remark/rehype** for markdown-to-HTML rendering (Phase 4)
- **localStorage** limited to ~5-10MB — warn users when approaching limits
- Environment variables: `Z_AI_BASE_URL`, `Z_AI_API_KEY`, `Z_AI_MODEL`

## Design Considerations

- Clean, minimal split-pane layout inspired by code editors
- Light/dark/system theme support via CSS variables and Tailwind
- Icons from Lucide (included with shadcn/ui)
- Consistent spacing and typography using Tailwind utility classes
- Mobile-first responsive approach with breakpoint at 1024px

## Success Metrics

- All 26 user stories implemented and verified via Playwright MCP
- AI streaming works end-to-end with `glm-4.7`
- Export produces valid `.md` files with correct YAML frontmatter
- App loads under 3 seconds (Time to Interactive)
- Full functionality on mobile (375px+)

## Open Questions

1. Should `glm-4.7` model failures fall back to another model or just show an error?
2. What is the exact context window for `glm-4.7`? Chunking strategy for >5,000 words?
3. Client-side rate limiting: should we cap at 20 generations/hour?
4. Should the diff view use inline or side-by-side layout (or both)?

---

*Implementation order follows the user story numbering (US-001 through US-026). Each story is one commit on `master`.*

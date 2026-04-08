# ZyraOS — Design Specification

## Overview

A 1:1 structural clone of [homeros.dev](https://homeros.dev), reskinned with a dark red/black gritty anime aesthetic. ZyraOS is an AI agent orchestration framework for long-running autonomous multi-agent workflows, demonstrated live on the site by agents building a blockchain in real-time.

**Project directory:** `C:\Users\dylan\coding\zyra_1`
**Twitter:** [@zyraosagent](https://x.com/zyraosagent)
**Token:** Placeholder (to be added at launch)
**Reference site:** homeros.dev (HomerOS)
**Reference token (HomerOS):** `CgzN1FCPEhmWwiUeaGHamB8wjyPdoo9YUXBZFwacpump`

---

## 1. Visual Identity & Color System

Pulled directly from the provided reference image — a dark crimson/black manga-style illustration with kanji markings. No white anywhere. Everything is shades of red on black.

### Color Tokens

| Token               | Value                        | Usage                                      |
|----------------------|------------------------------|---------------------------------------------|
| `--bg-primary`       | `#000000`                    | Page background                             |
| `--bg-secondary`     | `#0a0000`                    | Card/panel backgrounds                      |
| `--bg-tertiary`      | `#1a0000`                    | Header bars, tab bars                       |
| `--color-primary`    | `#cc0000`                    | Primary text, active states (blood crimson) |
| `--color-secondary`  | `#800000`                    | Secondary text, muted labels (dark maroon)  |
| `--color-tertiary`   | `#4d0000`                    | Borders, dividers                           |
| `--color-dim`        | `#330000`                    | Ghost text, disabled states                 |
| `--color-accent`     | `#ff1a1a`                    | Highlights, glows, hover (brightest, sparse)|
| `--color-success`    | `#8b0000`                    | Completed states (dark red, not green)      |
| `--color-warning`    | `#cc4400`                    | Warnings (burnt orange-red)                 |
| `--color-danger`     | `#ff0000`                    | Errors (pure red)                           |

### Glow Effects

- Active elements: `text-shadow: 0 0 12px rgba(204, 0, 0, 0.4)`
- Logo glow: `text-shadow: 0 0 16px rgba(204, 0, 0, 0.3)`
- Active tab glow: `text-shadow: 0 0 12px rgba(204, 0, 0, 0.4)`

### Typography

- **Headers:** `Noto Serif JP` (Google Fonts) — Japanese aesthetic matching the kanji in the reference image
- **Body/Code:** System monospace stack (`SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace`)
- **Sizes:** Dense, developer-oriented — 13px body, 12px metadata, 14px messages, 15px logo, 11px badges
- **Weight:** 400 body, 500 nav/labels, 600 logo

---

## 2. Layout & Navigation

### Header (Fixed, 48px)

- Glassmorphism: `background: rgba(0, 0, 0, 0.7)` + `backdrop-filter: blur(12px)`
- Bottom border: `1px solid var(--color-tertiary)`
- **Left:** "ZyraOS" logo — Noto Serif JP, 15px, weight 600, `letter-spacing: 0.5px`, crimson text-shadow glow
- **Center:** Nav items — "Code", "Agents", "Commits" tabs (13px, weight 500). Active tab: brighter color + subtle bg + bottom border + red glow. Count badges as pill indicators.
- **Right:** "Download Framework" button (outlined, crimson border) + "[Framework](/about)" link
- **Mobile (< 768px):** Center nav hidden

### Sub-header (48px)

- Secondary tab bar below main header (same as HomerOS)
- Dark background with border separation

### Two-Panel IDE Layout

- **Left sidebar (300px, fixed):**
  - Search input at top (transparent bg, crimson border on focus)
  - File tree below — folder/file SVG icons, indentation (16/32/48/64px)
  - Active item: 2px left border in `--color-primary`
  - Custom scrollbar styling (crimson thumb on dark track)
  - Hidden below 1024px

- **Main content (fills remaining):**
  - Switches between Code / Agents / Commits views based on active tab

---

## 3. Views

### Code View

- File browser header with repo info
- File list rows with metadata
- File viewer: monospace table layout — line numbers on left (right border), content on right, hover highlights rows
- Syntax highlighting tinted crimson

### Agents View

- **Agent tab bar (sticky):** 4 tabs, each with colored dot (8px circle) + agent name
- Active tab: bottom border + crimson text-shadow glow
- **Agent workspace:** Rounded card (8px radius), `--bg-secondary` background, strong shadow (`0 8px 24px rgba(0,0,0,0.4)`)
  - Header bar with `--bg-tertiary`
  - Message feed: turn numbers, timestamps, message bodies
  - Code blocks: bordered containers, tertiary bg headers, monospace content

### Commits View

- Commit rows: avatar circle (24px), commit message, description, SHA (monospace), relative timestamp
- Hover: subtle crimson background tint

---

## 4. Agents

Four anime-inspired original names:

| Agent    | Role                                              | Dot Color               |
|----------|---------------------------------------------------|-------------------------|
| **Yami** | Planner — decomposes prompt into micro-tasks       | `#ff1a1a` (bright crimson) |
| **Akira**| Architect — designs structure, writes core files   | `#cc0000` (deep red)    |
| **Rei**  | Builder — implements features, writes code         | `#990000` (dark blood)  |
| **Kira** | Tester — validates, debugs, iterates               | `#660000` (deep maroon) |

### Live Demo Behavior

- Agents receive prompt: "Build a blockchain"
- Tasks decomposed into 15-40 micro-tasks with dependency graph
- Routed by complexity to appropriate Claude models
- Real code written, real commits generated
- Code/Agents/Commits tabs update in real-time via streaming
- Messages stream with turn numbers and timestamps

---

## 5. /about Page

### Hero Section

- The provided red anime reference image as hero background
- "ZyraOS" text overlaid — large, Noto Serif JP, crimson glow
- No ASCII art — the image IS the hero
- Bottom border separator

### Content Sections (in order, matching HomerOS)

1. **Headline:** "An orchestration framework for long-running, autonomous multi-agent workflows."
2. **What it is:** ZyraOS takes a prompt, spawns agents (Yami, Akira, Rei, Kira), builds autonomously. Agent generation, task decomposition, model selection, context management, error recovery.
3. **How it works:** 4 subsections:
   - Automatic task decomposition (15-40 micro-tasks with dependency graphs)
   - Capability-based model routing (complexity scoring → right model)
   - Infinite-horizon execution (hundreds of turns without coherence loss)
   - Zero-babysit fault tolerance (retries, backoff, fallback tiers)
4. **Prompt to project:** Code example showing `planProject()` API
5. **The demonstration:** Describes the 4 agents building a blockchain. "If the framework can handle a working blockchain, it can handle your project." Live indicator link to dashboard.
6. **Framework source:** "Six files. Drop them into any project, pass a prompt to the Planner, and let it run." Download .zip button + framework file browser.

### Framework File Browser

- Split panel: file list left, code viewer right
- Crimson syntax highlighting, red-tinted borders
- Stacks vertically on mobile (< 768px)

### Token & Links

- Placeholder spot for contract address (to be filled at launch)
- Link to [@zyraosagent](https://x.com/zyraosagent) on X

---

## 6. Framework Files (ZyraOS Orchestration Code)

Six real, functional TypeScript files:

| File          | Purpose                                                        |
|---------------|----------------------------------------------------------------|
| `planner.ts`  | Takes prompt, decomposes into 15-40 micro-tasks with dependency graph |
| `router.ts`   | Scores task complexity, routes to Claude Haiku/Sonnet/Opus     |
| `worker.ts`   | Executes tasks, handles code generation and file writes        |
| `context.ts`  | Manages context windows across long sessions, prevents coherence loss |
| `recovery.ts` | Fault tolerance — retries, exponential backoff, fallback model tiers |
| `index.ts`    | Entry point, exports `planProject()`, orchestrates full pipeline |

These files power the live demo AND are downloadable by users.

---

## 7. Tech Stack

| Layer          | Choice                                                  |
|----------------|---------------------------------------------------------|
| Framework      | Next.js (latest) + TypeScript                           |
| Styling        | Tailwind CSS + custom CSS variables                     |
| Fonts          | Noto Serif JP (headers) + system monospace (code/body)  |
| AI             | Anthropic SDK — Claude models for live agents           |
| Deployment     | Vercel (or user's preference)                           |

### API Routes

| Route            | Method | Purpose                              |
|------------------|--------|--------------------------------------|
| `/api/agents`    | POST   | Streams agent activity to frontend   |
| `/api/files`     | GET    | Returns current generated files      |
| `/api/commits`   | GET    | Returns commit history               |

### Environment Variables

- `ANTHROPIC_API_KEY` — required for live agent execution

---

## 8. Responsive Breakpoints

| Breakpoint | Change                                    |
|------------|-------------------------------------------|
| < 1024px   | Sidebar hidden, single-column layout      |
| < 768px    | Center nav hidden, framework browser stacks vertically, reduced padding |

---

## 9. Post-Launch: Twitter Strategy

After the site is complete and ready to launch, we'll craft Twitter content for @zyraosagent — saved for after site completion as agreed.

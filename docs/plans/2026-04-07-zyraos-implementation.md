# ZyraOS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 1:1 structural clone of homeros.dev reskinned with a dark red/black anime aesthetic — a live AI agent orchestration framework demo site.

**Architecture:** Next.js App Router with two routes (`/` dashboard, `/about` framework explainer). Real-time agent orchestration powered by Anthropic SDK streams agent activity to a React frontend via Server-Sent Events. Six framework files handle planning, routing, execution, context management, and fault recovery.

**Tech Stack:** Next.js (latest), TypeScript, Tailwind CSS 4, Anthropic SDK, Google Fonts (Noto Serif JP)

**Spec:** `docs/superpowers/specs/2026-04-07-zyraos-design.md`

---

## File Structure

```
zyra_1/
├── app/
│   ├── layout.tsx              # Root layout — fonts, metadata, CSS vars
│   ├── page.tsx                # Dashboard page (/)
│   ├── about/
│   │   └── page.tsx            # About/framework page (/about)
│   ├── globals.css             # Global styles, CSS custom properties, animations
│   └── api/
│       ├── agents/
│       │   └── route.ts        # POST — streams agent activity via SSE
│       ├── files/
│       │   └── route.ts        # GET — returns generated files
│       ├── commits/
│       │   └── route.ts        # GET — returns commit history
│       └── download/
│           └── route.ts        # GET — serves framework .zip
├── components/
│   ├── Header.tsx              # Fixed glassmorphism header with nav tabs
│   ├── Sidebar.tsx             # File tree sidebar (300px)
│   ├── FileTree.tsx            # Recursive file tree component
│   ├── CodeView.tsx            # Code tab — file browser + code viewer
│   ├── AgentsView.tsx          # Agents tab — agent tabs + message feed
│   ├── CommitsView.tsx         # Commits tab — commit list
│   ├── CodeViewer.tsx          # Syntax-highlighted code display with line numbers
│   ├── MessageFeed.tsx         # Agent message stream with code blocks
│   ├── AboutHero.tsx           # Hero section with zyra.os.jpg + "ZyraOS" overlay
│   ├── AboutContent.tsx        # About page content sections
│   ├── FrameworkBrowser.tsx    # Split-panel framework file browser
│   └── LivePulse.tsx           # Animated live indicator dot
├── lib/
│   ├── framework/
│   │   ├── index.ts            # Entry point — exports planProject()
│   │   ├── planner.ts          # Task decomposition (prompt → micro-tasks)
│   │   ├── router.ts           # Complexity scoring + model routing
│   │   ├── worker.ts           # Task execution + code generation
│   │   ├── context.ts          # Context window management
│   │   └── recovery.ts         # Fault tolerance — retries, backoff, fallbacks
│   ├── orchestrator.ts         # Server-side orchestrator that runs agents for the demo
│   └── store.ts                # In-memory store for files, commits, agent messages
├── types/
│   └── index.ts                # All TypeScript interfaces
├── public/
│   └── zyra.os.jpg             # Hero image (already exists)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
└── .env.local                  # ANTHROPIC_API_KEY
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.local`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd C:/Users/dylan/coding/zyra_1
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --yes
```

Expected: Next.js project scaffolded with App Router, TypeScript, Tailwind CSS.

- [ ] **Step 2: Install dependencies**

```bash
cd C:/Users/dylan/coding/zyra_1
npm install @anthropic-ai/sdk archiver
npm install -D @types/archiver
```

- [ ] **Step 3: Create .env.local**

Create `C:/Users/dylan/coding/zyra_1/.env.local`:

```
ANTHROPIC_API_KEY=your-key-here
```

- [ ] **Step 4: Verify dev server starts**

```bash
cd C:/Users/dylan/coding/zyra_1
npm run dev
```

Expected: Server starts on localhost:3000 without errors.

- [ ] **Step 5: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add -A
git commit -m "chore: scaffold Next.js project with dependencies"
```

---

## Task 2: Global Styles & CSS Custom Properties

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace globals.css with ZyraOS color system and base styles**

Replace the entire contents of `app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --bg-primary: #000000;
  --bg-secondary: #0a0000;
  --bg-tertiary: #1a0000;
  --color-primary: #cc0000;
  --color-secondary: #800000;
  --color-tertiary: #4d0000;
  --color-dim: #330000;
  --color-accent: #ff1a1a;
  --color-success: #8b0000;
  --color-warning: #cc4400;
  --color-danger: #ff0000;

  --font-mono: "SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg-primary);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

::selection {
  background: var(--color-tertiary);
  color: var(--color-accent);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-tertiary);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary);
}

/* Animations */
@keyframes livePulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 6px var(--color-primary);
  }
  50% {
    opacity: 0.6;
    box-shadow: 0 0 12px var(--color-accent);
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Utility classes */
.glow-text {
  text-shadow: 0 0 12px rgba(204, 0, 0, 0.4);
}

.glow-text-strong {
  text-shadow: 0 0 16px rgba(204, 0, 0, 0.3);
}

.transition-base {
  transition: all 0.15s ease;
}

.transition-fast {
  transition: all 0.1s ease;
}
```

- [ ] **Step 2: Update layout.tsx with fonts and metadata**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZyraOS",
  description:
    "An orchestration framework for long-running, autonomous multi-agent workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={notoSerifJP.variable}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify styles load correctly**

```bash
cd C:/Users/dylan/coding/zyra_1
npm run dev
```

Open localhost:3000 — page should be pure black background with no default Next.js content visible.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add app/globals.css app/layout.tsx
git commit -m "feat: add ZyraOS color system, fonts, and global styles"
```

---

## Task 3: TypeScript Types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Create all shared types**

Create `types/index.ts`:

```ts
export interface AgentInfo {
  name: string;
  role: string;
  dotColor: string;
}

export interface AgentMessage {
  id: string;
  agent: string;
  turn: number;
  timestamp: string;
  content: string;
  codeBlock?: {
    filename: string;
    language: string;
    code: string;
  };
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  content?: string;
  language?: string;
}

export interface Commit {
  sha: string;
  message: string;
  description?: string;
  agent: string;
  timestamp: string;
  files: string[];
}

export interface MicroTask {
  id: string;
  title: string;
  description: string;
  dependencies: string[];
  complexity: "low" | "medium" | "high" | "critical";
  assignedModel?: string;
  assignedAgent?: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  result?: string;
}

export interface TaskPlan {
  prompt: string;
  tasks: MicroTask[];
  createdAt: string;
}

export interface WorkerResult {
  taskId: string;
  success: boolean;
  output: string;
  filesCreated?: string[];
  error?: string;
}

export interface OrchestratorState {
  status: "idle" | "planning" | "running" | "completed" | "error";
  plan?: TaskPlan;
  messages: AgentMessage[];
  files: FileNode[];
  commits: Commit[];
  currentTask?: string;
}

export type TabName = "code" | "agents" | "commits";
```

- [ ] **Step 2: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 4: Framework Files (ZyraOS Orchestration Engine)

**Files:**
- Create: `lib/framework/planner.ts`
- Create: `lib/framework/router.ts`
- Create: `lib/framework/worker.ts`
- Create: `lib/framework/context.ts`
- Create: `lib/framework/recovery.ts`
- Create: `lib/framework/index.ts`

- [ ] **Step 1: Create context.ts — context window management**

Create `lib/framework/context.ts`:

```ts
import type { MicroTask, AgentMessage } from "@/types";

interface ContextWindow {
  agentName: string;
  messages: { role: "user" | "assistant"; content: string }[];
  tokenEstimate: number;
  maxTokens: number;
}

const TOKEN_LIMITS: Record<string, number> = {
  "claude-haiku-4-5-20251001": 8192,
  "claude-sonnet-4-6-20250514": 16384,
  "claude-opus-4-6-20250514": 32768,
};

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function createContextWindow(
  agentName: string,
  model: string
): ContextWindow {
  return {
    agentName,
    messages: [],
    tokenEstimate: 0,
    maxTokens: TOKEN_LIMITS[model] || 16384,
  };
}

export function addToContext(
  ctx: ContextWindow,
  role: "user" | "assistant",
  content: string
): ContextWindow {
  const newTokens = estimateTokens(content);
  const updated = {
    ...ctx,
    messages: [...ctx.messages, { role, content }],
    tokenEstimate: ctx.tokenEstimate + newTokens,
  };

  // If over 80% capacity, summarize older messages
  if (updated.tokenEstimate > updated.maxTokens * 0.8) {
    return compressContext(updated);
  }

  return updated;
}

function compressContext(ctx: ContextWindow): ContextWindow {
  if (ctx.messages.length <= 4) return ctx;

  // Keep first message (system context) and last 3 exchanges
  const keep = 6;
  const toSummarize = ctx.messages.slice(1, -keep);
  const kept = ctx.messages.slice(-keep);

  const summary = toSummarize
    .map((m) => `[${m.role}]: ${m.content.slice(0, 200)}`)
    .join("\n");

  const compressed: ContextWindow = {
    ...ctx,
    messages: [
      ctx.messages[0],
      {
        role: "user" as const,
        content: `[Previous context summary]\n${summary}`,
      },
      ...kept,
    ],
    tokenEstimate: 0,
  };

  compressed.tokenEstimate = compressed.messages.reduce(
    (sum, m) => sum + estimateTokens(m.content),
    0
  );

  return compressed;
}

export function getMessages(
  ctx: ContextWindow
): { role: "user" | "assistant"; content: string }[] {
  return ctx.messages;
}
```

- [ ] **Step 2: Create recovery.ts — fault tolerance**

Create `lib/framework/recovery.ts`:

```ts
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  fallbackModels: string[];
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  fallbackModels: [
    "claude-sonnet-4-6-20250514",
    "claude-haiku-4-5-20251001",
  ],
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoffDelay(attempt: number, config: RetryConfig): number {
  const exponential = config.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * config.baseDelay;
  return Math.min(exponential + jitter, config.maxDelay);
}

export async function withRetry<T>(
  fn: (model: string) => Promise<T>,
  primaryModel: string,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const models = [primaryModel, ...cfg.fallbackModels.filter((m) => m !== primaryModel)];
  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 0; attempt < cfg.maxRetries; attempt++) {
      try {
        return await fn(model);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on auth errors
        if (lastError.message.includes("401") || lastError.message.includes("403")) {
          throw lastError;
        }

        if (attempt < cfg.maxRetries - 1) {
          await delay(getBackoffDelay(attempt, cfg));
        }
      }
    }
  }

  throw lastError || new Error("All retry attempts exhausted");
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}
```

- [ ] **Step 3: Create router.ts — complexity scoring and model routing**

Create `lib/framework/router.ts`:

```ts
import type { MicroTask } from "@/types";

interface RouteResult {
  model: string;
  agent: string;
  reasoning: string;
}

const AGENTS = [
  { name: "Yami", role: "planner", models: ["claude-opus-4-6-20250514"] },
  { name: "Akira", role: "architect", models: ["claude-opus-4-6-20250514", "claude-sonnet-4-6-20250514"] },
  { name: "Rei", role: "builder", models: ["claude-sonnet-4-6-20250514", "claude-haiku-4-5-20251001"] },
  { name: "Kira", role: "tester", models: ["claude-sonnet-4-6-20250514", "claude-haiku-4-5-20251001"] },
];

const COMPLEXITY_MODELS: Record<string, string> = {
  critical: "claude-opus-4-6-20250514",
  high: "claude-sonnet-4-6-20250514",
  medium: "claude-sonnet-4-6-20250514",
  low: "claude-haiku-4-5-20251001",
};

function scoreComplexity(task: MicroTask): MicroTask["complexity"] {
  const text = `${task.title} ${task.description}`.toLowerCase();

  const criticalPatterns = ["architect", "design", "plan", "decompos", "system"];
  const highPatterns = ["implement", "build", "create", "core", "consensus", "crypto"];
  const mediumPatterns = ["test", "validate", "debug", "fix", "refactor"];

  if (criticalPatterns.some((p) => text.includes(p))) return "critical";
  if (highPatterns.some((p) => text.includes(p))) return "high";
  if (mediumPatterns.some((p) => text.includes(p))) return "medium";
  return "low";
}

function assignAgent(task: MicroTask): typeof AGENTS[number] {
  const text = `${task.title} ${task.description}`.toLowerCase();

  if (text.includes("plan") || text.includes("decompos") || text.includes("break down")) {
    return AGENTS[0]; // Yami
  }
  if (text.includes("architect") || text.includes("design") || text.includes("structure")) {
    return AGENTS[1]; // Akira
  }
  if (text.includes("test") || text.includes("valid") || text.includes("debug")) {
    return AGENTS[3]; // Kira
  }
  return AGENTS[2]; // Rei (default builder)
}

export function routeTask(task: MicroTask): RouteResult {
  const complexity = scoreComplexity(task);
  task.complexity = complexity;

  const agent = assignAgent(task);
  const model = COMPLEXITY_MODELS[complexity];

  task.assignedModel = model;
  task.assignedAgent = agent.name;

  return {
    model,
    agent: agent.name,
    reasoning: `Task "${task.title}" scored as ${complexity} complexity, assigned to ${agent.name} (${agent.role}) using ${model}`,
  };
}

export function getAgents() {
  return AGENTS;
}
```

- [ ] **Step 4: Create planner.ts — task decomposition**

Create `lib/framework/planner.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import type { MicroTask, TaskPlan } from "@/types";

const PLANNER_SYSTEM = `You are Yami, the task planner for ZyraOS. You decompose prompts into 15-40 micro-tasks with dependency graphs.

Output ONLY valid JSON — no markdown, no explanation. Format:
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Short task title",
      "description": "What this task accomplishes",
      "dependencies": []
    }
  ]
}

Rules:
- Each task must be a single, concrete action
- Dependencies reference other task IDs
- Order tasks so dependencies come first
- Cover: architecture, core logic, data structures, networking, testing, integration
- Be specific — "Implement SHA-256 hashing for block headers" not "Add hashing"`;

export async function decompose(
  client: Anthropic,
  prompt: string
): Promise<TaskPlan> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6-20250514",
    max_tokens: 4096,
    system: PLANNER_SYSTEM,
    messages: [
      {
        role: "user",
        content: `Decompose this into micro-tasks:\n\n${prompt}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  let parsed: { tasks: Array<{ id: string; title: string; description: string; dependencies: string[] }> };
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      parsed = JSON.parse(match[1]);
    } else {
      throw new Error("Failed to parse planner output as JSON");
    }
  }

  const tasks: MicroTask[] = parsed.tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    dependencies: t.dependencies || [],
    complexity: "medium",
    status: "pending",
  }));

  return {
    prompt,
    tasks,
    createdAt: new Date().toISOString(),
  };
}
```

- [ ] **Step 5: Create worker.ts — task execution**

Create `lib/framework/worker.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import type { MicroTask, WorkerResult } from "@/types";
import { createContextWindow, addToContext, getMessages } from "./context";
import { withRetry, withTimeout } from "./recovery";

const WORKER_SYSTEM = `You are a code-writing agent for ZyraOS. You implement one micro-task at a time.

Rules:
- Write complete, working code — no placeholders or TODOs
- Output your response in this format:
  1. Brief explanation of what you're implementing (1-2 sentences)
  2. Code blocks with filename comments: // filename: path/to/file.ts
  3. Each code block is a complete file

Be precise and concise. Write production-quality TypeScript.`;

export async function executeTask(
  client: Anthropic,
  task: MicroTask,
  model: string,
  agentName: string,
  previousContext?: string
): Promise<WorkerResult> {
  const ctx = createContextWindow(agentName, model);

  const prompt = previousContext
    ? `Previous context:\n${previousContext}\n\nNow implement this task:\nTask: ${task.title}\nDescription: ${task.description}`
    : `Implement this task:\nTask: ${task.title}\nDescription: ${task.description}`;

  const ctxWithPrompt = addToContext(ctx, "user", prompt);
  const messages = getMessages(ctxWithPrompt);

  const result = await withRetry(
    async (m) => {
      return withTimeout(
        client.messages.create({
          model: m,
          max_tokens: 4096,
          system: WORKER_SYSTEM,
          messages,
        }),
        120000
      );
    },
    model
  );

  const text =
    result.content[0].type === "text" ? result.content[0].text : "";

  // Extract filenames from code blocks
  const filePattern = /\/\/ filename: (.+)\n/g;
  const filesCreated: string[] = [];
  let match;
  while ((match = filePattern.exec(text)) !== null) {
    filesCreated.push(match[1].trim());
  }

  return {
    taskId: task.id,
    success: true,
    output: text,
    filesCreated,
  };
}
```

- [ ] **Step 6: Create index.ts — entry point**

Create `lib/framework/index.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import type { TaskPlan, MicroTask, WorkerResult } from "@/types";
import { decompose } from "./planner";
import { routeTask } from "./router";
import { executeTask } from "./worker";

export interface PlanProjectOptions {
  prompt: string;
  apiKey: string;
  onTaskStart?: (task: MicroTask, agent: string, model: string) => void;
  onTaskComplete?: (task: MicroTask, result: WorkerResult) => void;
  onMessage?: (agent: string, content: string) => void;
}

export async function planProject(
  options: PlanProjectOptions
): Promise<{ plan: TaskPlan; results: WorkerResult[] }> {
  const client = new Anthropic({ apiKey: options.apiKey });

  // Phase 1: Decompose
  options.onMessage?.("Yami", `Decomposing prompt: "${options.prompt}"`);
  const plan = await decompose(client, options.prompt);
  options.onMessage?.(
    "Yami",
    `Created ${plan.tasks.length} micro-tasks with dependency graph`
  );

  // Phase 2: Route all tasks
  for (const task of plan.tasks) {
    routeTask(task);
  }

  // Phase 3: Execute in dependency order
  const results: WorkerResult[] = [];
  const completed = new Set<string>();
  let contextSummary = "";

  while (completed.size < plan.tasks.length) {
    const ready = plan.tasks.filter(
      (t) =>
        t.status === "pending" &&
        t.dependencies.every((d) => completed.has(d))
    );

    if (ready.length === 0 && completed.size < plan.tasks.length) {
      throw new Error("Deadlock: no tasks ready but not all complete");
    }

    // Execute ready tasks sequentially to keep demo readable
    for (const task of ready) {
      task.status = "in_progress";
      const agent = task.assignedAgent || "Rei";
      const model = task.assignedModel || "claude-sonnet-4-6-20250514";

      options.onTaskStart?.(task, agent, model);
      options.onMessage?.(
        agent,
        `Starting task: ${task.title}`
      );

      try {
        const result = await executeTask(
          client,
          task,
          model,
          agent,
          contextSummary
        );

        task.status = "completed";
        completed.add(task.id);
        results.push(result);

        contextSummary += `\nCompleted: ${task.title}\n${result.output.slice(0, 500)}\n`;

        options.onTaskComplete?.(task, result);
        options.onMessage?.(
          agent,
          `Completed: ${task.title}${result.filesCreated?.length ? ` (files: ${result.filesCreated.join(", ")})` : ""}`
        );
      } catch (error) {
        task.status = "failed";
        const errMsg = error instanceof Error ? error.message : String(error);
        results.push({
          taskId: task.id,
          success: false,
          output: "",
          error: errMsg,
        });
        options.onMessage?.(agent, `Failed: ${task.title} — ${errMsg}`);
        // Mark as completed to avoid deadlock, task failed
        completed.add(task.id);
      }
    }
  }

  return { plan, results };
}

export { decompose } from "./planner";
export { routeTask, getAgents } from "./router";
export { executeTask } from "./worker";
```

- [ ] **Step 7: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add lib/framework/
git commit -m "feat: add ZyraOS orchestration framework (6 files)"
```

---

## Task 5: In-Memory Store & Server Orchestrator

**Files:**
- Create: `lib/store.ts`
- Create: `lib/orchestrator.ts`

- [ ] **Step 1: Create the in-memory store**

Create `lib/store.ts`:

```ts
import type { AgentMessage, FileNode, Commit, OrchestratorState } from "@/types";

let state: OrchestratorState = {
  status: "idle",
  messages: [],
  files: [],
  commits: [],
};

let listeners: Array<(msg: AgentMessage) => void> = [];

export function getState(): OrchestratorState {
  return state;
}

export function setState(partial: Partial<OrchestratorState>) {
  state = { ...state, ...partial };
}

export function addMessage(msg: AgentMessage) {
  state.messages.push(msg);
  listeners.forEach((fn) => fn(msg));
}

export function addFile(file: FileNode) {
  // Update existing or add new
  const existing = findFile(state.files, file.path);
  if (existing) {
    existing.content = file.content;
    existing.language = file.language;
  } else {
    insertFile(state.files, file);
  }
}

export function addCommit(commit: Commit) {
  state.commits.unshift(commit);
}

export function subscribe(fn: (msg: AgentMessage) => void): () => void {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function resetState() {
  state = { status: "idle", messages: [], files: [], commits: [] };
  listeners = [];
}

function findFile(nodes: FileNode[], path: string): FileNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findFile(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

function insertFile(nodes: FileNode[], file: FileNode) {
  const parts = file.path.split("/");
  if (parts.length === 1) {
    nodes.push(file);
    return;
  }

  const dirName = parts[0];
  let dir = nodes.find((n) => n.name === dirName && n.type === "directory");
  if (!dir) {
    dir = { name: dirName, path: dirName, type: "directory", children: [] };
    nodes.push(dir);
  }

  const childFile: FileNode = {
    ...file,
    path: parts.slice(1).join("/"),
    name: parts[parts.length - 1],
  };
  insertFile(dir.children!, childFile);
}
```

- [ ] **Step 2: Create the server orchestrator**

Create `lib/orchestrator.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import { planProject } from "./framework";
import {
  getState,
  setState,
  addMessage,
  addFile,
  addCommit,
} from "./store";
import type { AgentMessage, FileNode, Commit, MicroTask, WorkerResult } from "@/types";

let running = false;
let messageCounter = 0;
let turnCounter = 0;

function generateId(): string {
  return `msg-${Date.now()}-${++messageCounter}`;
}

function generateSha(): string {
  return Math.random().toString(16).slice(2, 9);
}

function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
  };
  return map[ext] || "text";
}

function extractFiles(output: string): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  const regex = /\/\/ filename: (.+)\n([\s\S]*?)(?=\/\/ filename:|$)/g;
  let match;

  while ((match = regex.exec(output)) !== null) {
    files.push({
      path: match[1].trim(),
      content: match[2].trim(),
    });
  }

  // Also try ```-delimited blocks with filenames
  if (files.length === 0) {
    const blockRegex = /```\w*\s*\n?\/\/ (.+?)\n([\s\S]*?)```/g;
    while ((match = blockRegex.exec(output)) !== null) {
      files.push({
        path: match[1].trim(),
        content: match[2].trim(),
      });
    }
  }

  return files;
}

export async function startOrchestration(prompt: string) {
  if (running) return;
  running = true;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    setState({ status: "error" });
    addMessage({
      id: generateId(),
      agent: "Yami",
      turn: 0,
      timestamp: new Date().toISOString(),
      content: "Error: ANTHROPIC_API_KEY not set",
    });
    running = false;
    return;
  }

  setState({ status: "planning" });

  try {
    await planProject({
      prompt,
      apiKey,
      onTaskStart: (task: MicroTask, agent: string, model: string) => {
        turnCounter++;
        addMessage({
          id: generateId(),
          agent,
          turn: turnCounter,
          timestamp: new Date().toISOString(),
          content: `[${model}] Starting: ${task.title}\n${task.description}`,
        });
      },
      onTaskComplete: (task: MicroTask, result: WorkerResult) => {
        // Extract and store files
        const files = extractFiles(result.output);
        const filePaths: string[] = [];

        for (const f of files) {
          const lang = detectLanguage(f.path);
          const fileNode: FileNode = {
            name: f.path.split("/").pop() || f.path,
            path: f.path,
            type: "file",
            content: f.content,
            language: lang,
          };
          addFile(fileNode);
          filePaths.push(f.path);
        }

        // Create commit
        if (filePaths.length > 0) {
          const commit: Commit = {
            sha: generateSha(),
            message: task.title,
            description: task.description,
            agent: task.assignedAgent || "Rei",
            timestamp: new Date().toISOString(),
            files: filePaths,
          };
          addCommit(commit);
        }

        // Add completion message with code
        turnCounter++;
        const msg: AgentMessage = {
          id: generateId(),
          agent: task.assignedAgent || "Rei",
          turn: turnCounter,
          timestamp: new Date().toISOString(),
          content: result.output.split("\n").slice(0, 3).join("\n"),
        };

        if (files.length > 0) {
          msg.codeBlock = {
            filename: files[0].path,
            language: detectLanguage(files[0].path),
            code: files[0].content.slice(0, 2000),
          };
        }

        addMessage(msg);
      },
      onMessage: (agent: string, content: string) => {
        // General status messages
        addMessage({
          id: generateId(),
          agent,
          turn: turnCounter,
          timestamp: new Date().toISOString(),
          content,
        });
      },
    });

    setState({ status: "completed" });
  } catch (error) {
    setState({ status: "error" });
    addMessage({
      id: generateId(),
      agent: "Yami",
      turn: turnCounter,
      timestamp: new Date().toISOString(),
      content: `Orchestration error: ${error instanceof Error ? error.message : String(error)}`,
    });
  } finally {
    running = false;
  }
}

export function isRunning() {
  return running;
}
```

- [ ] **Step 3: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add lib/store.ts lib/orchestrator.ts
git commit -m "feat: add in-memory store and server orchestrator"
```

---

## Task 6: API Routes

**Files:**
- Create: `app/api/agents/route.ts`
- Create: `app/api/files/route.ts`
- Create: `app/api/commits/route.ts`
- Create: `app/api/download/route.ts`

- [ ] **Step 1: Create agents streaming route**

Create `app/api/agents/route.ts`:

```ts
import { NextRequest } from "next/server";
import { startOrchestration, isRunning } from "@/lib/orchestrator";
import { subscribe, getState } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return new Response(JSON.stringify({ error: "prompt required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Start orchestration in background if not already running
  if (!isRunning()) {
    startOrchestration(prompt);
  }

  // Stream messages via SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send existing messages first
      const state = getState();
      for (const msg of state.messages) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(msg)}\n\n`)
        );
      }

      // Subscribe to new messages
      const unsubscribe = subscribe((msg) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(msg)}\n\n`)
          );
        } catch {
          unsubscribe();
        }
      });

      // Check for completion periodically
      const interval = setInterval(() => {
        const s = getState();
        if (s.status === "completed" || s.status === "error") {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done", status: s.status })}\n\n`
            )
          );
          clearInterval(interval);
          unsubscribe();
          controller.close();
        }
      }, 2000);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 2: Create files route**

Create `app/api/files/route.ts`:

```ts
import { getState } from "@/lib/store";

export async function GET() {
  const state = getState();
  return Response.json({ files: state.files });
}
```

- [ ] **Step 3: Create commits route**

Create `app/api/commits/route.ts`:

```ts
import { getState } from "@/lib/store";

export async function GET() {
  const state = getState();
  return Response.json({ commits: state.commits });
}
```

- [ ] **Step 4: Create download route**

Create `app/api/download/route.ts`:

```ts
import { readFileSync } from "fs";
import { join } from "path";
import archiver from "archiver";
import { Readable } from "stream";

const FRAMEWORK_FILES = [
  "index.ts",
  "planner.ts",
  "router.ts",
  "worker.ts",
  "context.ts",
  "recovery.ts",
];

export async function GET() {
  const frameworkDir = join(process.cwd(), "lib", "framework");
  const chunks: Buffer[] = [];

  return new Promise<Response>((resolve) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const passthrough = new (require("stream").PassThrough)();

    passthrough.on("data", (chunk: Buffer) => chunks.push(chunk));
    passthrough.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(
        new Response(buffer, {
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": "attachment; filename=zyraos-framework.zip",
          },
        })
      );
    });

    archive.pipe(passthrough);

    for (const file of FRAMEWORK_FILES) {
      try {
        const content = readFileSync(join(frameworkDir, file), "utf-8");
        archive.append(content, { name: `zyraos/${file}` });
      } catch {
        // Skip missing files
      }
    }

    archive.finalize();
  });
}
```

- [ ] **Step 5: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add app/api/
git commit -m "feat: add API routes (agents stream, files, commits, download)"
```

---

## Task 7: Shared UI Components

**Files:**
- Create: `components/LivePulse.tsx`
- Create: `components/CodeViewer.tsx`
- Create: `components/MessageFeed.tsx`

- [ ] **Step 1: Create LivePulse component**

Create `components/LivePulse.tsx`:

```tsx
"use client";

export default function LivePulse() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-primary)" }}>
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          backgroundColor: "var(--color-accent)",
          animation: "livePulse 2s ease-in-out infinite",
        }}
      />
      Live
    </span>
  );
}
```

- [ ] **Step 2: Create CodeViewer component**

Create `components/CodeViewer.tsx`:

```tsx
"use client";

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeViewer({ code, language, filename }: CodeViewerProps) {
  const lines = code.split("\n");

  return (
    <div
      className="rounded-lg overflow-hidden border"
      style={{
        borderColor: "var(--color-tertiary)",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      {filename && (
        <div
          className="px-4 py-2 text-[12px] font-medium border-b"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--color-tertiary)",
            color: "var(--color-secondary)",
          }}
        >
          {filename}
          {language && (
            <span className="ml-2 opacity-50">{language}</span>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr
                key={i}
                className="transition-fast hover:bg-[rgba(204,0,0,0.05)]"
              >
                <td
                  className="select-none text-right px-3 py-0 text-[12px] border-r w-[1%] whitespace-nowrap"
                  style={{
                    color: "var(--color-dim)",
                    borderColor: "var(--color-tertiary)",
                  }}
                >
                  {i + 1}
                </td>
                <td className="px-4 py-0">
                  <pre
                    className="text-[13px]"
                    style={{ color: "var(--color-primary)", fontFamily: "var(--font-mono)" }}
                  >
                    {line || " "}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create MessageFeed component**

Create `components/MessageFeed.tsx`:

```tsx
"use client";

import type { AgentMessage } from "@/types";
import CodeViewer from "./CodeViewer";

const AGENT_COLORS: Record<string, string> = {
  Yami: "#ff1a1a",
  Akira: "#cc0000",
  Rei: "#990000",
  Kira: "#660000",
};

interface MessageFeedProps {
  messages: AgentMessage[];
}

export default function MessageFeed({ messages }: MessageFeedProps) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="rounded-lg border p-4"
          style={{
            borderColor: "var(--color-tertiary)",
            backgroundColor: "var(--bg-secondary)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: AGENT_COLORS[msg.agent] || "var(--color-primary)" }}
            />
            <span
              className="text-[13px] font-medium"
              style={{ color: AGENT_COLORS[msg.agent] || "var(--color-primary)" }}
            >
              {msg.agent}
            </span>
            <span className="text-[11px]" style={{ color: "var(--color-dim)" }}>
              Turn {msg.turn}
            </span>
            <span className="text-[11px] ml-auto" style={{ color: "var(--color-dim)" }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--color-primary)" }}>
            {msg.content}
          </div>

          {msg.codeBlock && (
            <div className="mt-3">
              <CodeViewer
                code={msg.codeBlock.code}
                language={msg.codeBlock.language}
                filename={msg.codeBlock.filename}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add components/
git commit -m "feat: add shared UI components (LivePulse, CodeViewer, MessageFeed)"
```

---

## Task 8: Header & Sidebar Components

**Files:**
- Create: `components/Header.tsx`
- Create: `components/Sidebar.tsx`
- Create: `components/FileTree.tsx`

- [ ] **Step 1: Create Header component**

Create `components/Header.tsx`:

```tsx
"use client";

import Link from "next/link";
import type { TabName } from "@/types";

interface HeaderProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  counts?: { code: number; agents: number; commits: number };
}

const TABS: { name: TabName; label: string }[] = [
  { name: "code", label: "Code" },
  { name: "agents", label: "Agents" },
  { name: "commits", label: "Commits" },
];

export default function Header({ activeTab, onTabChange, counts }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[48px] flex items-center px-4 border-b"
      style={{
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "var(--color-tertiary)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="text-[15px] font-semibold tracking-wide glow-text-strong no-underline"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--color-primary)",
          letterSpacing: "0.5px",
        }}
      >
        ZyraOS
      </Link>

      {/* Nav tabs */}
      <nav className="hidden md:flex items-center gap-1 mx-auto">
        {TABS.map((tab) => (
          <button
            key={tab.name}
            onClick={() => onTabChange(tab.name)}
            className="relative px-3 py-1 text-[13px] font-medium transition-base rounded"
            style={{
              color: activeTab === tab.name ? "var(--color-accent)" : "var(--color-secondary)",
              backgroundColor: activeTab === tab.name ? "rgba(204, 0, 0, 0.08)" : "transparent",
              textShadow: activeTab === tab.name ? "0 0 12px rgba(204, 0, 0, 0.4)" : "none",
            }}
          >
            {tab.label}
            {counts && counts[tab.name] > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full border"
                style={{
                  borderColor: "var(--color-tertiary)",
                  color: "var(--color-secondary)",
                }}
              >
                {counts[tab.name]}
              </span>
            )}
            {activeTab === tab.name && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded"
                style={{ backgroundColor: "var(--color-primary)" }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto md:ml-0">
        <Link
          href="/about"
          className="text-[13px] font-medium transition-base no-underline"
          style={{ color: "var(--color-secondary)" }}
        >
          Framework
        </Link>
        <a
          href="/api/download"
          className="px-3 py-1 text-[12px] font-medium border rounded transition-base no-underline"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-primary)",
          }}
        >
          Download Framework
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create FileTree component**

Create `components/FileTree.tsx`:

```tsx
"use client";

import type { FileNode } from "@/types";

interface FileTreeProps {
  nodes: FileNode[];
  selectedPath?: string;
  onSelect: (node: FileNode) => void;
  depth?: number;
}

function FileIcon({ type }: { type: "file" | "directory" }) {
  if (type === "directory") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M1 3.5C1 2.67 1.67 2 2.5 2H6l1.5 2H13.5C14.33 4 15 4.67 15 5.5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V3.5Z"
          fill="var(--color-secondary)"
          opacity="0.6"
        />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 1.5C3 0.67 3.67 0 4.5 0H9.5L13 3.5V14.5C13 15.33 12.33 16 11.5 16H4.5C3.67 16 3 15.33 3 14.5V1.5Z"
        fill="var(--color-tertiary)"
      />
    </svg>
  );
}

export default function FileTree({ nodes, selectedPath, onSelect, depth = 0 }: FileTreeProps) {
  return (
    <div>
      {nodes.map((node) => (
        <div key={node.path}>
          <button
            onClick={() => onSelect(node)}
            className="w-full flex items-center gap-2 py-1 text-[13px] transition-fast text-left"
            style={{
              paddingLeft: `${16 + depth * 16}px`,
              color: selectedPath === node.path ? "var(--color-accent)" : "var(--color-secondary)",
              backgroundColor: selectedPath === node.path ? "rgba(204, 0, 0, 0.06)" : "transparent",
              borderLeft: selectedPath === node.path ? "2px solid var(--color-primary)" : "2px solid transparent",
            }}
          >
            <FileIcon type={node.type} />
            <span>{node.name}</span>
          </button>
          {node.type === "directory" && node.children && (
            <FileTree
              nodes={node.children}
              selectedPath={selectedPath}
              onSelect={onSelect}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create Sidebar component**

Create `components/Sidebar.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { FileNode } from "@/types";
import FileTree from "./FileTree";

interface SidebarProps {
  files: FileNode[];
  selectedPath?: string;
  onSelect: (node: FileNode) => void;
}

export default function Sidebar({ files, selectedPath, onSelect }: SidebarProps) {
  const [search, setSearch] = useState("");

  return (
    <aside
      className="hidden lg:flex flex-col w-[300px] border-r h-[calc(100vh-48px)] fixed top-[48px] left-0 overflow-hidden"
      style={{
        borderColor: "var(--color-tertiary)",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: "var(--color-tertiary)" }}>
        <input
          type="text"
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 text-[13px] rounded border outline-none transition-base"
          style={{
            backgroundColor: "transparent",
            borderColor: "var(--color-tertiary)",
            color: "var(--color-primary)",
          }}
        />
      </div>

      {/* File tree */}
      <div className="flex-1 overflow-y-auto py-2">
        <FileTree
          nodes={files}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add components/Header.tsx components/FileTree.tsx components/Sidebar.tsx
git commit -m "feat: add Header, Sidebar, and FileTree components"
```

---

## Task 9: Dashboard View Components

**Files:**
- Create: `components/CodeView.tsx`
- Create: `components/AgentsView.tsx`
- Create: `components/CommitsView.tsx`

- [ ] **Step 1: Create CodeView component**

Create `components/CodeView.tsx`:

```tsx
"use client";

import type { FileNode } from "@/types";
import CodeViewer from "./CodeViewer";

interface CodeViewProps {
  files: FileNode[];
  selectedFile?: FileNode;
  onFileSelect: (node: FileNode) => void;
}

export default function CodeView({ files, selectedFile, onFileSelect }: CodeViewProps) {
  // Flatten files for the file list
  const flatFiles = flattenFiles(files);

  return (
    <div className="flex flex-col h-full">
      {/* File browser header */}
      <div
        className="flex items-center px-4 py-2 border-b text-[12px]"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          borderColor: "var(--color-tertiary)",
          color: "var(--color-secondary)",
        }}
      >
        <span>zyraos-blockchain</span>
        <span className="mx-2 opacity-30">/</span>
        <span>{selectedFile?.path || "src"}</span>
      </div>

      {selectedFile?.content ? (
        /* Code viewer */
        <div className="flex-1 overflow-auto p-4">
          <CodeViewer
            code={selectedFile.content}
            language={selectedFile.language}
            filename={selectedFile.path}
          />
        </div>
      ) : (
        /* File list */
        <div className="flex-1 overflow-auto">
          {flatFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => onFileSelect(file)}
              className="w-full flex items-center px-4 py-2 border-b text-left transition-fast"
              style={{
                borderColor: "rgba(77, 0, 0, 0.3)",
                color: "var(--color-primary)",
              }}
            >
              <span className="text-[13px]">{file.name}</span>
              <span className="ml-auto text-[11px]" style={{ color: "var(--color-dim)" }}>
                {file.language || "text"}
              </span>
            </button>
          ))}

          {flatFiles.length === 0 && (
            <div className="flex items-center justify-center h-48 text-[13px]" style={{ color: "var(--color-dim)" }}>
              Waiting for agents to generate files...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") {
      result.push(node);
    }
    if (node.children) {
      result.push(...flattenFiles(node.children));
    }
  }
  return result;
}
```

- [ ] **Step 2: Create AgentsView component**

Create `components/AgentsView.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { AgentMessage } from "@/types";
import MessageFeed from "./MessageFeed";

const AGENTS = [
  { name: "Yami", dotColor: "#ff1a1a" },
  { name: "Akira", dotColor: "#cc0000" },
  { name: "Rei", dotColor: "#990000" },
  { name: "Kira", dotColor: "#660000" },
];

interface AgentsViewProps {
  messages: AgentMessage[];
}

export default function AgentsView({ messages }: AgentsViewProps) {
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const filteredMessages = activeAgent
    ? messages.filter((m) => m.agent === activeAgent)
    : messages;

  return (
    <div className="flex flex-col h-full">
      {/* Agent tab bar */}
      <div
        className="sticky top-0 z-10 flex items-center gap-1 px-4 py-2 border-b"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          borderColor: "var(--color-tertiary)",
        }}
      >
        <button
          onClick={() => setActiveAgent(null)}
          className="px-3 py-1 text-[13px] font-medium rounded transition-base"
          style={{
            color: activeAgent === null ? "var(--color-accent)" : "var(--color-secondary)",
            backgroundColor: activeAgent === null ? "rgba(204, 0, 0, 0.08)" : "transparent",
            textShadow: activeAgent === null ? "0 0 12px rgba(204, 0, 0, 0.4)" : "none",
          }}
        >
          All
        </button>

        {AGENTS.map((agent) => (
          <button
            key={agent.name}
            onClick={() => setActiveAgent(agent.name)}
            className="flex items-center gap-1.5 px-3 py-1 text-[13px] font-medium rounded transition-base"
            style={{
              color: activeAgent === agent.name ? "var(--color-accent)" : "var(--color-secondary)",
              backgroundColor: activeAgent === agent.name ? "rgba(204, 0, 0, 0.08)" : "transparent",
              textShadow: activeAgent === agent.name ? "0 0 12px rgba(204, 0, 0, 0.4)" : "none",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: agent.dotColor }}
            />
            {agent.name}
            {activeAgent === agent.name && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded"
                style={{ backgroundColor: agent.dotColor }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Message feed */}
      <div className="flex-1 overflow-auto">
        {filteredMessages.length > 0 ? (
          <MessageFeed messages={filteredMessages} />
        ) : (
          <div className="flex items-center justify-center h-48 text-[13px]" style={{ color: "var(--color-dim)" }}>
            Waiting for agent activity...
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create CommitsView component**

Create `components/CommitsView.tsx`:

```tsx
"use client";

import type { Commit } from "@/types";

const AGENT_COLORS: Record<string, string> = {
  Yami: "#ff1a1a",
  Akira: "#cc0000",
  Rei: "#990000",
  Kira: "#660000",
};

interface CommitsViewProps {
  commits: Commit[];
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CommitsView({ commits }: CommitsViewProps) {
  return (
    <div className="flex flex-col">
      {commits.map((commit) => (
        <div
          key={commit.sha}
          className="flex items-start gap-3 px-4 py-3 border-b transition-fast"
          style={{
            borderColor: "rgba(77, 0, 0, 0.3)",
          }}
        >
          {/* Avatar */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
            style={{
              backgroundColor: AGENT_COLORS[commit.agent] || "var(--color-tertiary)",
              color: "var(--bg-primary)",
            }}
          >
            {commit.agent[0]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium" style={{ color: "var(--color-primary)" }}>
              {commit.message}
            </div>
            {commit.description && (
              <div className="text-[12px] mt-0.5" style={{ color: "var(--color-secondary)" }}>
                {commit.description}
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-mono" style={{ color: "var(--color-dim)" }}>
                {commit.sha}
              </span>
              <span className="text-[11px]" style={{ color: "var(--color-dim)" }}>
                {commit.agent}
              </span>
            </div>
          </div>

          {/* Timestamp */}
          <span className="text-[11px] shrink-0" style={{ color: "var(--color-dim)" }}>
            {timeAgo(commit.timestamp)}
          </span>
        </div>
      ))}

      {commits.length === 0 && (
        <div className="flex items-center justify-center h-48 text-[13px]" style={{ color: "var(--color-dim)" }}>
          No commits yet...
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add components/CodeView.tsx components/AgentsView.tsx components/CommitsView.tsx
git commit -m "feat: add dashboard view components (Code, Agents, Commits)"
```

---

## Task 10: Dashboard Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Build the main dashboard page**

Replace `app/page.tsx` with:

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TabName, AgentMessage, FileNode, Commit } from "@/types";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CodeView from "@/components/CodeView";
import AgentsView from "@/components/AgentsView";
import CommitsView from "@/components/CommitsView";
import LivePulse from "@/components/LivePulse";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabName>("agents");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileNode | undefined>();
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "error">("idle");
  const startedRef = useRef(false);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchCommits = useCallback(async () => {
    try {
      const res = await fetch("/api/commits");
      const data = await res.json();
      setCommits(data.commits || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    setStatus("running");

    const eventSource = new EventSource("/api/agents", {
    });

    // Use POST via fetch for SSE since EventSource only supports GET
    // We'll use a different approach: start orchestration then poll
    fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Build a blockchain from scratch in TypeScript. Include: block structure with SHA-256 hashing, a chain validator, proof-of-work consensus, a transaction system with digital signatures, a peer-to-peer networking layer, and a simple CLI interface." }),
    }).then(async (res) => {
      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "done") {
              setStatus(data.status);
            } else if (data.id) {
              setMessages((prev) => {
                if (prev.find((m) => m.id === data.id)) return prev;
                return [...prev, data];
              });
              // Refresh files and commits periodically
              fetchFiles();
              fetchCommits();
            }
          } catch {
            // ignore parse errors
          }
        }
      }
    }).catch(() => {
      setStatus("error");
    });

    return () => {};
  }, [fetchFiles, fetchCommits]);

  const counts = {
    code: files.length,
    agents: messages.length,
    commits: commits.length,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

      {/* Sub-header */}
      <div
        className="fixed top-[48px] left-0 right-0 z-40 h-[48px] flex items-center px-4 border-b"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          borderColor: "var(--color-tertiary)",
        }}
      >
        <div className="flex items-center gap-3">
          <LivePulse />
          <span className="text-[12px]" style={{ color: "var(--color-secondary)" }}>
            {status === "running" ? "Agents building blockchain..." :
             status === "completed" ? "Build complete" :
             status === "error" ? "Error occurred" :
             "Initializing..."}
          </span>
        </div>

        {/* Token address placeholder */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-mono" style={{ color: "var(--color-dim)" }}>
            CA: Coming soon
          </span>
          <a
            href="https://x.com/zyraosagent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] transition-base no-underline"
            style={{ color: "var(--color-secondary)" }}
          >
            @zyraosagent
          </a>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        files={files}
        selectedPath={selectedFile?.path}
        onSelect={(node) => {
          setSelectedFile(node);
          setActiveTab("code");
        }}
      />

      {/* Main content */}
      <main
        className="pt-[96px] lg:ml-[300px] min-h-screen"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        {activeTab === "code" && (
          <CodeView
            files={files}
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
          />
        )}
        {activeTab === "agents" && <AgentsView messages={messages} />}
        {activeTab === "commits" && <CommitsView commits={commits} />}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify dashboard loads**

```bash
cd C:/Users/dylan/coding/zyra_1
npm run dev
```

Open localhost:3000 — should see the dark red/black dashboard with header, sidebar, and content area.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add app/page.tsx
git commit -m "feat: add dashboard page with live agent streaming"
```

---

## Task 11: About Page — Hero & Content

**Files:**
- Create: `components/AboutHero.tsx`
- Create: `components/AboutContent.tsx`
- Create: `components/FrameworkBrowser.tsx`
- Create: `app/about/page.tsx`

- [ ] **Step 1: Create AboutHero component**

Create `components/AboutHero.tsx`:

```tsx
"use client";

import Image from "next/image";

export default function AboutHero() {
  return (
    <section className="relative w-full overflow-hidden border-b" style={{ borderColor: "var(--color-tertiary)" }}>
      {/* Background image */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <Image
          src="/zyra.os.jpg"
          alt="ZyraOS"
          fill
          className="object-cover"
          style={{ filter: "brightness(0.6)" }}
          priority
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)",
          }}
        />

        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1
            className="text-5xl md:text-7xl font-bold glow-text-strong"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary)",
              letterSpacing: "2px",
            }}
          >
            ZyraOS
          </h1>
          <p
            className="mt-4 text-[14px] max-w-md text-center"
            style={{ color: "var(--color-secondary)" }}
          >
            An orchestration framework for long-running, autonomous multi-agent workflows.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create AboutContent component**

Create `components/AboutContent.tsx`:

```tsx
"use client";

import Link from "next/link";
import LivePulse from "./LivePulse";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  last?: boolean;
}

function Section({ title, children, last }: SectionProps) {
  return (
    <div
      className="py-12 px-6 md:px-12"
      style={{
        borderBottom: last ? "none" : "1px solid rgba(77, 0, 0, 0.3)",
      }}
    >
      {title && (
        <h2
          className="text-lg font-semibold mb-6 glow-text"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-primary)",
          }}
        >
          {title}
        </h2>
      )}
      <div className="text-[14px] leading-relaxed max-w-3xl" style={{ color: "var(--color-secondary)" }}>
        {children}
      </div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-[14px] font-medium mb-2" style={{ color: "var(--color-primary)" }}>
        {title}
      </h3>
      <p className="text-[14px]" style={{ color: "var(--color-secondary)" }}>
        {children}
      </p>
    </div>
  );
}

export default function AboutContent() {
  return (
    <div>
      {/* Headline */}
      <Section>
        <p className="text-lg" style={{ color: "var(--color-primary)" }}>
          An orchestration framework for long-running, autonomous multi-agent workflows.
        </p>
      </Section>

      {/* What it is */}
      <Section title="What it is">
        <p>
          ZyraOS takes a simple prompt and transforms it into a coordinated multi-agent workflow.
          Four agents — Yami, Akira, Rei, and Kira — decompose, architect, build, and validate
          your project autonomously. Agent generation, task decomposition, model selection,
          context management, and error recovery are all handled by the framework.
        </p>
        <p className="mt-4">
          Agents build, test, and iterate for as long as needed — days or weeks — without human intervention.
        </p>
      </Section>

      {/* How it works */}
      <Section title="How it works">
        <SubSection title="Automatic task decomposition">
          Yami breaks any prompt into 15-40 micro-tasks with a full dependency graph. Each task is
          concrete, actionable, and sequenced so dependencies resolve before dependents execute.
        </SubSection>

        <SubSection title="Capability-based model routing">
          Every task is scored by complexity and routed to the right model. Critical architecture
          decisions go to Opus. Routine implementation goes to Sonnet. Simple scaffolding goes to Haiku.
          You pay only for the intelligence each task actually needs.
        </SubSection>

        <SubSection title="Infinite-horizon execution">
          Context windows are managed automatically. As conversations grow, older context is compressed
          and summarized so agents maintain coherence across hundreds of turns without degradation.
        </SubSection>

        <SubSection title="Zero-babysit fault tolerance">
          Failed API calls retry with exponential backoff. If a model is overloaded, the framework
          falls back to the next tier. If a task fails after all retries, execution continues around it.
          No human intervention required.
        </SubSection>
      </Section>

      {/* Prompt to project */}
      <Section title="Prompt to project">
        <div
          className="rounded-lg border p-4 font-mono text-[13px] mt-2"
          style={{
            borderColor: "var(--color-tertiary)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <pre style={{ color: "var(--color-primary)" }}>
{`import { planProject } from "zyraos";

await planProject({
  prompt: "Build a blockchain",
  apiKey: process.env.ANTHROPIC_API_KEY,
});`}
          </pre>
        </div>
      </Section>

      {/* The demonstration */}
      <Section title="The demonstration">
        <p>
          To demonstrate ZyraOS, a team of agents are building an entire blockchain from scratch,
          in realtime, from a single prompt — using the framework.
        </p>
        <p className="mt-4">
          Yami plans. Akira architects. Rei builds. Kira tests. All four work autonomously,
          producing real code and real commits that you can inspect in the live dashboard.
        </p>
        <p className="mt-4">
          If the framework can handle a working blockchain, it can handle your project.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 text-[13px] font-medium transition-base no-underline"
          style={{ color: "var(--color-accent)" }}
        >
          <LivePulse /> Watch it live
        </Link>
      </Section>

      {/* Framework source */}
      <Section title="Framework source" last>
        <p>
          Six files. Drop them into any project, pass a prompt to the Planner, and let it run.
        </p>
        <div className="mt-4">
          <a
            href="/api/download"
            className="inline-block px-4 py-2 text-[13px] font-medium border rounded transition-base no-underline"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            Download zyraos-framework.zip
          </a>
        </div>
      </Section>
    </div>
  );
}
```

- [ ] **Step 3: Create FrameworkBrowser component**

Create `components/FrameworkBrowser.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import CodeViewer from "./CodeViewer";

interface FrameworkFile {
  name: string;
  content: string;
}

export default function FrameworkBrowser() {
  const [files, setFiles] = useState<FrameworkFile[]>([]);
  const [activeFile, setActiveFile] = useState<string>("index.ts");

  useEffect(() => {
    // Fetch framework files from the API
    const fileNames = ["index.ts", "planner.ts", "router.ts", "worker.ts", "context.ts", "recovery.ts"];

    Promise.all(
      fileNames.map(async (name) => {
        try {
          const res = await fetch(`/api/framework-source?file=${name}`);
          const data = await res.json();
          return { name, content: data.content || "// File not found" };
        } catch {
          return { name, content: "// Failed to load" };
        }
      })
    ).then(setFiles);
  }, []);

  const currentFile = files.find((f) => f.name === activeFile);

  return (
    <div
      className="border rounded-lg overflow-hidden my-6"
      style={{
        borderColor: "var(--color-tertiary)",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <div className="flex flex-col md:flex-row">
        {/* File list */}
        <div
          className="md:w-[200px] border-b md:border-b-0 md:border-r"
          style={{ borderColor: "var(--color-tertiary)" }}
        >
          {files.map((file) => (
            <button
              key={file.name}
              onClick={() => setActiveFile(file.name)}
              className="w-full text-left px-4 py-2 text-[13px] transition-fast border-b md:border-b-0"
              style={{
                borderColor: "rgba(77, 0, 0, 0.2)",
                color: activeFile === file.name ? "var(--color-accent)" : "var(--color-secondary)",
                backgroundColor: activeFile === file.name ? "rgba(204, 0, 0, 0.06)" : "transparent",
                borderLeft: activeFile === file.name ? "2px solid var(--color-primary)" : "2px solid transparent",
              }}
            >
              {file.name}
            </button>
          ))}
        </div>

        {/* Code viewer */}
        <div className="flex-1 overflow-auto max-h-[500px]">
          {currentFile && (
            <CodeViewer
              code={currentFile.content}
              language="typescript"
              filename={currentFile.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create framework-source API route**

Create `app/api/framework-source/route.ts`:

```ts
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");
  if (!file) {
    return Response.json({ error: "file param required" }, { status: 400 });
  }

  // Sanitize filename
  const safeName = file.replace(/[^a-zA-Z0-9._-]/g, "");
  const validFiles = ["index.ts", "planner.ts", "router.ts", "worker.ts", "context.ts", "recovery.ts"];

  if (!validFiles.includes(safeName)) {
    return Response.json({ error: "invalid file" }, { status: 400 });
  }

  try {
    const content = readFileSync(
      join(process.cwd(), "lib", "framework", safeName),
      "utf-8"
    );
    return Response.json({ content });
  } catch {
    return Response.json({ error: "file not found" }, { status: 404 });
  }
}
```

- [ ] **Step 5: Create the about page**

Create `app/about/page.tsx`:

```tsx
import Link from "next/link";
import AboutHero from "@/components/AboutHero";
import AboutContent from "@/components/AboutContent";
import FrameworkBrowser from "@/components/FrameworkBrowser";

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Simple header for about page */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-[48px] flex items-center px-4 border-b"
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderColor: "var(--color-tertiary)",
        }}
      >
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-wide glow-text-strong no-underline"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-primary)",
            letterSpacing: "0.5px",
          }}
        >
          ZyraOS
        </Link>

        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/"
            className="text-[13px] font-medium transition-base no-underline"
            style={{ color: "var(--color-secondary)" }}
          >
            Dashboard
          </Link>
          <a
            href="/api/download"
            className="px-3 py-1 text-[12px] font-medium border rounded transition-base no-underline"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            Download Framework
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="pt-[48px]">
        <AboutHero />
        <div className="max-w-4xl mx-auto">
          <AboutContent />
          <div className="px-6 md:px-12 pb-12">
            <h2
              className="text-lg font-semibold mb-4 glow-text"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary)",
              }}
            >
              Source files
            </h2>
            <FrameworkBrowser />
          </div>

          {/* Token & links */}
          <div
            className="px-6 md:px-12 py-8 border-t text-center"
            style={{ borderColor: "rgba(77, 0, 0, 0.3)" }}
          >
            <p className="text-[12px] font-mono mb-2" style={{ color: "var(--color-dim)" }}>
              CA: Coming soon
            </p>
            <a
              href="https://x.com/zyraosagent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] transition-base no-underline"
              style={{ color: "var(--color-secondary)" }}
            >
              @zyraosagent
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 6: Verify about page**

```bash
cd C:/Users/dylan/coding/zyra_1
npm run dev
```

Open localhost:3000/about — should see the hero image with ZyraOS text, content sections, and framework browser.

- [ ] **Step 7: Commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add components/AboutHero.tsx components/AboutContent.tsx components/FrameworkBrowser.tsx app/about/page.tsx app/api/framework-source/route.ts
git commit -m "feat: add about page with hero, content sections, and framework browser"
```

---

## Task 12: Final Polish & Build Verification

**Files:**
- Modify: `app/globals.css` (hover states)
- Create: `next.config.ts` (if needed)

- [ ] **Step 1: Add hover and focus styles to globals.css**

Append to `app/globals.css`:

```css
/* Button hover states */
a:hover,
button:hover {
  opacity: 0.85;
}

/* Focus styles */
input:focus {
  border-color: var(--color-primary) !important;
  outline: none;
  box-shadow: 0 0 0 1px var(--color-tertiary);
}

/* Link hover */
a.transition-base:hover {
  color: var(--color-accent) !important;
}

/* Download button hover */
a[href="/api/download"]:hover {
  background: rgba(204, 0, 0, 0.1);
  box-shadow: 0 4px 12px rgba(204, 0, 0, 0.2);
}
```

- [ ] **Step 2: Run build to verify no errors**

```bash
cd C:/Users/dylan/coding/zyra_1
npm run build
```

Expected: Build completes without errors.

- [ ] **Step 3: Fix any build errors**

If there are type errors or build issues, fix them one by one.

- [ ] **Step 4: Final commit**

```bash
cd C:/Users/dylan/coding/zyra_1
git add -A
git commit -m "feat: complete ZyraOS site — dashboard + about page"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Project scaffolding (Next.js, deps, env) |
| 2 | Global styles & CSS custom properties |
| 3 | TypeScript types |
| 4 | Framework files (6 orchestration files) |
| 5 | In-memory store & server orchestrator |
| 6 | API routes (agents, files, commits, download) |
| 7 | Shared UI components (LivePulse, CodeViewer, MessageFeed) |
| 8 | Header, Sidebar, FileTree components |
| 9 | Dashboard view components (Code, Agents, Commits) |
| 10 | Dashboard page (main `/` route) |
| 11 | About page (hero, content, framework browser) |
| 12 | Final polish & build verification |

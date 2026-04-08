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

  if (updated.tokenEstimate > updated.maxTokens * 0.8) {
    return compressContext(updated);
  }

  return updated;
}

function compressContext(ctx: ContextWindow): ContextWindow {
  if (ctx.messages.length <= 4) return ctx;

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

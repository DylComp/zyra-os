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

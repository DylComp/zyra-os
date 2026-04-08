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

function formatTime(timestamp: string): string {
  const d = new Date(timestamp);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessageFeed({ messages }: MessageFeedProps) {
  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      {[...messages].reverse().map((msg) => (
        <div
          key={msg.id}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--color-tertiary)",
            overflow: "hidden",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
              backgroundColor: AGENT_COLORS[msg.agent] || "var(--color-primary)",
            }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: AGENT_COLORS[msg.agent] || "var(--color-primary)" }}>
              {msg.agent}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-secondary)" }}>
              Turn {msg.turn}
            </span>
            <span style={{ fontSize: 11, marginLeft: "auto", flexShrink: 0, color: "var(--color-secondary)" }}>
              {formatTime(msg.timestamp)}
            </span>
          </div>

          {/* Content — force wrap */}
          <div style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--color-primary)",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
          }}>
            {msg.content}
          </div>

          {msg.codeBlock && (
            <div style={{ marginTop: 8 }}>
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

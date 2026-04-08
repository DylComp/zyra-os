"use client";

import type { Commit } from "@/types";

const AGENT_COLORS: Record<string, string> = {
  Yami: "#a366ff",
  Akira: "#7b4fbf",
  Rei: "#5b2d99",
  Kira: "#3d1a66",
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
    <div style={{ width: "100%", overflow: "hidden" }}>
      {[...commits].reverse().map((commit) => (
        <div
          key={commit.sha}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "12px 16px",
            borderBottom: "1px solid var(--color-tertiary)",
            overflow: "hidden",
          }}
        >
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2,
            backgroundColor: AGENT_COLORS[commit.agent] || "var(--color-tertiary)",
            color: "var(--bg-primary)",
          }}>
            {commit.agent[0]}
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{
              fontSize: 13, fontWeight: 500, color: "var(--color-primary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {commit.message}
            </div>
            {commit.description && (
              <div style={{
                fontSize: 12, marginTop: 2, color: "var(--color-secondary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {commit.description}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-secondary)" }}>
                {commit.sha}
              </span>
              <span style={{ fontSize: 11, color: "var(--color-secondary)" }}>
                {commit.agent}
              </span>
            </div>
          </div>

          <span style={{ fontSize: 11, flexShrink: 0, color: "var(--color-secondary)" }}>
            {timeAgo(commit.timestamp)}
          </span>
        </div>
      ))}
      {commits.length === 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 192, fontSize: 13, color: "var(--color-secondary)" }}>
          No commits yet...
        </div>
      )}
    </div>
  );
}

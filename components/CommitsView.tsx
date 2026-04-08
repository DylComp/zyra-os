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
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
            style={{
              backgroundColor: AGENT_COLORS[commit.agent] || "var(--color-tertiary)",
              color: "var(--bg-primary)",
            }}
          >
            {commit.agent[0]}
          </div>

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

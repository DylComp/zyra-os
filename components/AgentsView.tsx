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
          </button>
        ))}
      </div>

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

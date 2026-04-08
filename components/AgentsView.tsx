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
    <div style={{ width: "100%", overflow: "hidden" }}>
      {/* Agent tab bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "8px 16px",
          borderBottom: "1px solid var(--color-tertiary)",
          backgroundColor: "var(--bg-tertiary)",
          overflowX: "auto",
        }}
      >
        <button
          onClick={() => setActiveAgent(null)}
          style={{
            padding: "6px 12px",
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 4,
            border: "none",

            fontFamily: "var(--font-mono)",
            color: activeAgent === null ? "var(--color-accent)" : "var(--color-secondary)",
            backgroundColor: activeAgent === null ? "rgba(204, 0, 0, 0.1)" : "transparent",
            borderBottom: activeAgent === null ? "2px solid var(--color-primary)" : "2px solid transparent",
            whiteSpace: "nowrap",
          }}
        >
          All
        </button>
        {AGENTS.map((agent) => {
          const isActive = activeAgent === agent.name;
          const count = messages.filter((m) => m.agent === agent.name).length;
          return (
            <button
              key={agent.name}
              onClick={() => setActiveAgent(agent.name)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 4,
                border: "none",
    
                fontFamily: "var(--font-mono)",
                color: isActive ? "var(--color-accent)" : "var(--color-secondary)",
                backgroundColor: isActive ? "rgba(204, 0, 0, 0.1)" : "transparent",
                borderBottom: isActive ? "2px solid var(--color-primary)" : "2px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: agent.dotColor, flexShrink: 0 }} />
              {agent.name}
              {count > 0 && (
                <span style={{ fontSize: 10, padding: "0 6px", borderRadius: 999, backgroundColor: "rgba(204, 0, 0, 0.15)", color: isActive ? "var(--color-accent)" : "var(--color-secondary)" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Workspace card */}
      <div style={{ padding: 16 }}>
        <div style={{
          borderRadius: 8,
          backgroundColor: "var(--bg-secondary)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
          border: "1px solid var(--color-tertiary)",
          overflow: "hidden",
        }}>
          {/* Card header */}
          <div style={{
            padding: "10px 16px",
            borderBottom: "1px solid var(--color-tertiary)",
            backgroundColor: "var(--bg-tertiary)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: activeAgent ? AGENTS.find((a) => a.name === activeAgent)?.dotColor : "var(--color-accent)",
            }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-primary)" }}>
              {activeAgent ? `${activeAgent} — Agent Workspace` : "All Agents"}
            </span>
            <span style={{ fontSize: 11, marginLeft: "auto", color: "var(--color-secondary)" }}>
              {filteredMessages.length} messages
            </span>
          </div>

          {/* Messages */}
          <div style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto", overflowX: "hidden" }}>
            {filteredMessages.length > 0 ? (
              <>
                <MessageFeed messages={filteredMessages} />
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 192, fontSize: 13, color: "var(--color-secondary)" }}>
                Waiting for agent activity...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

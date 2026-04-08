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

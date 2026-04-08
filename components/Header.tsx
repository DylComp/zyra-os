"use client";

import Link from "next/link";
import type { TabName } from "@/types";

interface HeaderProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  counts?: { code: number; agents: number; commits: number };
}

const TABS: { name: TabName; label: string; icon: string }[] = [
  { name: "code", label: "Code", icon: "<>" },
  { name: "agents", label: "Agents", icon: "\u{1D5A5}" },
  { name: "commits", label: "Commits", icon: "\u{25CB}" },
];

export default function Header({ activeTab, onTabChange, counts }: HeaderProps) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[48px] flex items-center px-5 border-b"
      style={{
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "var(--color-tertiary)",
      }}
    >
      {/* Logo */}
      <span className="text-[11px] opacity-70" style={{ color: "var(--color-primary)" }}>𝖥</span>
      <Link
        href="/"
        className="text-[15px] font-semibold tracking-wide no-underline shrink-0"
        style={{
          fontFamily: "var(--font-serif)",
          color: "var(--color-primary)",
          letterSpacing: "0.5px",
          textShadow: "0 0 16px rgba(204, 0, 0, 0.3)",
        }}
      >
        ZyraOS
      </Link>

      {/* Center nav */}
      <nav className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.name;
          const count = counts?.[tab.name] ?? 0;
          return (
            <button
              key={tab.name}
              onClick={() => onTabChange(tab.name)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded transition-base"
              style={{
                color: isActive ? "var(--color-accent)" : "var(--color-secondary)",
                backgroundColor: isActive ? "rgba(204, 0, 0, 0.1)" : "transparent",
                textShadow: isActive ? "0 0 12px rgba(204, 0, 0, 0.4)" : "none",
              }}
            >
              <span className="text-[11px] opacity-70">{tab.icon}</span>
              {tab.label}
              {count > 0 && (
                <span
                  className="ml-1 px-1.5 py-0 text-[10px] rounded-full"
                  style={{
                    backgroundColor: "rgba(204, 0, 0, 0.15)",
                    color: isActive ? "var(--color-accent)" : "var(--color-secondary)",
                  }}
                >
                  {count}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-4 ml-auto">
        <Link
          href="/about"
          className="hidden sm:block no-underline"
          style={{
            fontSize: 16,
            color: "var(--color-primary)",
            textShadow: "0 0 8px rgba(204, 0, 0, 0.5)",
            animation: "flicker 3s infinite",
          }}
          title="Framework"
        >
          鬼
        </Link>
        <a
          href="/api/download"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium border rounded transition-base no-underline"
          style={{
            borderColor: "var(--color-primary)",
            color: "var(--color-primary)",
          }}
        >
          Download
        </a>
      </div>
    </header>
  );
}

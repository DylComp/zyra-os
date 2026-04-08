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

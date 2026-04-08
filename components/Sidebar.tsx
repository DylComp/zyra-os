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

  const filterNodes = (nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes;
    return nodes.reduce<FileNode[]>((acc, node) => {
      if (node.name.toLowerCase().includes(query.toLowerCase())) {
        acc.push(node);
      } else if (node.children) {
        const filtered = filterNodes(node.children, query);
        if (filtered.length > 0) {
          acc.push({ ...node, children: filtered });
        }
      }
      return acc;
    }, []);
  };

  const filtered = filterNodes(files, search);

  return (
    <aside
      className="hidden lg:flex flex-col w-[300px] border-r h-[calc(100vh-96px)] fixed top-[96px] left-0 overflow-hidden z-30"
      style={{
        borderColor: "var(--color-tertiary)",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div className="p-3 border-b" style={{ borderColor: "var(--color-tertiary)" }}>
        <input
          type="text"
          placeholder="Go to file..."
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
          nodes={filtered}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      </div>
    </aside>
  );
}

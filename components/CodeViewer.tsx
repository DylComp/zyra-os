"use client";

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeViewer({ code, language, filename }: CodeViewerProps) {
  const lines = code.split("\n");

  return (
    <div
      className="rounded-lg border"
      style={{
        borderColor: "var(--color-tertiary)",
        backgroundColor: "var(--bg-secondary)",
        overflow: "hidden",
      }}
    >
      {filename && (
        <div
          className="px-4 py-2 text-[12px] font-medium border-b flex items-center gap-2"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--color-tertiary)",
            color: "var(--color-secondary)",
          }}
        >
          <span>{filename}</span>
          {language && (
            <span className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ backgroundColor: "rgba(204, 0, 0, 0.1)", color: "var(--color-secondary)" }}>
              {language}
            </span>
          )}
          <span className="ml-auto text-[10px]" style={{ color: "var(--color-secondary)" }}>
            {lines.length} lines
          </span>
        </div>
      )}
      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "500px" }}>
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex transition-fast hover:bg-[rgba(204,0,0,0.04)]"
            style={{ minHeight: "20px" }}
          >
            <span
              className="select-none text-right shrink-0 px-3 border-r"
              style={{
                width: "48px",
                color: "var(--color-tertiary)",
                borderColor: "var(--color-tertiary)",
                fontSize: "12px",
                lineHeight: "20px",
              }}
            >
              {i + 1}
            </span>
            <code
              className="block px-4"
              style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                lineHeight: "20px",
                whiteSpace: "pre",
              }}
            >
              {line || " "}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

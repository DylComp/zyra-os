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
      className="rounded-lg overflow-hidden border"
      style={{
        borderColor: "var(--color-tertiary)",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      {filename && (
        <div
          className="px-4 py-2 text-[12px] font-medium border-b"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--color-tertiary)",
            color: "var(--color-secondary)",
          }}
        >
          {filename}
          {language && (
            <span className="ml-2 opacity-50">{language}</span>
          )}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr
                key={i}
                className="transition-fast hover:bg-[rgba(204,0,0,0.05)]"
              >
                <td
                  className="select-none text-right px-3 py-0 text-[12px] border-r w-[1%] whitespace-nowrap"
                  style={{
                    color: "var(--color-dim)",
                    borderColor: "var(--color-tertiary)",
                  }}
                >
                  {i + 1}
                </td>
                <td className="px-4 py-0">
                  <pre
                    className="text-[13px]"
                    style={{ color: "var(--color-primary)", fontFamily: "var(--font-mono)" }}
                  >
                    {line || " "}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

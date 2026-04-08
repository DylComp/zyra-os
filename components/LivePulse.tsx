"use client";

export default function LivePulse() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-primary)" }}>
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          backgroundColor: "var(--color-accent)",
          animation: "livePulse 2s ease-in-out infinite",
        }}
      />
      Live
    </span>
  );
}

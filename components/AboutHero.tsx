"use client";

import Image from "next/image";

export default function AboutHero() {
  return (
    <section className="relative w-full overflow-hidden border-b" style={{ borderColor: "var(--color-tertiary)" }}>
      <div className="relative w-full h-[400px] md:h-[500px]">
        <Image
          src="/zyra.os.jpg"
          alt="ZyraOS"
          fill
          className="object-cover"
          style={{ filter: "brightness(0.6)" }}
          preload
        />

        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)",
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1
            className="text-5xl md:text-7xl font-bold glow-text-strong"
            style={{
              fontFamily: "var(--font-serif)",
              color: "var(--color-primary)",
              letterSpacing: "2px",
            }}
          >
            ZyraOS
          </h1>
          <p
            className="mt-4 text-[14px] max-w-md text-center"
            style={{ color: "var(--color-secondary)" }}
          >
            An orchestration framework for long-running, autonomous multi-agent workflows.
          </p>
        </div>
      </div>
    </section>
  );
}

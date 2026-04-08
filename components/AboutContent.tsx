"use client";

import Link from "next/link";
import LivePulse from "./LivePulse";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  last?: boolean;
}

function Section({ title, children, last }: SectionProps) {
  return (
    <div
      className="py-12 px-6 md:px-12"
      style={{
        borderBottom: last ? "none" : "1px solid rgba(45, 26, 77,0.3)",
      }}
    >
      {title && (
        <h2
          className="text-lg font-semibold mb-6 glow-text"
          style={{
            fontFamily: "var(--font-serif)",
            color: "var(--color-primary)",
          }}
        >
          {title}
        </h2>
      )}
      <div className="text-[14px] leading-relaxed max-w-3xl" style={{ color: "var(--color-secondary)" }}>
        {children}
      </div>
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="text-[14px] font-medium mb-2" style={{ color: "var(--color-primary)" }}>
        {title}
      </h3>
      <p className="text-[14px]" style={{ color: "var(--color-secondary)" }}>
        {children}
      </p>
    </div>
  );
}

export default function AboutContent() {
  return (
    <div>
      <Section>
        <p className="text-lg" style={{ color: "var(--color-primary)" }}>
          She builds while you watch. Autonomous agent framework for workflows that take days, not minutes.
        </p>
      </Section>

      <Section title="What it is">
        <p>
          ZyraOS takes a simple prompt and transforms it into a coordinated multi-agent workflow.
          Four agents — Yami, Akira, Rei, and Kira — decompose, architect, build, and validate
          your project autonomously. Agent generation, task decomposition, model selection,
          context management, and error recovery are all handled by the framework.
        </p>
        <p className="mt-4">
          Agents build, test, and iterate for as long as needed — days or weeks — without human intervention.
        </p>
      </Section>

      <Section title="How it works">
        <SubSection title="Automatic task decomposition">
          Yami breaks any prompt into 15-40 micro-tasks with a full dependency graph. Each task is
          concrete, actionable, and sequenced so dependencies resolve before dependents execute.
        </SubSection>

        <SubSection title="Capability-based model routing">
          Every task is scored by complexity and routed to the right model. Critical architecture
          decisions go to Opus. Routine implementation goes to Sonnet. Simple scaffolding goes to Haiku.
          You pay only for the intelligence each task actually needs.
        </SubSection>

        <SubSection title="Infinite-horizon execution">
          Context windows are managed automatically. As conversations grow, older context is compressed
          and summarized so agents maintain coherence across hundreds of turns without degradation.
        </SubSection>

        <SubSection title="Zero-babysit fault tolerance">
          Failed API calls retry with exponential backoff. If a model is overloaded, the framework
          falls back to the next tier. If a task fails after all retries, execution continues around it.
          No human intervention required.
        </SubSection>
      </Section>

      <Section title="Prompt to project">
        <div
          className="rounded-lg border p-4 font-mono text-[13px] mt-2"
          style={{
            borderColor: "var(--color-tertiary)",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          <pre style={{ color: "var(--color-primary)" }}>
{`import { planProject } from "zyraos";

await planProject({
  prompt: "Build a blockchain",
  apiKey: process.env.ANTHROPIC_API_KEY,
});`}
          </pre>
        </div>
      </Section>

      <Section title="The demonstration">
        <p>
          To demonstrate ZyraOS, a team of agents are building an entire blockchain from scratch,
          in realtime, from a single prompt — using the framework.
        </p>
        <p className="mt-4">
          Yami plans. Akira architects. Rei builds. Kira tests. All four work autonomously,
          producing real code and real commits that you can inspect in the live dashboard.
        </p>
        <p className="mt-4">
          If the framework can handle a working blockchain, it can handle your project.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 text-[13px] font-medium transition-base no-underline"
          style={{ color: "var(--color-accent)" }}
        >
          <LivePulse /> Watch it live
        </Link>
      </Section>

      <Section title="Framework source" last>
        <p>
          Six files. Drop them into any project, pass a prompt to the Planner, and let it run.
        </p>
        <div className="mt-4">
          <a
            href="/api/download"
            className="inline-block px-4 py-2 text-[13px] font-medium border rounded transition-base no-underline"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            Download zyraos-framework.zip
          </a>
        </div>
      </Section>
    </div>
  );
}

import Link from "next/link";
import AboutHero from "@/components/AboutHero";
import AboutContent from "@/components/AboutContent";
import FrameworkBrowser from "@/components/FrameworkBrowser";

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-[48px] flex items-center px-4 border-b"
        style={{
          background: "rgba(8, 0, 26, 0.85)",
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

        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/"
            className="text-[13px] font-medium transition-base no-underline"
            style={{ color: "var(--color-secondary)" }}
          >
            Dashboard
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

      <main className="pt-[48px]">
        <AboutHero />
        <div className="max-w-4xl mx-auto">
          <AboutContent />
          <div className="px-6 md:px-12 pb-12">
            <h2
              className="text-lg font-semibold mb-4 glow-text"
              style={{
                fontFamily: "var(--font-serif)",
                color: "var(--color-primary)",
              }}
            >
              Source files
            </h2>
            <FrameworkBrowser />
          </div>

          <div
            className="px-6 md:px-12 py-8 border-t text-center"
            style={{ borderColor: "rgba(45, 26, 77,0.3)" }}
          >
          </div>
        </div>
      </main>
    </div>
  );
}

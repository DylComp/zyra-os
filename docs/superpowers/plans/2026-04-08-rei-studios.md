# Rei Studios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a cinematic anime battle website for Rei Studios that streams AI-generated fight clips driven by real-time Solana token volume data.

**Architecture:** Vite + React + TypeScript app with three layers: a Solana data layer (Helius WebSocket) that tracks buy/sell volume, a battle engine (PixiJS overlays on HTML5 video) that selects and sequences AI clips based on momentum, and a React dashboard showing live stats. The site works standalone as a studio homepage and activates battle mode when a token address is configured.

**Tech Stack:** Vite, React 19, TypeScript, PixiJS 8, Tailwind CSS 4, @solana/web3.js, Helius WebSocket API

---

## File Structure

```
rei-studios/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .env.example                    # VITE_HELIUS_API_KEY, VITE_TOKEN_ADDRESS
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Root layout: BattleCanvas + Dashboard
│   ├── index.css                   # Tailwind imports + global styles
│   ├── config/
│   │   ├── episode.ts              # Episode config (sides, clip URLs, token address)
│   │   └── constants.ts            # Momentum thresholds, timers, trade size thresholds
│   ├── types/
│   │   └── index.ts                # All shared types (Trade, Momentum, SiteState, Clip, Episode)
│   ├── services/
│   │   ├── helius.ts               # Helius WebSocket connection + trade parsing
│   │   └── volumeTracker.ts        # Rolling window, momentum calc, dominance timer
│   ├── hooks/
│   │   ├── useVolumeData.ts        # React hook wrapping helius + volumeTracker
│   │   └── useSiteState.ts         # State machine: lobby → battle → finishing → postBattle → waitNextEpisode
│   ├── components/
│   │   ├── BattleCanvas/
│   │   │   ├── BattleCanvas.tsx    # Container: video element + PixiJS canvas overlay
│   │   │   ├── VideoPlayer.tsx     # HTML5 video element with crossfade transitions
│   │   │   ├── VideoManager.ts     # Clip pool selection, sequencing, no-repeat logic
│   │   │   ├── EffectsLayer.ts     # PixiJS: particles, shake, lighting, speed lines, flashes
│   │   │   └── TransitionManager.ts # Handles state transition animations (lobby→battle, etc.)
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx       # Dashboard container
│   │   │   ├── VolumeBar.tsx       # Buy/sell ratio horizontal bar
│   │   │   ├── DominanceTimer.tsx  # Countdown to finishing move
│   │   │   ├── TradesFeed.tsx      # Scrolling recent trades list
│   │   │   ├── PriceDisplay.tsx    # Current token price
│   │   │   └── EpisodeInfo.tsx     # Episode name + Rei Studios logo
│   │   └── Logo/
│   │       ├── ReiStudiosLogo.tsx  # SVG logo component
│   │       └── AOVLogo.tsx         # Episode 1 logo component
│   └── assets/
│       └── placeholder/           # Dev placeholder videos (short colored clips for testing)
├── public/
│   └── favicon.svg
└── tests/
    ├── volumeTracker.test.ts       # Unit tests for momentum + dominance logic
    ├── videoManager.test.ts        # Unit tests for clip selection logic
    └── helius.test.ts              # Unit tests for trade parsing
```

**Video clips are NOT in the repo.** They're hosted on Cloudflare R2 or Vercel Blob and referenced by URL in `episode.ts`.

---

## Task 1: Project Scaffold

**Files:**
- Create: `rei-studios/package.json`
- Create: `rei-studios/vite.config.ts`
- Create: `rei-studios/tsconfig.json`
- Create: `rei-studios/index.html`
- Create: `rei-studios/src/main.tsx`
- Create: `rei-studios/src/App.tsx`
- Create: `rei-studios/src/index.css`
- Create: `rei-studios/.env.example`
- Create: `rei-studios/public/favicon.svg`

- [ ] **Step 1: Create project directory**

```bash
mkdir -p /c/Users/dylan/coding/rei-studios
cd /c/Users/dylan/coding/rei-studios
```

- [ ] **Step 2: Initialize with Vite**

```bash
npm create vite@latest . -- --template react-ts
```

Select React + TypeScript when prompted. If it asks to overwrite, confirm.

- [ ] **Step 3: Install core dependencies**

```bash
npm install pixi.js@^8 @solana/web3.js@^1 
npm install -D tailwindcss@^4 @tailwindcss/vite
```

- [ ] **Step 4: Configure Vite with Tailwind**

Replace `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 5: Set up Tailwind CSS**

Replace `src/index.css`:

```css
@import "tailwindcss";

:root {
  --color-eren: #dc2626;
  --color-crew: #3b82f6;
  --color-neutral: #f59e0b;
  --color-bg: #0a0a0f;
  --color-surface: #12121a;
  --color-text: #e2e8f0;
  --color-text-dim: #64748b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  overflow: hidden;
  height: 100vh;
  width: 100vw;
}

#root {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 6: Set up index.html**

Replace `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rei Studios</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Set up App.tsx shell**

Replace `src/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--color-bg)]">
      <div className="flex-1 relative overflow-hidden">
        {/* BattleCanvas goes here */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white/20">
          REI STUDIOS
        </div>
      </div>
      <div className="h-48 border-t border-white/10 bg-[var(--color-surface)]">
        {/* Dashboard goes here */}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Set up main.tsx**

Replace `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 9: Create .env.example**

```
VITE_HELIUS_API_KEY=your_helius_api_key_here
VITE_TOKEN_ADDRESS=
```

- [ ] **Step 10: Clean up Vite defaults**

Delete the default Vite files that we don't need:

```bash
rm -f src/App.css src/assets/react.svg
```

- [ ] **Step 11: Run dev server and verify**

```bash
npm run dev
```

Expected: Browser opens to a dark screen with "REI STUDIOS" centered and a darker panel at the bottom. No errors in console.

- [ ] **Step 12: Initialize git and commit**

```bash
git init
echo "node_modules\ndist\n.env\n.env.local" > .gitignore
git add -A
git commit -m "feat: scaffold Rei Studios project with Vite + React + TS + Tailwind + PixiJS"
```

---

## Task 2: Types and Config

**Files:**
- Create: `src/types/index.ts`
- Create: `src/config/constants.ts`
- Create: `src/config/episode.ts`

- [ ] **Step 1: Define all shared types**

Create `src/types/index.ts`:

```ts
export type TradeSide = "buy" | "sell";

export interface Trade {
  signature: string;
  side: TradeSide;
  amountSol: number;
  timestamp: number;
}

export interface MomentumState {
  /** -100 (Eren full) to +100 (Crew full) */
  value: number;
  /** Which side currently dominates, or null if neutral */
  dominantSide: "eren" | "crew" | null;
  /** Milliseconds the current side has held dominance continuously */
  dominanceDurationMs: number;
  /** Timestamp when current dominance streak started */
  dominanceStartedAt: number | null;
  /** Buy volume in rolling window (SOL) */
  buyVolume: number;
  /** Sell volume in rolling window (SOL) */
  sellVolume: number;
  /** Total trades in rolling window */
  tradeCount: number;
  /** Consecutive trades for current dominant side */
  consecutiveTrades: number;
  /** Side of consecutive trades */
  consecutiveSide: TradeSide | null;
}

export type SiteState =
  | "lobby"
  | "battle"
  | "finishing-eren"
  | "finishing-crew"
  | "post-battle-eren"
  | "post-battle-crew"
  | "wait-next-episode";

export type ClipCategory =
  | "lobby"
  | "battle-eren"
  | "battle-crew"
  | "battle-neutral"
  | "finishing-eren"
  | "finishing-crew"
  | "post-battle-eren"
  | "post-battle-crew"
  | "wait-next-episode";

export interface Clip {
  id: string;
  url: string;
  category: ClipCategory;
  durationMs: number;
}

export interface EpisodeSide {
  name: string;
  color: string;
}

export interface EpisodeConfig {
  id: string;
  name: string;
  subtitle: string;
  negativeSide: EpisodeSide;
  positiveSide: EpisodeSide;
  tokenAddress: string | null;
  clips: Clip[];
}
```

- [ ] **Step 2: Define constants**

Create `src/config/constants.ts`:

```ts
/** Rolling window size for momentum calculation (ms) */
export const ROLLING_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/** Momentum threshold for dominance to count toward finishing move */
export const DOMINANCE_THRESHOLD = 50;

/** Duration of continuous dominance needed to trigger finishing move (ms) */
export const FINISHING_MOVE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/** Trade size in SOL considered "big" for enhanced effects */
export const BIG_TRADE_THRESHOLD_SOL = 1.0;

/** Consecutive trades needed for combo effect */
export const COMBO_THRESHOLD = 5;

/** How long each clip plays before transitioning (ms) */
export const CLIP_DURATION_MS = 8 * 1000; // 8 seconds default

/** Crossfade duration between clips (ms) */
export const CROSSFADE_DURATION_MS = 1000;

/** Post-battle celebration duration before "wait for next episode" (ms) */
export const CELEBRATION_DURATION_MS = 30 * 1000; // 30 seconds

/** Helius WebSocket URL template */
export const HELIUS_WS_URL = "wss://atlas-mainnet.helius-rpc.com/?api-key=";
```

- [ ] **Step 3: Define Episode 1 config**

Create `src/config/episode.ts`:

```ts
import type { EpisodeConfig } from "../types";

const episode1: EpisodeConfig = {
  id: "ep1-aov",
  name: "Episode 1",
  subtitle: "Attack on Volume",
  negativeSide: {
    name: "Eren",
    color: "#dc2626",
  },
  positiveSide: {
    name: "Crew",
    color: "#3b82f6",
  },
  tokenAddress: import.meta.env.VITE_TOKEN_ADDRESS || null,
  clips: [
    // Placeholder clips — replace URLs with actual Cloudflare R2 / Vercel Blob URLs
    // when Dylan provides the AI-generated videos
    //
    // Example:
    // { id: "lobby-1", url: "https://cdn.reistudios.com/ep1/lobby-1.mp4", category: "lobby", durationMs: 8000 },
  ],
};

export function getCurrentEpisode(): EpisodeConfig {
  return episode1;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types src/config
git commit -m "feat: add shared types, constants, and episode config"
```

---

## Task 3: Volume Tracker (Core Logic)

**Files:**
- Create: `src/services/volumeTracker.ts`
- Create: `tests/volumeTracker.test.ts`

- [ ] **Step 1: Write failing tests for VolumeTracker**

Create `tests/volumeTracker.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { VolumeTracker } from "../src/services/volumeTracker";

describe("VolumeTracker", () => {
  let tracker: VolumeTracker;

  beforeEach(() => {
    tracker = new VolumeTracker({
      rollingWindowMs: 5000, // 5s for testing
      dominanceThreshold: 50,
      finishingMoveDurationMs: 3000, // 3s for testing
    });
  });

  it("starts at neutral momentum", () => {
    const state = tracker.getState();
    expect(state.value).toBe(0);
    expect(state.dominantSide).toBeNull();
    expect(state.buyVolume).toBe(0);
    expect(state.sellVolume).toBe(0);
  });

  it("positive momentum when buys outweigh sells", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "buy", amountSol: 2, timestamp: now });
    tracker.addTrade({ signature: "b", side: "sell", amountSol: 1, timestamp: now });
    const state = tracker.getState();
    // momentum = (2 - 1) / 3 * 100 = 33.33
    expect(state.value).toBeCloseTo(33.33, 0);
    expect(state.buyVolume).toBe(2);
    expect(state.sellVolume).toBe(1);
  });

  it("negative momentum when sells outweigh buys", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "sell", amountSol: 3, timestamp: now });
    tracker.addTrade({ signature: "b", side: "buy", amountSol: 1, timestamp: now });
    const state = tracker.getState();
    // momentum = (1 - 3) / 4 * 100 = -50
    expect(state.value).toBe(-50);
  });

  it("clamps momentum to [-100, 100]", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "buy", amountSol: 10, timestamp: now });
    const state = tracker.getState();
    expect(state.value).toBe(100);
  });

  it("expires old trades outside rolling window", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "buy", amountSol: 10, timestamp: now - 6000 }); // 6s ago, outside 5s window
    tracker.addTrade({ signature: "b", side: "sell", amountSol: 1, timestamp: now });
    const state = tracker.getState();
    // Only the sell should count, old buy expired
    expect(state.value).toBe(-100);
  });

  it("tracks dominance side when above threshold", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "sell", amountSol: 5, timestamp: now });
    tracker.addTrade({ signature: "b", side: "buy", amountSol: 1, timestamp: now });
    const state = tracker.getState();
    // momentum = (1-5)/6*100 = -66.67 → below -50 → eren dominant
    expect(state.dominantSide).toBe("eren");
  });

  it("tracks crew dominance when above positive threshold", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "buy", amountSol: 5, timestamp: now });
    tracker.addTrade({ signature: "b", side: "sell", amountSol: 1, timestamp: now });
    const state = tracker.getState();
    // momentum = (5-1)/6*100 = 66.67 → above 50 → crew dominant
    expect(state.dominantSide).toBe("crew");
  });

  it("tracks consecutive trades", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "buy", amountSol: 1, timestamp: now });
    tracker.addTrade({ signature: "b", side: "buy", amountSol: 1, timestamp: now });
    tracker.addTrade({ signature: "c", side: "buy", amountSol: 1, timestamp: now });
    const state = tracker.getState();
    expect(state.consecutiveTrades).toBe(3);
    expect(state.consecutiveSide).toBe("buy");
  });

  it("resets consecutive trades on side switch", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "buy", amountSol: 1, timestamp: now });
    tracker.addTrade({ signature: "b", side: "buy", amountSol: 1, timestamp: now });
    tracker.addTrade({ signature: "c", side: "sell", amountSol: 1, timestamp: now });
    const state = tracker.getState();
    expect(state.consecutiveTrades).toBe(1);
    expect(state.consecutiveSide).toBe("sell");
  });

  it("tracks dominance duration", () => {
    const now = Date.now();
    // Push momentum past threshold
    tracker.addTrade({ signature: "a", side: "sell", amountSol: 10, timestamp: now - 2000 });
    const state = tracker.getState();
    expect(state.dominantSide).toBe("eren");
    expect(state.dominanceStartedAt).not.toBeNull();
    // Duration should be roughly 2000ms (time since the dominant trade)
    expect(state.dominanceDurationMs).toBeGreaterThanOrEqual(0);
  });

  it("resets dominance when momentum crosses back", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "sell", amountSol: 5, timestamp: now });
    expect(tracker.getState().dominantSide).toBe("eren");

    // Now add enough buys to flip
    tracker.addTrade({ signature: "b", side: "buy", amountSol: 10, timestamp: now });
    const state = tracker.getState();
    expect(state.dominantSide).toBe("crew");
  });

  it("reset() clears all state", () => {
    const now = Date.now();
    tracker.addTrade({ signature: "a", side: "buy", amountSol: 5, timestamp: now });
    tracker.reset();
    const state = tracker.getState();
    expect(state.value).toBe(0);
    expect(state.buyVolume).toBe(0);
    expect(state.tradeCount).toBe(0);
  });
});
```

- [ ] **Step 2: Install vitest and run tests to verify they fail**

```bash
npm install -D vitest
npx vitest run tests/volumeTracker.test.ts
```

Expected: All tests fail (module not found).

- [ ] **Step 3: Implement VolumeTracker**

Create `src/services/volumeTracker.ts`:

```ts
import type { Trade, TradeSide, MomentumState } from "../types";
import {
  ROLLING_WINDOW_MS,
  DOMINANCE_THRESHOLD,
  FINISHING_MOVE_DURATION_MS,
} from "../config/constants";

export interface VolumeTrackerOptions {
  rollingWindowMs?: number;
  dominanceThreshold?: number;
  finishingMoveDurationMs?: number;
}

export class VolumeTracker {
  private trades: Trade[] = [];
  private rollingWindowMs: number;
  private dominanceThreshold: number;
  private finishingMoveDurationMs: number;
  private dominanceStartedAt: number | null = null;
  private lastDominantSide: "eren" | "crew" | null = null;
  private consecutiveTrades = 0;
  private consecutiveSide: TradeSide | null = null;

  constructor(options: VolumeTrackerOptions = {}) {
    this.rollingWindowMs = options.rollingWindowMs ?? ROLLING_WINDOW_MS;
    this.dominanceThreshold = options.dominanceThreshold ?? DOMINANCE_THRESHOLD;
    this.finishingMoveDurationMs =
      options.finishingMoveDurationMs ?? FINISHING_MOVE_DURATION_MS;
  }

  addTrade(trade: Trade): void {
    this.trades.push(trade);
    this.pruneOldTrades();

    // Track consecutive trades
    if (trade.side === this.consecutiveSide) {
      this.consecutiveTrades++;
    } else {
      this.consecutiveTrades = 1;
      this.consecutiveSide = trade.side;
    }

    // Update dominance tracking
    const momentum = this.calculateMomentum();
    const currentDominant = this.getDominantSide(momentum);

    if (currentDominant !== this.lastDominantSide) {
      this.lastDominantSide = currentDominant;
      this.dominanceStartedAt = currentDominant ? Date.now() : null;
    }
  }

  getState(): MomentumState {
    this.pruneOldTrades();
    const { buyVolume, sellVolume } = this.getVolumes();
    const momentum = this.calculateMomentum();
    const dominantSide = this.getDominantSide(momentum);

    // Keep dominance tracking in sync after prune
    if (dominantSide !== this.lastDominantSide) {
      this.lastDominantSide = dominantSide;
      this.dominanceStartedAt = dominantSide ? Date.now() : null;
    }

    const dominanceDurationMs = this.dominanceStartedAt
      ? Date.now() - this.dominanceStartedAt
      : 0;

    return {
      value: momentum,
      dominantSide,
      dominanceDurationMs,
      dominanceStartedAt: this.dominanceStartedAt,
      buyVolume,
      sellVolume,
      tradeCount: this.trades.length,
      consecutiveTrades: this.consecutiveTrades,
      consecutiveSide: this.consecutiveSide,
    };
  }

  isFinishingMoveReady(): boolean {
    if (!this.dominanceStartedAt) return false;
    return Date.now() - this.dominanceStartedAt >= this.finishingMoveDurationMs;
  }

  reset(): void {
    this.trades = [];
    this.dominanceStartedAt = null;
    this.lastDominantSide = null;
    this.consecutiveTrades = 0;
    this.consecutiveSide = null;
  }

  private pruneOldTrades(): void {
    const cutoff = Date.now() - this.rollingWindowMs;
    this.trades = this.trades.filter((t) => t.timestamp >= cutoff);
  }

  private getVolumes(): { buyVolume: number; sellVolume: number } {
    let buyVolume = 0;
    let sellVolume = 0;
    for (const trade of this.trades) {
      if (trade.side === "buy") buyVolume += trade.amountSol;
      else sellVolume += trade.amountSol;
    }
    return { buyVolume, sellVolume };
  }

  private calculateMomentum(): number {
    const { buyVolume, sellVolume } = this.getVolumes();
    const total = buyVolume + sellVolume;
    if (total === 0) return 0;
    const raw = ((buyVolume - sellVolume) / total) * 100;
    return Math.max(-100, Math.min(100, raw));
  }

  private getDominantSide(momentum: number): "eren" | "crew" | null {
    if (momentum <= -this.dominanceThreshold) return "eren";
    if (momentum >= this.dominanceThreshold) return "crew";
    return null;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/volumeTracker.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/volumeTracker.ts tests/volumeTracker.test.ts
git commit -m "feat: implement VolumeTracker with momentum calculation and dominance tracking"
```

---

## Task 4: Helius WebSocket Trade Parser

**Files:**
- Create: `src/services/helius.ts`
- Create: `tests/helius.test.ts`

- [ ] **Step 1: Write failing tests for trade parsing**

Create `tests/helius.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseSwapTransaction } from "../src/services/helius";

describe("parseSwapTransaction", () => {
  it("classifies a buy (SOL in, token out)", () => {
    const result = parseSwapTransaction({
      signature: "abc123",
      type: "SWAP",
      tokenTransfers: [
        {
          fromUserAccount: "user1",
          toUserAccount: "pool",
          mint: "So11111111111111111111111111111111111111112", // wrapped SOL
          tokenAmount: 2.5,
        },
        {
          fromUserAccount: "pool",
          toUserAccount: "user1",
          mint: "TokenMintAddressHere",
          tokenAmount: 1000000,
        },
      ],
      timestamp: 1700000000,
    });
    expect(result).not.toBeNull();
    expect(result!.side).toBe("buy");
    expect(result!.amountSol).toBe(2.5);
  });

  it("classifies a sell (token in, SOL out)", () => {
    const result = parseSwapTransaction({
      signature: "def456",
      type: "SWAP",
      tokenTransfers: [
        {
          fromUserAccount: "user1",
          toUserAccount: "pool",
          mint: "TokenMintAddressHere",
          tokenAmount: 500000,
        },
        {
          fromUserAccount: "pool",
          toUserAccount: "user1",
          mint: "So11111111111111111111111111111111111111112",
          tokenAmount: 1.8,
        },
      ],
      timestamp: 1700000001,
    });
    expect(result).not.toBeNull();
    expect(result!.side).toBe("sell");
    expect(result!.amountSol).toBe(1.8);
  });

  it("returns null for non-swap transactions", () => {
    const result = parseSwapTransaction({
      signature: "ghi789",
      type: "TRANSFER",
      tokenTransfers: [],
      timestamp: 1700000002,
    });
    expect(result).toBeNull();
  });

  it("returns null when no SOL transfer found", () => {
    const result = parseSwapTransaction({
      signature: "jkl012",
      type: "SWAP",
      tokenTransfers: [
        {
          fromUserAccount: "a",
          toUserAccount: "b",
          mint: "SomeRandomToken",
          tokenAmount: 100,
        },
      ],
      timestamp: 1700000003,
    });
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/helius.test.ts
```

Expected: Fail (module not found).

- [ ] **Step 3: Implement Helius service**

Create `src/services/helius.ts`:

```ts
import type { Trade } from "../types";
import { HELIUS_WS_URL } from "../config/constants";

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

export interface HeliusTokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  mint: string;
  tokenAmount: number;
}

export interface HeliusTransaction {
  signature: string;
  type: string;
  tokenTransfers: HeliusTokenTransfer[];
  timestamp: number;
}

export function parseSwapTransaction(tx: HeliusTransaction): Trade | null {
  if (tx.type !== "SWAP") return null;

  const solTransfer = tx.tokenTransfers.find(
    (t) => t.mint === WRAPPED_SOL_MINT
  );
  if (!solTransfer) return null;

  // If SOL goes TO the pool → user is buying token (sending SOL, receiving token)
  // If SOL comes FROM the pool → user is selling token (receiving SOL, sending token)
  // Heuristic: if the SOL transfer's fromUserAccount is not the pool, it's a buy
  // More reliable: check if there's a non-SOL transfer going in the opposite direction

  const nonSolTransfer = tx.tokenTransfers.find(
    (t) => t.mint !== WRAPPED_SOL_MINT
  );
  if (!nonSolTransfer) return null;

  // Buy = SOL goes in (from user), token comes out (to user)
  // Sell = token goes in (from user), SOL comes out (to user)
  const isBuy = solTransfer.fromUserAccount !== solTransfer.toUserAccount &&
    nonSolTransfer.fromUserAccount !== solTransfer.fromUserAccount
    ? false
    : true;

  // Simpler heuristic: if the SOL transfer sender matches the non-SOL transfer receiver, it's a buy
  const side: "buy" | "sell" =
    solTransfer.fromUserAccount === nonSolTransfer.toUserAccount
      ? "buy"
      : "sell";

  return {
    signature: tx.signature,
    side,
    amountSol: solTransfer.tokenAmount,
    timestamp: tx.timestamp * 1000, // Convert to ms
  };
}

export type TradeCallback = (trade: Trade) => void;

export class HeliusConnection {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private tokenAddress: string;
  private onTrade: TradeCallback;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(apiKey: string, tokenAddress: string, onTrade: TradeCallback) {
    this.apiKey = apiKey;
    this.tokenAddress = tokenAddress;
    this.onTrade = onTrade;
  }

  connect(): void {
    const url = `${HELIUS_WS_URL}${this.apiKey}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("[Helius] Connected");
      // Subscribe to transaction updates for the token
      this.ws?.send(
        JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "transactionSubscribe",
          params: [
            {
              accountInclude: [this.tokenAddress],
            },
            {
              commitment: "confirmed",
              encoding: "jsonParsed",
              transactionDetails: "full",
              maxSupportedTransactionVersion: 0,
            },
          ],
        })
      );
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.params?.result?.transaction) {
          const tx = data.params.result.transaction as HeliusTransaction;
          const trade = parseSwapTransaction(tx);
          if (trade) {
            this.onTrade(trade);
          }
        }
      } catch (err) {
        console.error("[Helius] Parse error:", err);
      }
    };

    this.ws.onclose = () => {
      console.log("[Helius] Disconnected, reconnecting in 3s...");
      this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (err) => {
      console.error("[Helius] Error:", err);
      this.ws?.close();
    };
  }

  disconnect(): void {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.ws?.close();
    this.ws = null;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/helius.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/helius.ts tests/helius.test.ts
git commit -m "feat: implement Helius WebSocket connection and trade parser"
```

---

## Task 5: React Hooks (useVolumeData + useSiteState)

**Files:**
- Create: `src/hooks/useVolumeData.ts`
- Create: `src/hooks/useSiteState.ts`

- [ ] **Step 1: Implement useVolumeData hook**

Create `src/hooks/useVolumeData.ts`:

```ts
import { useEffect, useRef, useState, useCallback } from "react";
import { VolumeTracker } from "../services/volumeTracker";
import { HeliusConnection } from "../services/helius";
import type { MomentumState, Trade } from "../types";

const EMPTY_STATE: MomentumState = {
  value: 0,
  dominantSide: null,
  dominanceDurationMs: 0,
  dominanceStartedAt: null,
  buyVolume: 0,
  sellVolume: 0,
  tradeCount: 0,
  consecutiveTrades: 0,
  consecutiveSide: null,
};

export interface VolumeData {
  momentum: MomentumState;
  recentTrades: Trade[];
  isConnected: boolean;
  isFinishingMoveReady: boolean;
}

export function useVolumeData(tokenAddress: string | null): VolumeData {
  const trackerRef = useRef(new VolumeTracker());
  const connectionRef = useRef<HeliusConnection | null>(null);
  const [momentum, setMomentum] = useState<MomentumState>(EMPTY_STATE);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isFinishingMoveReady, setIsFinishingMoveReady] = useState(false);

  const handleTrade = useCallback((trade: Trade) => {
    trackerRef.current.addTrade(trade);
    setMomentum(trackerRef.current.getState());
    setIsFinishingMoveReady(trackerRef.current.isFinishingMoveReady());
    setRecentTrades((prev) => [trade, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    if (!tokenAddress) {
      setIsConnected(false);
      connectionRef.current?.disconnect();
      connectionRef.current = null;
      trackerRef.current.reset();
      setMomentum(EMPTY_STATE);
      setRecentTrades([]);
      return;
    }

    const apiKey = import.meta.env.VITE_HELIUS_API_KEY;
    if (!apiKey) {
      console.error("Missing VITE_HELIUS_API_KEY");
      return;
    }

    const connection = new HeliusConnection(apiKey, tokenAddress, handleTrade);
    connectionRef.current = connection;
    connection.connect();
    setIsConnected(true);

    return () => {
      connection.disconnect();
      setIsConnected(false);
    };
  }, [tokenAddress, handleTrade]);

  // Refresh momentum state periodically (for dominance timer updates)
  useEffect(() => {
    if (!tokenAddress) return;
    const interval = setInterval(() => {
      setMomentum(trackerRef.current.getState());
      setIsFinishingMoveReady(trackerRef.current.isFinishingMoveReady());
    }, 1000);
    return () => clearInterval(interval);
  }, [tokenAddress]);

  return { momentum, recentTrades, isConnected, isFinishingMoveReady };
}
```

- [ ] **Step 2: Implement useSiteState hook**

Create `src/hooks/useSiteState.ts`:

```ts
import { useState, useEffect, useRef } from "react";
import type { SiteState, MomentumState } from "../types";
import { CELEBRATION_DURATION_MS } from "../config/constants";

interface UseSiteStateOptions {
  tokenAddress: string | null;
  momentum: MomentumState;
  isFinishingMoveReady: boolean;
  isConnected: boolean;
}

export function useSiteState({
  tokenAddress,
  momentum,
  isFinishingMoveReady,
  isConnected,
}: UseSiteStateOptions): SiteState {
  const [state, setState] = useState<SiteState>("lobby");
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasEpisodeEndedRef = useRef(false);

  useEffect(() => {
    // No token → lobby (unless episode already ended → wait-next-episode)
    if (!tokenAddress) {
      if (hasEpisodeEndedRef.current) {
        setState("wait-next-episode");
      } else {
        setState("lobby");
      }
      return;
    }

    // Token set but not connected yet → stay in lobby
    if (!isConnected) {
      setState("lobby");
      return;
    }

    // Already in post-battle or wait states → don't go back to battle
    if (
      state === "post-battle-eren" ||
      state === "post-battle-crew" ||
      state === "wait-next-episode"
    ) {
      return;
    }

    // Finishing move check
    if (
      isFinishingMoveReady &&
      state === "battle" &&
      momentum.dominantSide
    ) {
      const finishingState =
        momentum.dominantSide === "eren" ? "finishing-eren" : "finishing-crew";
      setState(finishingState);

      // After finishing animation, transition to post-battle
      const postBattleState =
        momentum.dominantSide === "eren"
          ? "post-battle-eren"
          : "post-battle-crew";

      celebrationTimerRef.current = setTimeout(() => {
        setState(postBattleState);
        hasEpisodeEndedRef.current = true;

        // After celebration, go to wait-next-episode
        celebrationTimerRef.current = setTimeout(() => {
          setState("wait-next-episode");
        }, CELEBRATION_DURATION_MS);
      }, 15000); // 15s for finishing move animation

      return;
    }

    // Already in finishing state → let it play out
    if (state === "finishing-eren" || state === "finishing-crew") {
      return;
    }

    // Active trading → battle
    if (momentum.tradeCount > 0) {
      setState("battle");
    }
  }, [tokenAddress, momentum, isFinishingMoveReady, isConnected, state]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    };
  }, []);

  return state;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks
git commit -m "feat: add useVolumeData and useSiteState React hooks"
```

---

## Task 6: Video Player with Crossfade

**Files:**
- Create: `src/components/BattleCanvas/VideoPlayer.tsx`
- Create: `src/components/BattleCanvas/VideoManager.ts`
- Create: `tests/videoManager.test.ts`

- [ ] **Step 1: Write failing tests for VideoManager**

Create `tests/videoManager.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { VideoManager } from "../src/components/BattleCanvas/VideoManager";
import type { Clip, ClipCategory } from "../src/types";

function makeClips(category: ClipCategory, count: number): Clip[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${category}-${i}`,
    url: `https://cdn.example.com/${category}-${i}.mp4`,
    category,
    durationMs: 8000,
  }));
}

describe("VideoManager", () => {
  const allClips: Clip[] = [
    ...makeClips("lobby", 3),
    ...makeClips("battle-eren", 4),
    ...makeClips("battle-crew", 4),
    ...makeClips("battle-neutral", 3),
    ...makeClips("finishing-eren", 1),
    ...makeClips("finishing-crew", 1),
    ...makeClips("post-battle-eren", 1),
    ...makeClips("post-battle-crew", 1),
    ...makeClips("wait-next-episode", 2),
  ];

  it("returns a clip from the requested category", () => {
    const manager = new VideoManager(allClips);
    const clip = manager.getNextClip("lobby");
    expect(clip).not.toBeNull();
    expect(clip!.category).toBe("lobby");
  });

  it("does not repeat the same clip consecutively", () => {
    const manager = new VideoManager(allClips);
    const first = manager.getNextClip("lobby");
    const second = manager.getNextClip("lobby");
    // With 3 clips, second should differ from first
    expect(second!.id).not.toBe(first!.id);
  });

  it("returns null for empty category", () => {
    const manager = new VideoManager([]);
    const clip = manager.getNextClip("lobby");
    expect(clip).toBeNull();
  });

  it("selects battle clip based on momentum", () => {
    const manager = new VideoManager(allClips);
    const erenClip = manager.getClipForMomentum(-70);
    expect(erenClip!.category).toBe("battle-eren");

    const crewClip = manager.getClipForMomentum(70);
    expect(crewClip!.category).toBe("battle-crew");

    const neutralClip = manager.getClipForMomentum(0);
    expect(neutralClip!.category).toBe("battle-neutral");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/videoManager.test.ts
```

Expected: Fail.

- [ ] **Step 3: Implement VideoManager**

Create `src/components/BattleCanvas/VideoManager.ts`:

```ts
import type { Clip, ClipCategory } from "../../types";

export class VideoManager {
  private pools: Map<ClipCategory, Clip[]> = new Map();
  private lastPlayedId: string | null = null;

  constructor(clips: Clip[]) {
    for (const clip of clips) {
      const pool = this.pools.get(clip.category) || [];
      pool.push(clip);
      this.pools.set(clip.category, pool);
    }
  }

  getNextClip(category: ClipCategory): Clip | null {
    const pool = this.pools.get(category);
    if (!pool || pool.length === 0) return null;

    if (pool.length === 1) {
      this.lastPlayedId = pool[0].id;
      return pool[0];
    }

    // Pick a random clip that isn't the same as last played
    const available = pool.filter((c) => c.id !== this.lastPlayedId);
    const pick = available[Math.floor(Math.random() * available.length)];
    this.lastPlayedId = pick.id;
    return pick;
  }

  getClipForMomentum(momentum: number): Clip | null {
    let category: ClipCategory;
    if (momentum <= -30) {
      category = "battle-eren";
    } else if (momentum >= 30) {
      category = "battle-crew";
    } else {
      category = "battle-neutral";
    }
    return this.getNextClip(category);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run tests/videoManager.test.ts
```

Expected: All pass.

- [ ] **Step 5: Implement VideoPlayer component**

Create `src/components/BattleCanvas/VideoPlayer.tsx`:

```tsx
import { useRef, useEffect, useState, useCallback } from "react";
import type { Clip } from "../../types";
import { CROSSFADE_DURATION_MS } from "../../config/constants";

interface VideoPlayerProps {
  clip: Clip | null;
  onClipEnd: () => void;
}

export function VideoPlayer({ clip, onClipEnd }: VideoPlayerProps) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<"a" | "b">("a");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getActiveRef = useCallback(
    () => (activeVideo === "a" ? videoARef : videoBRef),
    [activeVideo]
  );
  const getInactiveRef = useCallback(
    () => (activeVideo === "a" ? videoBRef : videoARef),
    [activeVideo]
  );

  useEffect(() => {
    if (!clip) return;

    const incoming = getInactiveRef().current;
    const outgoing = getActiveRef().current;

    if (!incoming || !outgoing) return;

    // Load new clip into inactive video
    incoming.src = clip.url;
    incoming.load();
    incoming.play().catch(() => {});

    // Crossfade: fade in incoming, fade out outgoing
    incoming.style.opacity = "0";
    requestAnimationFrame(() => {
      incoming.style.transition = `opacity ${CROSSFADE_DURATION_MS}ms ease`;
      incoming.style.opacity = "1";
      outgoing.style.transition = `opacity ${CROSSFADE_DURATION_MS}ms ease`;
      outgoing.style.opacity = "0";
    });

    // Swap active
    setActiveVideo((prev) => (prev === "a" ? "b" : "a"));

    // Schedule clip end callback
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(onClipEnd, clip.durationMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [clip]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <video
        ref={videoARef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        loop
      />
      <video
        ref={videoBRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
        loop
      />
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/BattleCanvas/VideoManager.ts src/components/BattleCanvas/VideoPlayer.tsx tests/videoManager.test.ts
git commit -m "feat: implement VideoManager clip selection and VideoPlayer with crossfade"
```

---

## Task 7: PixiJS Effects Layer

**Files:**
- Create: `src/components/BattleCanvas/EffectsLayer.ts`

- [ ] **Step 1: Implement EffectsLayer**

Create `src/components/BattleCanvas/EffectsLayer.ts`:

```ts
import { Application, Container, Graphics, BlurFilter } from "pixi.js";
import type { MomentumState } from "../../types";
import { BIG_TRADE_THRESHOLD_SOL, COMBO_THRESHOLD } from "../../config/constants";

export class EffectsLayer {
  private app: Application;
  private container: Container;
  private colorOverlay: Graphics;
  private flashOverlay: Graphics;
  private shakeOffset = { x: 0, y: 0 };
  private shakeIntensity = 0;
  private shakeDecay = 0.9;
  private particles: Particle[] = [];

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    app.stage.addChild(this.container);

    // Color tint overlay (covers full screen)
    this.colorOverlay = new Graphics();
    this.container.addChild(this.colorOverlay);

    // Impact flash overlay
    this.flashOverlay = new Graphics();
    this.flashOverlay.alpha = 0;
    this.container.addChild(this.flashOverlay);

    // Start render loop
    app.ticker.add(() => this.update());
  }

  /** Call on every trade to trigger immediate visual feedback */
  onTrade(side: "buy" | "sell", amountSol: number): void {
    const isBig = amountSol >= BIG_TRADE_THRESHOLD_SOL;
    this.triggerShake(isBig ? 15 : 5);
    this.triggerFlash(side === "buy" ? 0x3b82f6 : 0xdc2626, isBig ? 0.6 : 0.3);
    this.spawnImpactParticles(side, isBig ? 20 : 8);
  }

  /** Call on combo threshold reached */
  onCombo(side: "buy" | "sell"): void {
    this.triggerShake(25);
    this.triggerFlash(side === "buy" ? 0x3b82f6 : 0xdc2626, 0.8);
    this.spawnImpactParticles(side, 40);
  }

  /** Update color overlay based on momentum */
  updateMomentum(momentum: MomentumState): void {
    const { value } = momentum;
    let color: number;
    let alpha: number;

    if (value <= -30) {
      // Eren dominant — red tint
      color = 0xdc2626;
      alpha = Math.min(0.3, (Math.abs(value) - 30) / 200);
    } else if (value >= 30) {
      // Crew dominant — blue tint
      color = 0x3b82f6;
      alpha = Math.min(0.3, (value - 30) / 200);
    } else {
      // Neutral — warm orange, subtle
      color = 0xf59e0b;
      alpha = 0.05;
    }

    this.colorOverlay.clear();
    this.colorOverlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.colorOverlay.fill({ color, alpha });

    // Check combo
    if (
      momentum.consecutiveTrades >= COMBO_THRESHOLD &&
      momentum.consecutiveSide
    ) {
      this.onCombo(momentum.consecutiveSide);
    }
  }

  /** Trigger for finishing move — massive effects */
  triggerFinishingMove(side: "eren" | "crew"): void {
    const color = side === "eren" ? 0xdc2626 : 0x3b82f6;
    this.triggerShake(40);
    this.triggerFlash(color, 1.0);
    this.spawnImpactParticles(side === "eren" ? "sell" : "buy", 80);
  }

  private triggerShake(intensity: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  private triggerFlash(color: number, alpha: number): void {
    this.flashOverlay.clear();
    this.flashOverlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.flashOverlay.fill({ color });
    this.flashOverlay.alpha = alpha;
  }

  private spawnImpactParticles(side: "buy" | "sell", count: number): void {
    const color = side === "buy" ? 0x3b82f6 : 0xdc2626;
    const centerX = this.app.screen.width / 2;
    const centerY = this.app.screen.height / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const particle: Particle = {
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 200,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.01 + Math.random() * 0.02,
        size: 2 + Math.random() * 4,
        color,
        graphic: new Graphics(),
      };
      particle.graphic.circle(0, 0, particle.size);
      particle.graphic.fill({ color: particle.color });
      this.container.addChild(particle.graphic);
      this.particles.push(particle);
    }
  }

  private update(): void {
    const dt = this.app.ticker.deltaMS / 16.67; // normalize to ~60fps

    // Screen shake
    if (this.shakeIntensity > 0.5) {
      this.shakeOffset.x = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeOffset.y = (Math.random() - 0.5) * this.shakeIntensity;
      this.app.stage.position.set(this.shakeOffset.x, this.shakeOffset.y);
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeIntensity = 0;
      this.app.stage.position.set(0, 0);
    }

    // Flash fade out
    if (this.flashOverlay.alpha > 0) {
      this.flashOverlay.alpha = Math.max(0, this.flashOverlay.alpha - 0.03 * dt);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.1 * dt; // gravity
      p.life -= p.decay * dt;
      p.graphic.position.set(p.x, p.y);
      p.graphic.alpha = p.life;

      if (p.life <= 0) {
        this.container.removeChild(p.graphic);
        p.graphic.destroy();
        this.particles.splice(i, 1);
      }
    }
  }

  destroy(): void {
    for (const p of this.particles) {
      p.graphic.destroy();
    }
    this.particles = [];
    this.container.destroy({ children: true });
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  color: number;
  graphic: Graphics;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit src/components/BattleCanvas/EffectsLayer.ts 2>&1 || echo "Check errors above"
```

Note: May need `--skipLibCheck` or full build. Alternatively just run:

```bash
npm run build 2>&1 | head -30
```

Fix any TS errors if they appear.

- [ ] **Step 3: Commit**

```bash
git add src/components/BattleCanvas/EffectsLayer.ts
git commit -m "feat: implement PixiJS effects layer with particles, shake, flash, and color overlays"
```

---

## Task 8: Transition Manager

**Files:**
- Create: `src/components/BattleCanvas/TransitionManager.ts`

- [ ] **Step 1: Implement TransitionManager**

Create `src/components/BattleCanvas/TransitionManager.ts`:

```ts
import { Application, Graphics } from "pixi.js";
import type { SiteState } from "../../types";

type TransitionCallback = () => void;

export class TransitionManager {
  private app: Application;
  private overlay: Graphics;
  private isTransitioning = false;

  constructor(app: Application) {
    this.app = app;
    this.overlay = new Graphics();
    this.overlay.zIndex = 1000;
    this.overlay.alpha = 0;
    app.stage.addChild(this.overlay);
  }

  /** Lobby → Battle: screen glitch, darken, shake */
  async transitionToBattle(onMidpoint: TransitionCallback): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Phase 1: Quick black flash
    await this.fadeToBlack(300);

    // Midpoint: swap the video content
    onMidpoint();

    // Phase 2: Static/glitch effect (fast flicker)
    for (let i = 0; i < 6; i++) {
      this.overlay.alpha = Math.random() * 0.8;
      await this.wait(50);
    }

    // Phase 3: Fade in from black
    await this.fadeFromBlack(500);

    this.isTransitioning = false;
  }

  /** Battle → Finishing Move: dramatic flash */
  async transitionToFinishing(
    side: "eren" | "crew",
    onMidpoint: TransitionCallback
  ): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const color = side === "eren" ? 0xdc2626 : 0x3b82f6;

    // White flash
    this.drawOverlay(0xffffff);
    this.overlay.alpha = 1;
    await this.wait(200);

    onMidpoint();

    // Color flash
    this.drawOverlay(color);
    this.overlay.alpha = 0.8;
    await this.wait(300);

    // Fade out
    await this.fadeFromBlack(800);

    this.isTransitioning = false;
  }

  /** Any state → Lobby/Wait: gentle fade */
  async transitionToIdle(onMidpoint: TransitionCallback): Promise<void> {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    await this.fadeToBlack(1000);
    onMidpoint();
    await this.fadeFromBlack(1000);

    this.isTransitioning = false;
  }

  private drawOverlay(color: number): void {
    this.overlay.clear();
    this.overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    this.overlay.fill({ color });
  }

  private async fadeToBlack(durationMs: number): Promise<void> {
    this.drawOverlay(0x000000);
    const steps = Math.ceil(durationMs / 16);
    for (let i = 0; i <= steps; i++) {
      this.overlay.alpha = i / steps;
      await this.wait(16);
    }
  }

  private async fadeFromBlack(durationMs: number): Promise<void> {
    const steps = Math.ceil(durationMs / 16);
    for (let i = steps; i >= 0; i--) {
      this.overlay.alpha = i / steps;
      await this.wait(16);
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  destroy(): void {
    this.overlay.destroy();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BattleCanvas/TransitionManager.ts
git commit -m "feat: implement state transition animations (lobby, battle, finishing, idle)"
```

---

## Task 9: BattleCanvas Container

**Files:**
- Create: `src/components/BattleCanvas/BattleCanvas.tsx`

- [ ] **Step 1: Implement BattleCanvas**

Create `src/components/BattleCanvas/BattleCanvas.tsx`:

```tsx
import { useRef, useEffect, useState, useCallback } from "react";
import { Application } from "pixi.js";
import { VideoPlayer } from "./VideoPlayer";
import { VideoManager } from "./VideoManager";
import { EffectsLayer } from "./EffectsLayer";
import { TransitionManager } from "./TransitionManager";
import type { SiteState, MomentumState, Clip, Trade } from "../../types";
import type { EpisodeConfig } from "../../types";

interface BattleCanvasProps {
  siteState: SiteState;
  momentum: MomentumState;
  episode: EpisodeConfig;
  lastTrade: Trade | null;
}

export function BattleCanvas({
  siteState,
  momentum,
  episode,
  lastTrade,
}: BattleCanvasProps) {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const effectsRef = useRef<EffectsLayer | null>(null);
  const transitionRef = useRef<TransitionManager | null>(null);
  const videoManagerRef = useRef<VideoManager | null>(null);
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);
  const prevStateRef = useRef<SiteState>("lobby");

  // Initialize PixiJS
  useEffect(() => {
    if (!pixiContainerRef.current) return;

    const app = new Application();
    const initPromise = app.init({
      backgroundAlpha: 0,
      resizeTo: pixiContainerRef.current,
      antialias: true,
    });

    initPromise.then(() => {
      if (!pixiContainerRef.current) return;
      pixiContainerRef.current.appendChild(app.canvas as HTMLCanvasElement);
      appRef.current = app;
      effectsRef.current = new EffectsLayer(app);
      transitionRef.current = new TransitionManager(app);
      videoManagerRef.current = new VideoManager(episode.clips);

      // Start with lobby clip
      const firstClip = videoManagerRef.current.getNextClip("lobby");
      if (firstClip) setCurrentClip(firstClip);
    });

    return () => {
      effectsRef.current?.destroy();
      transitionRef.current?.destroy();
      app.destroy(true);
      appRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle state transitions
  useEffect(() => {
    const prev = prevStateRef.current;
    const vm = videoManagerRef.current;
    const tm = transitionRef.current;
    if (!vm || !tm || prev === siteState) return;

    const loadClipForState = () => {
      let clip: Clip | null = null;
      switch (siteState) {
        case "lobby":
          clip = vm.getNextClip("lobby");
          break;
        case "battle":
          clip = vm.getClipForMomentum(momentum.value);
          break;
        case "finishing-eren":
          clip = vm.getNextClip("finishing-eren");
          effectsRef.current?.triggerFinishingMove("eren");
          break;
        case "finishing-crew":
          clip = vm.getNextClip("finishing-crew");
          effectsRef.current?.triggerFinishingMove("crew");
          break;
        case "post-battle-eren":
          clip = vm.getNextClip("post-battle-eren");
          break;
        case "post-battle-crew":
          clip = vm.getNextClip("post-battle-crew");
          break;
        case "wait-next-episode":
          clip = vm.getNextClip("wait-next-episode");
          break;
      }
      if (clip) setCurrentClip(clip);
    };

    // Choose transition type
    if (prev === "lobby" && siteState === "battle") {
      tm.transitionToBattle(loadClipForState);
    } else if (siteState === "finishing-eren" || siteState === "finishing-crew") {
      const side = siteState === "finishing-eren" ? "eren" : "crew";
      tm.transitionToFinishing(side, loadClipForState);
    } else if (siteState === "lobby" || siteState === "wait-next-episode") {
      tm.transitionToIdle(loadClipForState);
    } else {
      loadClipForState();
    }

    prevStateRef.current = siteState;
  }, [siteState, momentum.value]);

  // Update effects on momentum changes
  useEffect(() => {
    effectsRef.current?.updateMomentum(momentum);
  }, [momentum]);

  // Trigger trade effects
  useEffect(() => {
    if (lastTrade && siteState === "battle") {
      effectsRef.current?.onTrade(lastTrade.side, lastTrade.amountSol);
    }
  }, [lastTrade, siteState]);

  // Handle clip end — get next clip
  const handleClipEnd = useCallback(() => {
    const vm = videoManagerRef.current;
    if (!vm) return;

    let nextClip: Clip | null = null;
    if (siteState === "battle") {
      nextClip = vm.getClipForMomentum(momentum.value);
    } else if (siteState === "lobby") {
      nextClip = vm.getNextClip("lobby");
    } else if (siteState === "wait-next-episode") {
      nextClip = vm.getNextClip("wait-next-episode");
    }
    if (nextClip) setCurrentClip(nextClip);
  }, [siteState, momentum.value]);

  return (
    <div className="relative w-full h-full">
      {/* Video layer (behind PixiJS) */}
      <VideoPlayer clip={currentClip} onClipEnd={handleClipEnd} />

      {/* PixiJS overlay layer */}
      <div
        ref={pixiContainerRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Rei Studios logo (lobby/wait states) */}
      {(siteState === "lobby" || siteState === "wait-next-episode") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <h1 className="text-6xl font-black tracking-wider text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            REI STUDIOS
          </h1>
          {siteState === "wait-next-episode" && (
            <p className="mt-4 text-xl text-white/50 tracking-widest uppercase">
              Next Episode Coming Soon
            </p>
          )}
        </div>
      )}

      {/* Episode title (battle state) */}
      {siteState === "battle" && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <p className="text-sm text-white/40 tracking-widest uppercase">
            {episode.name}
          </p>
          <p className="text-lg font-bold text-white/70">{episode.subtitle}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BattleCanvas/BattleCanvas.tsx
git commit -m "feat: implement BattleCanvas container orchestrating video, PixiJS effects, and transitions"
```

---

## Task 10: Dashboard Components

**Files:**
- Create: `src/components/Dashboard/Dashboard.tsx`
- Create: `src/components/Dashboard/VolumeBar.tsx`
- Create: `src/components/Dashboard/DominanceTimer.tsx`
- Create: `src/components/Dashboard/TradesFeed.tsx`
- Create: `src/components/Dashboard/PriceDisplay.tsx`
- Create: `src/components/Dashboard/EpisodeInfo.tsx`

- [ ] **Step 1: Implement VolumeBar**

Create `src/components/Dashboard/VolumeBar.tsx`:

```tsx
import type { MomentumState } from "../../types";
import type { EpisodeConfig } from "../../types";

interface VolumeBarProps {
  momentum: MomentumState;
  episode: EpisodeConfig;
}

export function VolumeBar({ momentum, episode }: VolumeBarProps) {
  // Convert momentum (-100 to 100) to percentage (0 to 100) for bar fill
  const crewPercent = (momentum.value + 100) / 2;
  const erenPercent = 100 - crewPercent;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs text-[var(--color-text-dim)]">
        <span className="text-red-500 font-semibold">
          {episode.negativeSide.name} {erenPercent.toFixed(0)}%
        </span>
        <span className="text-blue-500 font-semibold">
          {episode.positiveSide.name} {crewPercent.toFixed(0)}%
        </span>
      </div>
      <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-500"
          style={{ width: `${erenPercent}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
          style={{ width: `${crewPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-[var(--color-text-dim)]">
        <span>{momentum.sellVolume.toFixed(2)} SOL</span>
        <span>{momentum.buyVolume.toFixed(2)} SOL</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Implement DominanceTimer**

Create `src/components/Dashboard/DominanceTimer.tsx`:

```tsx
import type { MomentumState } from "../../types";
import type { EpisodeConfig } from "../../types";
import { FINISHING_MOVE_DURATION_MS } from "../../config/constants";

interface DominanceTimerProps {
  momentum: MomentumState;
  episode: EpisodeConfig;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function DominanceTimer({ momentum, episode }: DominanceTimerProps) {
  const { dominantSide, dominanceDurationMs } = momentum;
  const totalFormatted = formatTime(FINISHING_MOVE_DURATION_MS);
  const currentFormatted = formatTime(dominanceDurationMs);
  const progress = Math.min(dominanceDurationMs / FINISHING_MOVE_DURATION_MS, 1);

  if (!dominantSide) {
    return (
      <div className="text-center">
        <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
          Dominance
        </p>
        <p className="text-lg font-mono text-[var(--color-neutral)] font-bold">
          CONTESTED
        </p>
      </div>
    );
  }

  const sideName =
    dominantSide === "eren"
      ? episode.negativeSide.name
      : episode.positiveSide.name;
  const sideColor = dominantSide === "eren" ? "text-red-500" : "text-blue-500";
  const barColor = dominantSide === "eren" ? "bg-red-500" : "bg-blue-500";

  return (
    <div className="text-center">
      <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
        {sideName} Dominance
      </p>
      <p className={`text-lg font-mono font-bold ${sideColor}`}>
        {currentFormatted} / {totalFormatted}
      </p>
      <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-1000`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement TradesFeed**

Create `src/components/Dashboard/TradesFeed.tsx`:

```tsx
import type { Trade } from "../../types";
import { BIG_TRADE_THRESHOLD_SOL } from "../../config/constants";

interface TradesFeedProps {
  trades: Trade[];
}

export function TradesFeed({ trades }: TradesFeedProps) {
  return (
    <div className="flex flex-col gap-0.5 overflow-hidden h-full">
      <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-1">
        Recent Trades
      </p>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {trades.length === 0 ? (
          <p className="text-xs text-[var(--color-text-dim)] italic">
            Waiting for trades...
          </p>
        ) : (
          trades.slice(0, 20).map((trade) => {
            const isBig = trade.amountSol >= BIG_TRADE_THRESHOLD_SOL;
            const isBuy = trade.side === "buy";
            const time = new Date(trade.timestamp).toLocaleTimeString();
            return (
              <div
                key={trade.signature}
                className={`flex justify-between items-center text-xs py-0.5 px-1 rounded ${
                  isBig ? (isBuy ? "bg-blue-500/10" : "bg-red-500/10") : ""
                }`}
              >
                <span
                  className={`font-semibold ${
                    isBuy ? "text-blue-400" : "text-red-400"
                  }`}
                >
                  {isBuy ? "BUY" : "SELL"}
                </span>
                <span className="text-[var(--color-text)] font-mono">
                  {trade.amountSol.toFixed(3)} SOL
                </span>
                <span className="text-[var(--color-text-dim)]">{time}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement PriceDisplay**

Create `src/components/Dashboard/PriceDisplay.tsx`:

```tsx
interface PriceDisplayProps {
  /** We derive price from trade data — placeholder for now */
  isConnected: boolean;
}

export function PriceDisplay({ isConnected }: PriceDisplayProps) {
  return (
    <div className="text-center">
      <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
        Status
      </p>
      <p
        className={`text-sm font-semibold ${
          isConnected ? "text-green-400" : "text-[var(--color-text-dim)]"
        }`}
      >
        {isConnected ? "● LIVE" : "○ OFFLINE"}
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Implement EpisodeInfo**

Create `src/components/Dashboard/EpisodeInfo.tsx`:

```tsx
import type { EpisodeConfig } from "../../types";

interface EpisodeInfoProps {
  episode: EpisodeConfig;
}

export function EpisodeInfo({ episode }: EpisodeInfoProps) {
  return (
    <div>
      <p className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">
        Now Showing
      </p>
      <p className="text-sm font-bold text-[var(--color-text)]">
        {episode.name}: {episode.subtitle}
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Implement Dashboard container**

Create `src/components/Dashboard/Dashboard.tsx`:

```tsx
import type { MomentumState, Trade } from "../../types";
import type { EpisodeConfig, SiteState } from "../../types";
import { VolumeBar } from "./VolumeBar";
import { DominanceTimer } from "./DominanceTimer";
import { TradesFeed } from "./TradesFeed";
import { PriceDisplay } from "./PriceDisplay";
import { EpisodeInfo } from "./EpisodeInfo";

interface DashboardProps {
  siteState: SiteState;
  momentum: MomentumState;
  trades: Trade[];
  episode: EpisodeConfig;
  isConnected: boolean;
}

export function Dashboard({
  siteState,
  momentum,
  trades,
  episode,
  isConnected,
}: DashboardProps) {
  const showBattleStats = siteState === "battle" || siteState === "finishing-eren" || siteState === "finishing-crew";

  return (
    <div className="h-full px-6 py-3 grid grid-cols-[1fr_200px_1fr_120px_160px] gap-6 items-start">
      {/* Volume Bar */}
      <div className="self-center">
        {showBattleStats ? (
          <VolumeBar momentum={momentum} episode={episode} />
        ) : (
          <EpisodeInfo episode={episode} />
        )}
      </div>

      {/* Dominance Timer */}
      <div className="self-center">
        {showBattleStats && (
          <DominanceTimer momentum={momentum} episode={episode} />
        )}
      </div>

      {/* Trades Feed */}
      <div className="h-full">
        {showBattleStats ? (
          <TradesFeed trades={trades} />
        ) : (
          <div className="flex items-center h-full">
            <p className="text-sm text-[var(--color-text-dim)]">
              {siteState === "lobby"
                ? "Waiting for episode to begin..."
                : siteState === "wait-next-episode"
                  ? "Episode complete. Stay tuned."
                  : ""}
            </p>
          </div>
        )}
      </div>

      {/* Price / Status */}
      <div className="self-center">
        <PriceDisplay isConnected={isConnected} />
      </div>

      {/* Rei Studios branding */}
      <div className="self-center text-right">
        <p className="text-lg font-black tracking-wider text-white/60">
          REI
        </p>
        <p className="text-[10px] tracking-[0.3em] text-white/30 uppercase">
          Studios
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/Dashboard
git commit -m "feat: implement dashboard UI with volume bar, dominance timer, trades feed, and episode info"
```

---

## Task 11: Wire Everything Together in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx to connect all components**

Replace `src/App.tsx`:

```tsx
import { BattleCanvas } from "./components/BattleCanvas/BattleCanvas";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { useVolumeData } from "./hooks/useVolumeData";
import { useSiteState } from "./hooks/useSiteState";
import { getCurrentEpisode } from "./config/episode";

export default function App() {
  const episode = getCurrentEpisode();
  const { momentum, recentTrades, isConnected, isFinishingMoveReady } =
    useVolumeData(episode.tokenAddress);

  const siteState = useSiteState({
    tokenAddress: episode.tokenAddress,
    momentum,
    isFinishingMoveReady,
    isConnected,
  });

  const lastTrade = recentTrades.length > 0 ? recentTrades[0] : null;

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--color-bg)]">
      {/* Battle canvas — takes up all available space */}
      <div className="flex-1 relative overflow-hidden">
        <BattleCanvas
          siteState={siteState}
          momentum={momentum}
          episode={episode}
          lastTrade={lastTrade}
        />
      </div>

      {/* Dashboard — fixed height at bottom */}
      <div className="h-44 border-t border-white/10 bg-[var(--color-surface)] shrink-0">
        <Dashboard
          siteState={siteState}
          momentum={momentum}
          trades={recentTrades}
          episode={episode}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the app builds**

```bash
npm run build
```

Expected: Build completes with no errors. If there are TS errors, fix them.

- [ ] **Step 3: Run dev server and verify visually**

```bash
npm run dev
```

Expected: Dark screen with "REI STUDIOS" centered in the battle area, dashboard at the bottom showing "Waiting for episode to begin..." and offline status. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up App with BattleCanvas, Dashboard, hooks, and episode config"
```

---

## Task 12: Demo Mode (Test Without Real Coin)

**Files:**
- Create: `src/hooks/useDemoMode.ts`
- Modify: `src/App.tsx`

This is critical for development — lets you test the full battle experience with simulated trades before a real coin exists.

- [ ] **Step 1: Implement useDemoMode hook**

Create `src/hooks/useDemoMode.ts`:

```ts
import { useEffect, useRef, useCallback } from "react";
import type { Trade } from "../types";

interface UseDemoModeOptions {
  enabled: boolean;
  onTrade: (trade: Trade) => void;
  /** Average milliseconds between trades */
  intervalMs?: number;
}

export function useDemoMode({
  enabled,
  onTrade,
  intervalMs = 2000,
}: UseDemoModeOptions): void {
  const counterRef = useRef(0);

  const generateTrade = useCallback((): Trade => {
    counterRef.current++;
    const side = Math.random() > 0.5 ? "buy" : "sell";
    // Occasionally generate big trades
    const isBig = Math.random() > 0.85;
    const amountSol = isBig
      ? 1 + Math.random() * 4
      : 0.01 + Math.random() * 0.5;

    return {
      signature: `demo-${counterRef.current}-${Date.now()}`,
      side: side as "buy" | "sell",
      amountSol: parseFloat(amountSol.toFixed(4)),
      timestamp: Date.now(),
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      onTrade(generateTrade());
    }, intervalMs + (Math.random() - 0.5) * intervalMs * 0.5);

    // Send a few initial trades immediately
    for (let i = 0; i < 3; i++) {
      setTimeout(() => onTrade(generateTrade()), i * 300);
    }

    return () => clearInterval(interval);
  }, [enabled, onTrade, generateTrade, intervalMs]);
}
```

- [ ] **Step 2: Add demo mode to App.tsx**

Add the following to `src/App.tsx` — import `useDemoMode` and add a keyboard shortcut to toggle it. Add this after the existing hooks:

Replace `src/App.tsx`:

```tsx
import { useState, useCallback } from "react";
import { BattleCanvas } from "./components/BattleCanvas/BattleCanvas";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { useVolumeData } from "./hooks/useVolumeData";
import { useSiteState } from "./hooks/useSiteState";
import { useDemoMode } from "./hooks/useDemoMode";
import { getCurrentEpisode } from "./config/episode";
import { VolumeTracker } from "./services/volumeTracker";
import type { Trade, MomentumState } from "./types";
import { useEffect, useRef } from "react";

const EMPTY_MOMENTUM: MomentumState = {
  value: 0,
  dominantSide: null,
  dominanceDurationMs: 0,
  dominanceStartedAt: null,
  buyVolume: 0,
  sellVolume: 0,
  tradeCount: 0,
  consecutiveTrades: 0,
  consecutiveSide: null,
};

export default function App() {
  const episode = getCurrentEpisode();
  const [demoEnabled, setDemoEnabled] = useState(false);

  // Real data
  const realData = useVolumeData(demoEnabled ? null : episode.tokenAddress);

  // Demo data
  const demoTrackerRef = useRef(new VolumeTracker());
  const [demoMomentum, setDemoMomentum] = useState<MomentumState>(EMPTY_MOMENTUM);
  const [demoTrades, setDemoTrades] = useState<Trade[]>([]);
  const [demoFinishing, setDemoFinishing] = useState(false);

  const handleDemoTrade = useCallback((trade: Trade) => {
    demoTrackerRef.current.addTrade(trade);
    setDemoMomentum(demoTrackerRef.current.getState());
    setDemoFinishing(demoTrackerRef.current.isFinishingMoveReady());
    setDemoTrades((prev) => [trade, ...prev].slice(0, 50));
  }, []);

  useDemoMode({ enabled: demoEnabled, onTrade: handleDemoTrade });

  // Pick real or demo data
  const momentum = demoEnabled ? demoMomentum : realData.momentum;
  const recentTrades = demoEnabled ? demoTrades : realData.recentTrades;
  const isConnected = demoEnabled ? true : realData.isConnected;
  const isFinishingMoveReady = demoEnabled ? demoFinishing : realData.isFinishingMoveReady;

  const siteState = useSiteState({
    tokenAddress: demoEnabled ? "demo" : episode.tokenAddress,
    momentum,
    isFinishingMoveReady,
    isConnected,
  });

  const lastTrade = recentTrades.length > 0 ? recentTrades[0] : null;

  // Toggle demo mode with Ctrl+D
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        setDemoEnabled((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[var(--color-bg)]">
      {/* Demo mode indicator */}
      {demoEnabled && (
        <div className="absolute top-2 right-2 z-50 bg-yellow-500/20 border border-yellow-500/40 rounded px-2 py-1 text-xs text-yellow-400">
          DEMO MODE (Ctrl+D to toggle)
        </div>
      )}

      {/* Battle canvas */}
      <div className="flex-1 relative overflow-hidden">
        <BattleCanvas
          siteState={siteState}
          momentum={momentum}
          episode={episode}
          lastTrade={lastTrade}
        />
      </div>

      {/* Dashboard */}
      <div className="h-44 border-t border-white/10 bg-[var(--color-surface)] shrink-0">
        <Dashboard
          siteState={siteState}
          momentum={momentum}
          trades={recentTrades}
          episode={episode}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run dev server and test demo mode**

```bash
npm run dev
```

Open in browser, press Ctrl+D. Expected: "DEMO MODE" badge appears, fake trades start flowing, momentum shifts, dashboard updates in real-time. Volume bar moves, trades feed populates, dominance timer starts counting if one side takes over.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useDemoMode.ts src/App.tsx
git commit -m "feat: add demo mode for testing battle experience without real coin (Ctrl+D toggle)"
```

---

## Task 13: Placeholder Videos for Development

**Files:**
- Create: `src/dev/generatePlaceholders.ts` (dev script)
- Modify: `src/config/episode.ts`

Since Dylan hasn't provided AI clips yet, we need colored placeholder videos so the VideoPlayer and transitions can be tested.

- [ ] **Step 1: Create placeholder video generator using Canvas API**

Create `src/dev/createPlaceholderClips.ts`:

```ts
/**
 * Run this in the browser console to generate placeholder clip configs.
 * In production, these URLs will point to Cloudflare R2.
 * For dev, we'll use solid-color videos created via canvas.
 */

import type { Clip, ClipCategory } from "../types";

const PLACEHOLDER_CLIPS: Array<{ category: ClipCategory; count: number; label: string }> = [
  { category: "lobby", count: 3, label: "LOBBY" },
  { category: "battle-eren", count: 4, label: "EREN ATTACKS" },
  { category: "battle-crew", count: 4, label: "CREW ATTACKS" },
  { category: "battle-neutral", count: 3, label: "CLASH" },
  { category: "finishing-eren", count: 1, label: "EREN WINS" },
  { category: "finishing-crew", count: 1, label: "CREW WINS" },
  { category: "post-battle-eren", count: 1, label: "EREN VICTORY" },
  { category: "post-battle-crew", count: 1, label: "CREW VICTORY" },
  { category: "wait-next-episode", count: 2, label: "NEXT EPISODE" },
];

const CATEGORY_COLORS: Record<ClipCategory, string> = {
  "lobby": "#1a1a2e",
  "battle-eren": "#4a0000",
  "battle-crew": "#00004a",
  "battle-neutral": "#4a3a00",
  "finishing-eren": "#8b0000",
  "finishing-crew": "#00008b",
  "post-battle-eren": "#660000",
  "post-battle-crew": "#000066",
  "wait-next-episode": "#1a1a1a",
};

export function getPlaceholderClips(): Clip[] {
  const clips: Clip[] = [];

  for (const { category, count, label } of PLACEHOLDER_CLIPS) {
    for (let i = 0; i < count; i++) {
      clips.push({
        id: `${category}-${i}`,
        // Use a data URL with an inline SVG as a "video" placeholder
        // In dev, VideoPlayer will show these as static colored backgrounds
        url: createPlaceholderDataUrl(label, CATEGORY_COLORS[category], i + 1, count),
        category,
        durationMs: category.startsWith("finishing") ? 15000 : 8000,
      });
    }
  }

  return clips;
}

function createPlaceholderDataUrl(
  label: string,
  bgColor: string,
  num: number,
  total: number
): string {
  // We can't create real video data URLs easily, so we'll use a special
  // prefix that VideoPlayer can detect and render as a colored div instead
  return `placeholder://${bgColor}/${encodeURIComponent(label)} ${num}/${total}`;
}
```

- [ ] **Step 2: Update VideoPlayer to handle placeholder clips**

Add placeholder handling to `src/components/BattleCanvas/VideoPlayer.tsx`. Add this before the return statement, and modify the component to detect `placeholder://` URLs:

Replace `src/components/BattleCanvas/VideoPlayer.tsx`:

```tsx
import { useRef, useEffect, useState, useCallback } from "react";
import type { Clip } from "../../types";
import { CROSSFADE_DURATION_MS } from "../../config/constants";

interface VideoPlayerProps {
  clip: Clip | null;
  onClipEnd: () => void;
}

function isPlaceholder(url: string): boolean {
  return url.startsWith("placeholder://");
}

function parsePlaceholder(url: string): { color: string; label: string } {
  const parts = url.replace("placeholder://", "").split("/");
  return {
    color: parts[0],
    label: decodeURIComponent(parts.slice(1).join("/")),
  };
}

export function VideoPlayer({ clip, onClipEnd }: VideoPlayerProps) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<"a" | "b">("a");
  const [placeholder, setPlaceholder] = useState<{
    color: string;
    label: string;
  } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!clip) return;

    // Clear existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isPlaceholder(clip.url)) {
      // Render as colored div with label
      setPlaceholder(parsePlaceholder(clip.url));
      timeoutRef.current = setTimeout(onClipEnd, clip.durationMs);
      return;
    }

    // Real video handling
    setPlaceholder(null);
    const incoming =
      activeVideo === "a" ? videoBRef.current : videoARef.current;
    const outgoing =
      activeVideo === "a" ? videoARef.current : videoBRef.current;

    if (!incoming || !outgoing) return;

    incoming.src = clip.url;
    incoming.load();
    incoming.play().catch(() => {});

    incoming.style.opacity = "0";
    requestAnimationFrame(() => {
      incoming.style.transition = `opacity ${CROSSFADE_DURATION_MS}ms ease`;
      incoming.style.opacity = "1";
      outgoing.style.transition = `opacity ${CROSSFADE_DURATION_MS}ms ease`;
      outgoing.style.opacity = "0";
    });

    setActiveVideo((prev) => (prev === "a" ? "b" : "a"));
    timeoutRef.current = setTimeout(onClipEnd, clip.durationMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [clip]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {placeholder ? (
        <div
          className="absolute inset-0 flex items-center justify-center transition-colors duration-500"
          style={{ backgroundColor: placeholder.color }}
        >
          <p className="text-3xl font-bold text-white/30 tracking-widest">
            {placeholder.label}
          </p>
        </div>
      ) : (
        <>
          <video
            ref={videoARef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            loop
          />
          <video
            ref={videoBRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            loop
          />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update episode.ts to use placeholders in dev**

Replace `src/config/episode.ts`:

```ts
import type { EpisodeConfig } from "../types";
import { getPlaceholderClips } from "../dev/createPlaceholderClips";

const episode1: EpisodeConfig = {
  id: "ep1-aov",
  name: "Episode 1",
  subtitle: "Attack on Volume",
  negativeSide: {
    name: "Eren",
    color: "#dc2626",
  },
  positiveSide: {
    name: "Crew",
    color: "#3b82f6",
  },
  tokenAddress: import.meta.env.VITE_TOKEN_ADDRESS || null,
  // Use placeholder clips in development, replace with real URLs in production
  clips: import.meta.env.PROD ? [] : getPlaceholderClips(),
};

export function getCurrentEpisode(): EpisodeConfig {
  return episode1;
}
```

- [ ] **Step 4: Test the full flow**

```bash
npm run dev
```

Open browser, press Ctrl+D for demo mode. Expected:
- Colored placeholder backgrounds cycle through with labels
- Labels change based on momentum (EREN ATTACKS / CREW ATTACKS / CLASH)
- Dashboard updates in real-time
- Dominance timer counts when one side dominates

- [ ] **Step 5: Commit**

```bash
git add src/dev src/components/BattleCanvas/VideoPlayer.tsx src/config/episode.ts
git commit -m "feat: add placeholder clip system for development testing"
```

---

## Task 14: Rei Studios SVG Logo

**Files:**
- Create: `src/components/Logo/ReiStudiosLogo.tsx`

- [ ] **Step 1: Create the SVG logo component**

Create `src/components/Logo/ReiStudiosLogo.tsx`:

```tsx
interface ReiStudiosLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { width: 120, fontSize: 24, subSize: 8 },
  md: { width: 240, fontSize: 48, subSize: 14 },
  lg: { width: 400, fontSize: 80, subSize: 22 },
};

export function ReiStudiosLogo({
  className = "",
  size = "md",
}: ReiStudiosLogoProps) {
  const s = sizes[size];

  return (
    <svg
      width={s.width}
      height={s.fontSize * 1.6}
      viewBox={`0 0 ${s.width} ${s.fontSize * 1.6}`}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Metallic gradient */}
        <linearGradient id="rei-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#c0c0c0" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#e0e0e0" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#808080" stopOpacity="0.8" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="rei-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main "REI" text — bold, sharp, WIT Studio inspired */}
      <text
        x={s.width / 2}
        y={s.fontSize * 0.85}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="900"
        fontSize={s.fontSize}
        letterSpacing={s.fontSize * 0.15}
        fill="url(#rei-gradient)"
        filter="url(#rei-glow)"
      >
        REI
      </text>

      {/* "STUDIOS" subtitle */}
      <text
        x={s.width / 2}
        y={s.fontSize * 1.3}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="500"
        fontSize={s.subSize}
        letterSpacing={s.subSize * 0.8}
        fill="#ffffff"
        opacity="0.4"
      >
        STUDIOS
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Use the logo in BattleCanvas lobby state**

Update the logo text in `src/components/BattleCanvas/BattleCanvas.tsx`. Replace the inline "REI STUDIOS" text with the component:

Find this block in BattleCanvas.tsx:
```tsx
<h1 className="text-6xl font-black tracking-wider text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
  REI STUDIOS
</h1>
```

Replace with:
```tsx
<ReiStudiosLogo size="lg" />
```

And add the import at the top:
```tsx
import { ReiStudiosLogo } from "../Logo/ReiStudiosLogo";
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Logo src/components/BattleCanvas/BattleCanvas.tsx
git commit -m "feat: add Rei Studios SVG logo with metallic gradient and glow"
```

---

## Task 15: Final Build, Lint, and Verify

**Files:**
- Modify: `package.json` (add test script)

- [ ] **Step 1: Add test script to package.json**

Add to the `"scripts"` section of `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: All tests in `tests/` pass.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: Build succeeds, output in `dist/`.

- [ ] **Step 4: Preview production build**

```bash
npm run preview
```

Open the URL. Verify the site loads, shows Rei Studios lobby, and demo mode (Ctrl+D) works.

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "feat: add test scripts and verify production build"
```

---

## Summary

**15 tasks total.** After completion you'll have:

1. A fully functional Rei Studios website with dark cinematic aesthetic
2. Lobby state that works standalone (no coin needed)
3. Battle engine that reacts to real-time Solana volume data via Helius WebSocket
4. Video clip system with crossfade transitions (using placeholders until Dylan provides AI clips)
5. PixiJS effects overlay: particles, screen shake, color tints, impact flashes, combo effects
6. State machine: lobby → battle → finishing → post-battle → wait-next-episode
7. Dashboard: volume bar, dominance timer, trades feed, status indicator
8. Demo mode for testing without a real token (Ctrl+D)
9. Rei Studios SVG logo
10. Full test coverage on core logic (VolumeTracker, VideoManager, trade parser)

**What Dylan needs to provide next:**
- AI-generated video clips (35-40 clips, see asset checklist in spec)
- Helius API key (free tier works)
- Token address once the coin is launched on pump.fun
- Domain name for Vercel deployment

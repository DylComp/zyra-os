# Rei Studios — Design Spec

## Overview

Rei Studios is a Solana memecoin project disguised as an AI animation studio. The website (reistudios.com or similar) is the studio's homepage — a cinematic platform that streams live anime battles powered by on-chain trading data.

Each coin launch is an "episode." Episode 1 is **AOV (Attack on Volume)** — an Attack on Titan battle where Eren vs The Crew fight in real-time based on buy/sell volume. The website is branded as Rei Studios throughout, with AOV being the name of the first episode's coin.

The website is the core product. It streams AI-generated anime fight clips that respond in real-time to the token's trading activity. Buyers power one side, sellers power the other. After 30 minutes of one-sided dominance, the episode ends with a finishing move.

## Branding

- **Studio Name:** Rei Studios — the public-facing brand. Presented as an AI animation studio entering the memecoin space. All public communications (Twitter, website, branding) come from "Rei Studios."
- **Coin Name:** AOV (Attack on Volume) — Episode 1's token. Each future episode gets a new coin launch.
- **Ticker:** AOV
- **Twitter:** Rei Studios (@reistudios or similar) — project updates, episode announcements, studio lore
- **Public narrative:** Rei Studios is an AI animation studio that builds live anime experiences powered by blockchain data. The wallets on each coin are described as "AI-powered trading agents" that buy/sell based on volume. In reality, Dylan controls the wallets manually.
- **Wallets:**
  - `eren` — vanity Solana wallet (sells/negative volume side)
  - `crew` — vanity Solana wallet (buys/positive volume side, Dylan already has this)
  - `Rei` — vanity Solana wallet (studio/dev wallet)

## Tech Stack

- **Framework:** Vite + React + TypeScript
- **Battle Engine:** PixiJS (overlay effects, particles, HUD) on top of HTML5 video elements
- **Styling:** Tailwind CSS (dashboard UI)
- **Blockchain Data:** Helius WebSocket API for real-time trade subscription
- **Hosting:** Vercel
- **AI Video Tools:** Kling AI / Runway Gen-3 / Pika (for generating anime clips)

## Site Architecture

### Three Layers

1. **Data Layer** — Connects to Solana via Helius WebSocket, subscribes to the token's pair address, classifies each swap as buy or sell, calculates rolling buy/sell ratio, tracks dominance duration.
2. **Battle Engine (PixiJS + Video)** — Manages video playback (selecting and sequencing AI clips based on volume state), renders procedural overlay effects (particles, screen shake, lighting, dust), handles state transitions between lobby/battle/finishing/post-battle.
3. **Dashboard UI (React + Tailwind)** — Buy/sell volume bar, dominance timer, recent trades feed, current price, episode indicator. Pinned below the battle canvas.

### Component Structure

```
src/
├── components/
│   ├── BattleCanvas/        # PixiJS canvas + video player
│   │   ├── BattleEngine.ts  # Core engine orchestrating video + effects
│   │   ├── VideoManager.ts  # Clip selection, sequencing, transitions
│   │   ├── EffectsLayer.ts  # Particles, shake, lighting overlays
│   │   └── HUD.ts           # In-canvas UI (dominance timer, momentum bar)
│   ├── Dashboard/           # React dashboard below canvas
│   │   ├── VolumeBar.tsx    # Buy/sell ratio bar
│   │   ├── TradesFeed.tsx   # Recent trades scrolling list
│   │   ├── PriceDisplay.tsx # Current token price
│   │   └── EpisodeInfo.tsx  # "Episode 1: Attack on Titan"
│   └── App.tsx              # Root layout
├── services/
│   ├── solana.ts            # Helius WebSocket connection, trade parsing
│   └── volumeTracker.ts     # Rolling window calculation, dominance tracking
├── assets/
│   └── videos/              # AI-generated clips organized by state
│       ├── lobby/
│       ├── battle-eren/
│       ├── battle-crew/
│       ├── battle-neutral/
│       ├── finishing-eren/
│       ├── finishing-crew/
│       └── post-battle/
└── config/
    ├── token.ts             # Token address, pair address, API keys
    └── episodes.ts          # Episode definitions (name, sides, clips, token address or null)
```

## Site States

### State 1: Pre-Battle Lobby

**When:** Default state before the coin is live or when not actively trading.

**Visuals:**
- AOV branding/logo displayed prominently
- AI-generated video clips loop in the background showing various anime characters in peaceful/idle scenes — hanging out, training casually, laughing together
- Clips cycle every 10-15 seconds with fade/crossfade transitions
- Subtle ambient particle overlay (floating dust, light rays)
- Dark cinematic color grading throughout

**Clips needed (~5-6 clips, 5-10 seconds each):**
- Characters from AoT in casual/peaceful settings
- Training scenes, campfire moments, cadet days
- Wall Maria landscape with characters idle
- Mixed anime characters teasing future episodes

**This is the site's default state.** The site must be fully functional and visually impressive with no coin attached. Rei Studios should feel like a real anime studio homepage on its own.

**Coin connection model:**
- An admin config (env variable or simple admin panel) holds the current token address
- When no token is set → site stays in lobby mode permanently, fully functional as a studio landing page
- When a token address is set → site connects to Helius, starts reading volume, and transitions to battle when trades flow
- When the token is removed (episode over) → site gracefully returns to post-battle/lobby state, no errors

**Transition to battle:** Screen glitches, static flash, sky darkens, ground shakes — snaps into battle mode.

### State 2: Active Battle (Episode)

**When:** Token is live and trades are flowing.

**Core mechanic:** A momentum value from -100 (Eren full dominance) to +100 (Crew full dominance), starting at 0. Each buy pushes toward +, each sell pushes toward -. This drives everything.

**Video clip system:**
- Clips are organized into pools: `battle-eren`, `battle-crew`, `battle-neutral`
- The VideoManager selects clips from the appropriate pool based on current momentum
- Clips play for 5-10 seconds, then transition to the next based on current state
- If momentum shifts mid-clip, the transition accelerates
- Random selection within each pool prevents repetition
- Same clip can feel different with varying overlay intensity

**Clip pools needed (~20-25 clips, 5-10 seconds each):**

Eren attacking (8-10 clips):
- Founding Titan punching, swiping, stomping
- Colossal Titans marching, crushing
- Eren grabbing/throwing Alliance members
- Rumbling advancing, destruction sequences
- Titans overwhelming the Crew

Crew attacking (8-10 clips):
- Mikasa ODM slashing attacks on titans
- Levi spinning blade attacks
- Armin thunder spear strikes
- Coordinated Alliance assault
- ODM gear flying sequences with strikes

Neutral clash (4-5 clips):
- Both sides colliding
- Back-and-forth exchanges
- Intense standoff moments
- Parry/block sequences

**Procedural overlay effects (PixiJS, real-time):**
- **Particles:** Dust, smoke, fire, debris, lightning — intensity scales with momentum
- **Screen shake:** On every trade. Small trades = subtle shake. Big trades = heavy shake.
- **Lighting:** Red/dark tint when Eren dominates, blue/bright when Crew dominates, warm orange at neutral
- **Speed lines:** Anime-style motion lines during intense moments
- **Impact flashes:** White/yellow flash on big trades
- **Combo effects:** 5+ consecutive trades for one side triggers enhanced visual burst

**Per-trade visual response:**
- Every incoming trade triggers an immediate visual event — a flash, shake, particle burst
- The side that made the trade gets a brief intensity boost
- Big trades (above configurable threshold) trigger larger effects

**Momentum-based intensity scaling:**
- -100 to -60 (Eren dominant): Heavy red atmosphere, maximum destruction effects, Crew clips show them struggling/retreating
- -60 to -30 (Eren leading): Red-tinted, strong effects, Eren clips are aggressive
- -30 to +30 (Neutral): Balanced clash, warm tones, intense back-and-forth
- +30 to +60 (Crew leading): Blue-tinted, Alliance gaining ground, hopeful effects
- +60 to +100 (Crew dominant): Bright atmosphere, maximum Alliance effects, Eren clips show titans falling

### State 3: Finishing Move

**When:** One side has held dominance (momentum above +50 or below -50) for 30 consecutive minutes.

**Eren wins finishing move:**
- Extended cinematic clip (10-15 seconds) of the Rumbling completing — total destruction
- Heavy screen effects — red flash, massive shake, debris everywhere
- Crew characters defeated
- Fades to Eren victory idle animation

**Crew wins finishing move:**
- Extended cinematic clip (10-15 seconds) of the Alliance's final attack — Eren taken down
- Blue/white flash, lightning effects, triumphant atmosphere
- Fades to Crew victory celebration

**Clips needed (2 clips, 10-15 seconds each):**
- Eren finishing move / victory cinematic
- Crew finishing move / victory cinematic

### State 4: Post-Battle

**After the finishing move plays:**

1. **Winner celebration** (15-30 seconds) — Victory idle clip with the winning side celebrating. Overlay shows episode results (total buys vs sells, duration, winning side).
2. **"Wait for Next Episode" screen** — Fades in with Rei Studios branding. AI video clips loop showing various anime characters in idle/teaser poses. Hints at future battles (silhouettes of Goku, Naruto, etc.). Maintains the dark cinematic aesthetic. **This becomes the persistent state of the site** after an episode ends — it stays here indefinitely until Dylan configures the next coin/episode. This is NOT a brief transition, it's the new "home screen" between episodes.

**Clips needed (~3-4 clips, 5-10 seconds each):**
- Eren victory celebration idle
- Crew victory celebration idle
- "Next episode" teaser clips with mixed anime characters
- Ambient waiting room clips

**Dev fee mechanic (if Crew/positive side wins):**
- All dev fees get recycled as scheduled buy-backs into the project
- This is a public commitment from Rei Studios: "If the community wins, we reinvest"
- Implementation details handled by Dylan manually

**Episode lifecycle:**
- Each episode = one coin launch + one battle
- When an episode ends and "Wait for Next Episode" shows, Dylan unlinks the current coin
- Next episode = new coin launched, new anime battle, site updated with new clips
- Old episodes are archived (results displayed on site)

## Dashboard UI

Pinned below the battle canvas. Always visible regardless of site state.

**Components:**
- **Buy/Sell Volume Bar** — Horizontal bar. Green fills right (buys/Crew), red fills left (sells/Eren). Real-time ratio.
- **Dominance Timer** — Shows current dominant side and time held. Format: "Eren: 14:32 / 30:00" counting toward finishing move.
- **Recent Trades Feed** — Scrolling list of recent swaps. Shows: amount (SOL), side (buy/sell), timestamp. Big trades highlighted with glow effect.
- **Current Price** — Live token price in SOL and USD.
- **Episode Indicator** — "Episode 1: Attack on Titan" with AOV logo.

**Styling:** Dark theme matching the cinematic battle canvas. Tailwind CSS. Minimal, clean, data-focused.

## Data Flow

```
Solana Blockchain
    │
    ▼
Helius WebSocket (subscribe to token pair)
    │
    ▼
Trade Parser (classify buy/sell, extract amount)
    │
    ▼
Volume Tracker (rolling 5-min window, momentum calc, dominance timer)
    │
    ├──▶ Battle Engine (clip selection, effects intensity)
    └──▶ Dashboard (volume bar, trades feed, price, timer)
```

**Trade classification:**
- Subscribe to the token's liquidity pair address via Helius WebSocket
- Each swap transaction is parsed: if SOL goes in and token comes out → buy. If token goes in and SOL comes out → sell.
- Trade amount in SOL is recorded for weighting momentum changes

**Momentum calculation:**
- Rolling 5-minute window of trades
- Momentum = (buy_volume - sell_volume) / total_volume × 100
- Clamped to [-100, +100]
- Updated on every new trade

**Dominance tracking:**
- If momentum has been consistently above +50 or below -50, the dominance timer starts
- Any flip below the threshold resets the timer
- At 30 minutes continuous dominance → finishing move triggers

## Logos

**Rei Studios logo:** WIT Studio-inspired typography — bold, clean, sharp edges. "Rei Studios" in a dramatic anime-studio style. This is the primary brand mark across the site, Twitter, and all public materials. Built as SVG for crisp rendering at any size. Dark color scheme with subtle glow/metallic effect.

**AOV episode logo:** Secondary mark for Episode 1. "AOV" or "Attack on Volume" styled to match the AoT aesthetic. Used within the episode UI and coin branding.

## Asset Delivery Checklist (What Dylan Needs to Provide)

### AI Video Clips

All clips should be:
- 5-10 seconds long (finishing moves 10-15 seconds)
- 1080p minimum, 16:9 aspect ratio
- MP4 format, H.264 codec
- Dark/cinematic color grading
- No text overlays or watermarks

**Lobby clips (5-6):**
1. AoT characters in peaceful/casual setting
2. Cadets training together
3. Campfire/resting scene
4. Wall Maria landscape with idle characters
5. Mixed anime characters teasing future episodes
6. General anime characters hanging out/idle

**Battle clips — Eren side (8-10):**
1. Founding Titan punch/swipe attack
2. Colossal Titans marching forward
3. Eren grabbing an Alliance member
4. Rumbling advancing — destruction
5. Titan stomping attack
6. Eren titan roaring/powering up
7. Multiple titans overwhelming scene
8. Eren titan throwing debris/attack
9. Ground-level destruction from Rumbling
10. Eren dominant — standing over battlefield

**Battle clips — Crew side (8-10):**
1. Mikasa ODM slash attack
2. Levi spinning blade strike
3. Armin thunder spear launch
4. Alliance coordinated assault
5. ODM gear flying + strike sequence
6. Mikasa close-up attack
7. Levi cutting down a titan
8. Thunder spear explosion on titan
9. Alliance members rallying/charging
10. Crew dominant — pushing forward

**Battle clips — Neutral (4-5):**
1. Both sides clashing head-on
2. Back-and-forth exchange
3. Intense standoff moment
4. Parry/block sequence
5. Aerial clash — ODM vs titan

**Finishing moves (2):**
1. Eren wins — Rumbling completes, total destruction (10-15 sec)
2. Crew wins — Alliance final attack, Eren taken down (10-15 sec)

**Post-battle (3-4):**
1. Eren victory idle/celebration
2. Crew victory idle/celebration
3. "Next episode" teaser — mixed anime silhouettes
4. Waiting room ambient — characters idle

**Total: ~35-40 clips**

### Recommended AI Video Prompts

Use Kling AI or Runway Gen-3. For each clip, first generate a still image with Midjourney/ChatGPT image gen, then animate it.

**Example prompt structure for still image:**
> "Anime screenshot, cinematic, dark atmosphere, [character description], [action], Attack on Titan art style, dramatic lighting, 16:9"

**Example prompt structure for video animation:**
> "Anime fight scene, [character] performing [action], dynamic camera movement, cinematic, dark atmosphere, 5 seconds"

Detailed prompts for each clip will be provided in a separate prompt guide document during implementation.

## Future Episodes

The site architecture supports multiple episodes:
- Each episode is a folder of video clips + a config file defining the two sides
- New episode = new token launch + new clips + config update + site redeploy
- Episode selection could become a dropdown/menu as the library grows
- Future battles: Goku vs Vegeta, Naruto vs Sasuke, Gojo vs Sukuna, etc.

## Wallets

- **eren** — vanity address starting with "eren" (lowercase), negative/sell side
- **crew** — vanity address (Dylan already has), positive/buy side
- **Rei** — vanity address starting with "Rei", studio/dev wallet
- All wallets controlled manually by Dylan, presented publicly as AI-powered agents
- Website reads wallet activity but does not control wallets

## Video Hosting

35-40 clips at 1080p is significant bandwidth. Videos should NOT be bundled in the git repo. Options:
- **Vercel Blob Storage** — simplest, integrates with Vercel hosting
- **Cloudflare R2** — cheap, fast CDN, no egress fees
- **Bunny CDN** — built for video delivery, very affordable

Recommendation: Cloudflare R2 for cost efficiency, or Vercel Blob for simplicity. Videos are referenced by URL in the clip config, not stored in the repo.

## Out of Scope (for v1)

- Trading bot implementation (Dylan handling)
- Token launch on pump.fun (manual process)
- Audio/music (can be added later)
- Mobile-optimized layout (desktop-first, responsive later)
- Multi-episode selector UI (just Episode 1 for now)

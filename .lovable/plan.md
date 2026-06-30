… (Plan)

## What I'll build

A single production-quality landing page for **ScriptFlow** at `/` (replacing the placeholder in `src/routes/index.tsx`), styled as a Linear/Vercel-class dark SaaS site. All UI is hand-built React + Tailwind v4 using semantic tokens — no stock illustrations, no emoji, Lucide icons only.

## Design system (src/styles.css)

- Force dark by default: add `dark` class to `<html>` in `__root.tsx` (and set body bg).
- Token overhaul in `src/styles.css` `:root` + `.dark`:
  - `--background`: very dark navy (~oklch 0.16 0.03 260)
  - `--surface` / `--card`: slightly lighter navy panels
  - `--primary` (navy blue) and `--accent` (electric blue ~oklch 0.7 0.2 250)
  - `--foreground` near-white, `--muted-foreground` cool gray
  - `--border`: subtle white/8%
  - Custom: `--gradient-hero` (radial electric-blue glow), `--shadow-glow`, `--shadow-elevated`
- Typography: load **Inter** via `<link>` in `__root.tsx` head (Google Fonts), register `--font-sans` in `@theme`.
- Radius scale tuned to XL (cards 20px, buttons rounded-xl).
- Custom utilities: `.glass-panel` (used only on floating dashboard cards / nav), `.text-gradient`, scroll fade-in animation.

## File structure

```
src/routes/index.tsx                 # composes all sections + SEO head()
src/components/landing/
  Navbar.tsx                         # sticky, blurs on scroll
  Hero.tsx                           # headline, CTAs, mock dashboard
  DashboardMock.tsx                  # reusable realistic SaaS dashboard UI
  ProblemSection.tsx                 # 4 pain cards + broken-vs-scriptflow flow
  SolutionSection.tsx                # one workspace narrative + illustration
  FeaturesBento.tsx                  # bento grid w/ mini UI previews
  ProductShowcase.tsx                # multi-screen floating glass panels
  HowItWorks.tsx                     # 5-step timeline
  Benefits.tsx                       # 2-column + stat cards
  Pricing.tsx                        # Free vs Premium (recommended)
  FAQ.tsx                            # shadcn Accordion
  FinalCTA.tsx                       # gradient emotional CTA
  Footer.tsx
  primitives/                        # small shared bits: SectionHeader, GradientOrb, GlowCard
```

Each section is self-contained, lazy-friendly, and uses only semantic tokens.

## Section build notes

- **Navbar**: transparent → adds `bg-background/70 backdrop-blur-xl border-b` after 8px scroll (scroll listener with rAF). Logo = inline SVG mark + wordmark.
- **Hero**: radial accent glow background, big bold H1, two CTAs (primary electric, secondary outline), small social-proof row (avatar stack with initials, "10k+ creators", live "1,284 scripts generated today" with count-up). Right side: `DashboardMock` with 2 floating glass cards (AI generation typing effect, teleprompter preview).
- **DashboardMock**: realistic sidebar (Workspace, Recent, Folders, Favorites), top bar (search, notification, avatar, Premium badge, usage meter), main panel switching between AI generator and script editor. Used in Hero + Showcase at different crops.
- **Problem**: 4 pain cards (Lucide icons: VideoOff, Zap, LayoutGrid, FileX). Below: two parallel vertical flow diagrams — chaotic "ChatGPT → Notes → Edit → Teleprompter → Record → Repeat" vs clean ScriptFlow flow, connected by arrows.
- **Solution**: large statement + small workspace illustration (reuses DashboardMock at reduced scale).
- **FeaturesBento**: 6–8 bento cells of varying sizes; each cell shows icon + title + one-liner + a tiny inline mock (e.g. AI Generator card shows a faux prompt input + generating dots; Teleprompter card shows scrolling text lines; Library card shows script list rows). Covers all listed features (smaller features grouped in one "And more" cell with chips).
- **ProductShowcase**: stacked overlapping glass panels rotated subtly (AI Generator, Editor, Teleprompter, History) on a soft accent glow.
- **HowItWorks**: 5 numbered steps with connecting line; each step has Lucide icon + title + 1-line description.
- **Benefits**: two columns of bullet cards; below, 3 stat cards (e.g. "10× faster", "50k scripts", "2 min average").
- **Pricing**: 2 cards, Premium with "Recommended" badge + accent border glow.
- **FAQ**: shadcn `<Accordion>` (already installed via shadcn presumably; if missing, install or build minimal).
- **FinalCTA**: full-bleed dark gradient panel with floating mini dashboard tile.
- **Footer**: 4 columns + socials (Lucide icons).

## Animations

- `fade-in` + `slide-up` keyframes triggered by an `IntersectionObserver` hook (`useInView`) on each section.
- Hero AI typing effect: `useEffect` interval revealing characters.
- Number count-up hook for social proof + stat cards.
- Hover: scale-[1.02] + glow shadow on cards and buttons; transition-all 200ms.
- No heavy libs — pure CSS + small hooks.

## SEO (head() in index.tsx)

- title: "ScriptFlow — AI Script Workspace for Short Video Creators"
- meta description (<160 chars), og:title/description/type=website, twitter:card=summary_large_image
- canonical "/" via `links`
- JSON-LD SoftwareApplication script via `scripts`
- Single H1 in Hero, semantic `<section>` / `<nav>` / `<footer>`.

## Out of scope

- No backend, no auth, no Lovable Cloud — the CTAs are visual (link to "#" / scroll to pricing).
- No generated raster images; dashboard mockups are pure HTML/CSS/SVG so they stay crisp and on-brand.
- No additional routes (Features/Pricing/FAQ are anchors on this single landing page, per the brief's nav structure).

## Verification

After build: read the page in the preview, check that dark mode is active, sections render, no console errors, and the layout holds at 1280 / 768 / 375 widths.

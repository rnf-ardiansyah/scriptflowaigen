# App Design System

Primitives that mirror the Landing Page's visual language. Use these on every
non-landing page so the app feels like one product.

## Tokens (already in `src/styles.css`)

| Token | Use |
| --- | --- |
| `bg-background` | Page background (very dark navy) |
| `bg-surface` | Card / panel base |
| `bg-surface-elevated` | Hover / nested panel |
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary text |
| `bg-electric` / `text-electric` | Accent (electric blue) |
| `border-border` | Subtle 8% white border |
| `shadow-glow` | Electric blue glow (CTA, recommended) |
| `shadow-elevated` | Floating panels / modals |
| `shadow-soft` | Default card shadow |
| `rounded-xl` | Buttons / inputs (12px) |
| `rounded-2xl` | Cards / panels (16px) |
| `font-sans` | Inter |

## Utilities

- `glass-panel` — frosted surface (use on modal, floating preview).
- `text-gradient`, `text-gradient-accent` — headings.
- `hero-glow`, `grid-bg` — backdrops for hero / auth screens.
- `animate-fade-up`, `animate-float`, `animate-caret` — motion presets.

## Primitives (`src/components/app/*`)

- `Button` — variants: `primary | secondary | ghost | outline | destructive`, sizes `sm | md | lg`. Pass `asChild` to wrap a `<Link>`.
- `Card` + `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter` — variants: `default | glow | glass | muted`.
- `Input`, `Textarea`, `Label` — form inputs styled to match the dashboard mock.
- `Badge` — variants: `electric | muted | outline | success`.
- `Dialog` — Radix dialog styled with `glass-panel`.
- `SectionShell` — page chrome (max-w-7xl + optional `glow` / `grid` backdrop).
- `AppLayout` — sticky top nav for authenticated app pages.
- `AuthLayout` — centered card for `/login`, `/register`, `/onboarding`.

## Rule of thumb

Never hardcode colors (e.g. `bg-[#3b82f6]`, `text-white`). Always use semantic
tokens so light/dark and theme tweaks stay in one place.

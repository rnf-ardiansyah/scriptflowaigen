## Teleprompter Build Plan — `/teleprompter/:scriptId`

Replace the current placeholder with a fully functional teleprompter that runs as its own immersive screen (no AppLayout chrome, so it can truly go fullscreen and stay distraction-free).

### Data
- Fetch the script via existing `scriptQueryOptions(scriptId)` from `src/lib/scripts.ts` (TanStack Query, same pattern as the editor).
- Use `script.full_script`; if empty, fall back to concatenating `hook/retain/reward/cta` for resilience. If still empty → show empty state with a CTA button linking to `/editor/$scriptId`.

### Layout
- Route renders a custom full-viewport shell (no `AppLayout`): `fixed inset-0` container that owns its own background + text color based on the teleprompter's local dark/light toggle (independent of app theme).
- Top bar (auto-hides after 3s of inactivity, reappears on mouse move / tap):
  - Back button → `/editor/$scriptId`
  - Fullscreen toggle (Fullscreen API: `requestFullscreen` / `exitFullscreen`, listen to `fullscreenchange`)
  - Dark/Light toggle (local state, default dark)
- Bottom control bar (also auto-hides):
  - Start / Pause button (primary, large)
  - Speed slider 0.5x–3x, step 0.1, default 1x, current value label
  - Font size control: 3 presets (S / M / L) mapped to ~32px / 48px / 64px
- Center: scrollable script container with large line-height, max-width for readability, generous top/bottom padding so text starts mid-screen and can scroll past.

### Auto-scroll engine
- `requestAnimationFrame` loop. Track `lastTimestamp`; each frame compute `delta = now - last` and increment `scrollTop` by `baseSpeed * speedMultiplier * (delta / 1000)` (e.g. base 60 px/s at 1x).
- Use fractional accumulator (separate `scrollPosRef` number) and apply `Math.round` to `scrollTop` to avoid jitter while keeping sub-pixel precision.
- Pause stops the rAF loop; resume restarts with fresh timestamp (no jump).
- Stop loop at `scrollHeight - clientHeight`.

### Interactions
- Spacebar → toggle play/pause (preventDefault to avoid page scroll). Attach to `window` keydown, cleanup on unmount.
- Tap anywhere on the scroll surface (mobile + desktop click) → toggle play/pause. Control bars themselves stop propagation so clicking controls doesn't pause.
- Mouse move / touch → reveal control bars + reset auto-hide timer.

### State
Local component state: `isPlaying`, `speed` (1), `fontSizePreset` ('m'), `isDark` (true), `isFullscreen`, `controlsVisible`. Refs: `scrollRef`, `rafRef`, `scrollPosRef`, `lastTsRef`, `hideTimerRef`.

### Empty state
If `full_script` (and fallback concat) is blank → centered card: "Script masih kosong. Tulis script-nya dulu di editor." + button to editor.

### Files touched
- `src/routes/_authenticated/teleprompter.$scriptId.tsx` — full rewrite into the teleprompter screen described above.

No DB, no schema, no other files changed. The editor's existing "Buka di Teleprompter" button already links here.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Type,
} from "lucide-react";
import { scriptDetailQuery, buildFullScript } from "@/lib/scripts";
import { Button } from "@/components/app/Button";

export const Route = createFileRoute("/_authenticated/teleprompter_/$scriptId")({
  head: () => ({
    meta: [
      { title: "Teleprompter · ScriptFlow" },
      { name: "description", content: "Rehearse your script in the built-in teleprompter." },
    ],
  }),
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(scriptDetailQuery(params.scriptId)),
  component: TeleprompterPage,
});

const FONT_SIZES = {
  s: { label: "S", px: 32, line: 1.45 },
  m: { label: "M", px: 48, line: 1.4 },
  l: { label: "L", px: 64, line: 1.35 },
} as const;
type FontKey = keyof typeof FONT_SIZES;

const BASE_SPEED_PX_PER_SEC = 60;

function TeleprompterPage() {
  const { scriptId } = Route.useParams();
  const navigate = useNavigate();
  const { data: script } = useSuspenseQuery(scriptDetailQuery(scriptId));

  const text = useMemo(() => {
    const stored = script?.full_script?.trim();
    if (stored) return stored;
    return buildFullScript({
      hook: script?.hook,
      retain: script?.retain,
      reward: script?.reward,
      cta: script?.cta,
    });
  }, [script]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fontKey, setFontKey] = useState<FontKey>("m");
  const [isDark, setIsDark] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const scrollPosRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Auto-scroll loop
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      const el = scrollRef.current;
      if (!el) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      scrollPosRef.current += BASE_SPEED_PX_PER_SEC * speedRef.current * dt;
      const max = el.scrollHeight - el.clientHeight;
      if (scrollPosRef.current >= max) {
        scrollPosRef.current = max;
        el.scrollTop = max;
        setIsPlaying(false);
        return;
      }
      el.scrollTop = Math.round(scrollPosRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [isPlaying]);

  // Sync scrollPosRef when user manually scrolls
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (!isPlaying) scrollPosRef.current = el.scrollTop;
  };

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  // Spacebar shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  // Fullscreen API
  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* ignore */
    }
  };
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Auto-hide controls
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);
  useEffect(() => {
    showControls();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [showControls]);

  const handleSurfaceTap = () => {
    showControls();
    togglePlay();
  };

  const bg = isDark ? "bg-black" : "bg-white";
  const fg = isDark ? "text-white" : "text-black";
  const subtleBar = isDark ? "bg-white/10 text-white" : "bg-black/10 text-black";

  if (!text.trim()) {
    return (
      <div
        ref={containerRef}
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6 ${bg} ${fg}`}
      >
        <h1 className="text-2xl font-semibold md:text-3xl">Script masih kosong</h1>
        <p className="max-w-md text-center opacity-70">
          Belum ada konten untuk ditampilkan. Tulis hook, retain, reward, dan CTA-nya
          dulu di editor.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/editor/$scriptId" params={{ scriptId }}>
              <ArrowLeft className="h-4 w-4" /> Buka editor
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => navigate({ to: "/library" })}>
            Ke library
          </Button>
        </div>
      </div>
    );
  }

  const font = FONT_SIZES[fontKey];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 overflow-hidden ${bg} ${fg}`}
      onMouseMove={showControls}
      onTouchStart={showControls}
    >
      {/* Top bar */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto">
          <Link
            to="/editor/$scriptId"
            params={{ scriptId }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur ${subtleBar} hover:opacity-90`}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke editor
          </Link>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur ${subtleBar}`}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur ${subtleBar}`}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Scroll surface */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onClick={handleSurfaceTap}
        className="h-full w-full overflow-y-auto"
        style={{ scrollBehavior: "auto" }}
      >
        <div
          className="mx-auto max-w-4xl px-6"
          style={{
            paddingTop: "50vh",
            paddingBottom: "60vh",
            fontSize: `${font.px}px`,
            lineHeight: font.line,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            whiteSpace: "pre-wrap",
            textAlign: "center",
          }}
        >
          {text}
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`pointer-events-auto flex w-full max-w-3xl flex-col items-stretch gap-3 rounded-2xl p-4 backdrop-blur md:flex-row md:items-center ${subtleBar}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={togglePlay}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold ${
              isDark ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5" /> Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" /> Start
              </>
            )}
          </button>

          <div className="flex flex-1 items-center gap-3">
            <span className="w-14 text-xs uppercase tracking-wide opacity-70">
              Speed
            </span>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1 accent-current"
            />
            <span className="w-10 text-right text-sm tabular-nums">
              {speed.toFixed(1)}x
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 opacity-70" />
            {(Object.keys(FONT_SIZES) as FontKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFontKey(k)}
                className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                  fontKey === k
                    ? isDark
                      ? "bg-white text-black"
                      : "bg-black text-white"
                    : "opacity-70 hover:opacity-100"
                }`}
                aria-label={`Font size ${FONT_SIZES[k].label}`}
              >
                {FONT_SIZES[k].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

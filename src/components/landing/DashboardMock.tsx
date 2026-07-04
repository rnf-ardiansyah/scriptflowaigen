import { useEffect, useState } from "react";
import {
  Sparkles,
  FolderOpen,
  Star,
  Clock,
  Search,
  Bell,
  FileText,
  Plus,
  Crown,
  Mic,
} from "lucide-react";

const TYPED = [
  "Hook: Kebanyakan kreator buang 2 jam mantengin layar kosong.",
  "Ini skrip 60 detik yang langsung ngeberesin itu — seketika.",
  "Langkah 1: Buka Script Flow dan tulis idemu…",
];

export function DashboardMock() {
  const [text, setText] = useState("");
  const [line, setLine] = useState(0);

  useEffect(() => {
    const target = TYPED[line];
    if (text.length < target.length) {
      const t = setTimeout(() => setText(target.slice(0, text.length + 1)), 28);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setText("");
      setLine((line + 1) % TYPED.length);
    }, 1600);
    return () => clearTimeout(t);
  }, [text, line]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated">
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.6_0.18_25)]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.16_85)]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.16_150)]/70" />
        </div>
        <div className="ml-3 flex flex-1 items-center gap-2 rounded-md bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
          <Search className="h-3 w-3" />
          <span className="truncate">scriptflow.app / workspace</span>
        </div>
        <Bell className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="ml-2 grid h-6 w-6 place-items-center rounded-full bg-electric/20 text-[10px] font-semibold text-electric">
          A
        </div>
      </div>

      <div className="grid grid-cols-[160px_1fr] min-h-[360px]">
        {/* sidebar */}
        <aside className="border-r border-border bg-background/40 p-3">
          <button className="flex w-full items-center gap-2 rounded-lg bg-electric px-2.5 py-1.5 text-[11px] font-medium text-electric-foreground">
            <Plus className="h-3 w-3" /> Skrip Baru
          </button>
          <nav className="mt-4 space-y-0.5 text-[11px]">
            {[
              { icon: Sparkles, label: "AI Generator", active: true },
              { icon: FileText, label: "Semua Skrip" },
              { icon: Star, label: "Favorit" },
              { icon: FolderOpen, label: "Folder" },
              { icon: Clock, label: "Terbaru" },
              { icon: Mic, label: "Teleprompter" },
            ].map((n) => (
              <div
                key={n.label}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                  n.active
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <n.icon className="h-3 w-3" />
                {n.label}
              </div>
            ))}
          </nav>
          <div className="mt-5 border-t border-border pt-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Folder</p>
            <ul className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
              <li className="truncate">📁 TikTok Hooks</li>
              <li className="truncate">📁 Product Launch</li>
              <li className="truncate">📁 Tutorial</li>
            </ul>
          </div>
          <div className="mt-5 rounded-lg border border-border bg-surface p-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-electric">
              <Crown className="h-3 w-3" /> Premium
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-background">
              <div className="h-full w-2/3 rounded-full bg-electric" />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">62 / 100 AI hari ini</p>
          </div>
        </aside>

        {/* main */}
        <section className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">AI Generator</p>
              <h3 className="text-base font-semibold">Skrip TikTok Baru</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                60d · Gaya Hook
              </span>
            </div>
          </div>

          {/* prompt input */}
          <div className="mt-4 rounded-xl border border-border bg-background/60 p-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-electric" />
              Ide
            </div>
            <p className="mt-1.5 text-[12px] text-foreground">
              5 kesalahan kreator pemula di TikTok
            </p>
          </div>

          {/* generated output */}
          <div className="mt-3 rounded-xl border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-electric animate-pulse" /> Sedang generate…
              </span>
              <span>2.4d</span>
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-foreground/90">
              {text}
              <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-0.5 bg-electric animate-caret" />
            </p>
            <div className="mt-3 space-y-1.5">
              <div className="h-2 w-11/12 rounded bg-surface-elevated" />
              <div className="h-2 w-9/12 rounded bg-surface-elevated" />
              <div className="h-2 w-10/12 rounded bg-surface-elevated" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button className="rounded-lg bg-electric px-3 py-1.5 text-[11px] font-medium text-electric-foreground">
              Simpan ke Library
            </button>
            <button className="rounded-lg border border-border px-3 py-1.5 text-[11px] text-foreground hover:bg-surface-elevated">
              Buka Teleprompter
            </button>
            <span className="ml-auto text-[10px] text-muted-foreground">~ 48d baca</span>
          </div>
        </section>
      </div>
    </div>
  );
}

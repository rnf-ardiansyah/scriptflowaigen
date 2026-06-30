export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-electric to-[oklch(0.55_0.22_265)] shadow-glow">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-electric-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h10" />
          <path d="M4 12h16" />
          <path d="M4 17h7" />
          <path d="M18 14l3 3-3 3" />
        </svg>
      </div>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">ScriptFlow</span>
    </div>
  );
}

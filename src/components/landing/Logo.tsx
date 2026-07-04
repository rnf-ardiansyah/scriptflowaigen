export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Custom Script Flow Logo Icon (Stylized paper + accent stream/play) */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 select-none"
      >
        <rect width="32" height="32" rx="9" fill="url(#logo-grad)" />
        {/* Document lines representing Script */}
        <path
          d="M9 10H23M9 15H21M9 20H15"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Flow indicator: play triangle merging with a wave/stream */}
        <path
          d="M19 19.5L25 22.5L19 25.5V19.5Z"
          fill="#00F5FF"
          className="animate-pulse"
        />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB" />
            <stop stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>

      {/* Rebranded Typography */}
      <span className="font-sans text-xl font-black tracking-tight select-none sm:text-2xl">
        <span className="text-foreground">Script</span>
        <span className="text-electric ml-1">Flow</span>
      </span>
    </div>
  );
}

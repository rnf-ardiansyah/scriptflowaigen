export function AppLoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-20">
        <div className="space-y-4">
          <Skel className="h-6 w-24" />
          <Skel className="h-10 w-72" />
          <Skel className="h-4 w-48" />
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Skel className="h-24" />
          <Skel className="h-24" />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skel className="h-40" />
          <Skel className="h-40" />
          <Skel className="h-40" />
        </div>
      </div>
    </div>
  );
}

function Skel({ className = "" }: { className?: string }) {
  return (
    <div
      className={
        "animate-pulse rounded-xl border border-border bg-surface/60 " + className
      }
    />
  );
}

import iconAsset from "@/assets/logo-icon.png.asset.json";
import wordmarkAsset from "@/assets/logo-wordmark.png.asset.json";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={iconAsset.url}
        alt=""
        aria-hidden="true"
        className="h-8 w-auto select-none"
        draggable={false}
      />
      <img
        src={wordmarkAsset.url}
        alt="ScriptFlow"
        className="h-5 w-auto select-none sm:h-6"
        draggable={false}
      />
    </div>
  );
}

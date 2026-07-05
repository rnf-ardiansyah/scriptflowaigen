import logoIcon from "@/assets/logo-icon.png";
import logoWordmark from "@/assets/logo-wordmark.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoIcon}
        alt=""
        aria-hidden="true"
        className="h-9 w-auto select-none"
        draggable={false}
      />
      <img
        src={logoWordmark}
        alt="ScriptFlow"
        className="h-5 w-auto select-none sm:h-6"
        draggable={false}
      />
    </div>
  );
}

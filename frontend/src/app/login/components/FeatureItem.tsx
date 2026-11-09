
export function FeatureItem({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 text-[14.5px] text-ink-secondary">
      <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-green-bg text-green-fg">
        <Check size={12} strokeWidth={3} />
      </span>
      {children}
    </div>
  );
}import { Check } from "lucide-react";


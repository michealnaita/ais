import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-[30px] flex items-start justify-between gap-6">
      <div>
        <h1 className="font-display text-[44px] leading-[1.04] font-medium tracking-[-0.015em]">{title}</h1>
        <p className="mt-2 max-w-[480px] text-[14.5px] text-ink-tertiary">{subtitle}</p>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  subtitle: string;
  /** Link back to a parent screen, shown above the title. */
  back?: { href: string; label: string };
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, back, actions }: PageHeaderProps) {
  return (
    <div className="mb-[30px] flex items-start justify-between gap-6">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="-ml-1 mb-3 inline-flex items-center gap-1 text-[13px] font-medium text-ink-tertiary hover:text-ink"
          >
            <ChevronLeft className="size-4" />
            {back.label}
          </Link>
        )}
        <h1 className="font-display text-4xl leading-[1.04] font-medium tracking-[-0.015em]">
          {title}
        </h1>
        <p className="mt-2 max-w-[480px] text-[14.5px] text-ink-tertiary">
          {subtitle}
        </p>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-3">{actions}</div>
      )}
    </div>
  );
}

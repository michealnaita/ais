import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Scrollable main column; content sits in Tailwind's `container` (see globals.css).
 * With `fill`, the page itself doesn't scroll: content is a flex column clamped to the
 * viewport height, so a child with `min-h-0` (e.g. a `scrollBody` table) scrolls instead.
 */
export function PageContainer({
  children,
  className,
  fill = false,
}: {
  children: ReactNode;
  className?: string;
  fill?: boolean;
}) {
  return (
    <div className={cn('min-w-0 flex-1', fill ? 'flex flex-col overflow-hidden' : 'overflow-y-auto')}>
      <div className={cn('container py-6', fill && 'flex min-h-0 flex-1 flex-col', className)}>{children}</div>
    </div>
  );
}

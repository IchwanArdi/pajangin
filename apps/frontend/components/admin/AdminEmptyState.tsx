import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../dashboard/ui';

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-2 text-ink-2">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <h2 className="mt-3 text-sm font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-ink-2">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </Card>
  );
}

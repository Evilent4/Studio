import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[var(--studio-radius-lg)] border border-dashed border-[var(--studio-border)] bg-[var(--studio-surface)]/50 px-8 py-14 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--studio-surface-2)] ring-1 ring-[var(--studio-border)]">
        <span className="[&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-[var(--studio-text-muted)] [&>svg]:stroke-[1.5]">
          {icon}
        </span>
      </div>
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium tracking-tight text-[var(--studio-text)]">
          {title}
        </h3>
        <p className="max-w-xs text-[13px] leading-relaxed text-[var(--studio-text-muted)]">
          {description}
        </p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

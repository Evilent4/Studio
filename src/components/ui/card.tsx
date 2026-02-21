import { cn } from "@/lib/utils";

type CardVariant = "default" | "interactive" | "highlighted";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "border-[var(--studio-border)] bg-[var(--studio-surface)]",
  interactive:
    "border-[var(--studio-border)] bg-[var(--studio-surface)] cursor-pointer hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-2)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-[var(--studio-transition)]",
  highlighted:
    "border-[var(--studio-accent)]/40 bg-[var(--studio-accent-muted)] shadow-[0_0_0_1px_var(--studio-accent)]/15",
};

export function Card({
  variant = "default",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--studio-radius-lg)] border p-5",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-medium tracking-tight text-[var(--studio-text)]", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-0.5 text-xs text-[var(--studio-text-muted)]", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useToastStore, type ToastVariant } from "@/store/toast";
import { cn } from "@/lib/utils";

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; bg: string; border: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-[var(--studio-surface)] border-[var(--studio-success)]/30",
    border: "border",
    iconColor: "text-[var(--studio-success)]",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-[var(--studio-surface)] border-[var(--studio-error)]/30",
    border: "border",
    iconColor: "text-[var(--studio-error)]",
  },
  info: {
    icon: Info,
    bg: "bg-[var(--studio-surface)] border-[var(--studio-accent)]/30",
    border: "border",
    iconColor: "text-[var(--studio-accent)]",
  },
};

function ToastItem({
  id,
  variant,
  message,
}: {
  id: string;
  variant: ToastVariant;
  message: string;
}) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [visible, setVisible] = useState(false);

  const config = variantConfig[variant];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation on mount
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => removeToast(id), 160);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-[var(--studio-radius-lg)] px-3.5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-200",
        config.bg,
        config.border,
        visible
          ? "translate-x-0 opacity-100"
          : "translate-x-4 opacity-0"
      )}
    >
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.iconColor)} strokeWidth={2} />
      <p className="flex-1 text-[13px] leading-snug text-[var(--studio-text)]">
        {message}
      </p>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-[var(--studio-radius-sm)] p-0.5 text-[var(--studio-text-muted)] hover:bg-[var(--studio-surface-2)] hover:text-[var(--studio-text-secondary)]"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          variant={toast.variant}
          message={toast.message}
        />
      ))}
    </div>
  );
}

"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--studio-accent)] text-white hover:bg-[var(--studio-accent-hover)] focus-visible:ring-[var(--studio-accent)]/40",
  secondary:
    "bg-[var(--studio-surface-2)] text-[var(--studio-text)] border border-[var(--studio-border)] hover:bg-[var(--studio-surface-hover)] hover:border-[var(--studio-border-hover)]",
  ghost:
    "bg-transparent text-[var(--studio-text-secondary)] hover:bg-[var(--studio-surface-2)] hover:text-[var(--studio-text)]",
  danger:
    "bg-[var(--studio-error)] text-white hover:brightness-110",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-[11px] gap-1.5 rounded-[var(--studio-radius-sm)]",
  md: "h-9 px-4 text-[13px] gap-2 rounded-[var(--studio-radius-md)]",
  lg: "h-11 px-5 text-sm gap-2.5 rounded-[var(--studio-radius-lg)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center font-medium select-none",
          "active:scale-[0.97] transition-all duration-[var(--studio-transition)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2
            className={cn(
              "animate-spin",
              size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4.5 w-4.5" : "h-4 w-4"
            )}
          />
        ) : icon ? (
          <span
            className={cn(
              "shrink-0",
              size === "sm" ? "[&>svg]:h-3 [&>svg]:w-3" : size === "lg" ? "[&>svg]:h-4.5 [&>svg]:w-4.5" : "[&>svg]:h-4 [&>svg]:w-4"
            )}
          >
            {icon}
          </span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

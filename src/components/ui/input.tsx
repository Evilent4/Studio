"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--studio-text-secondary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-[var(--studio-radius-md)] border bg-[var(--studio-surface-2)] px-3 py-2.5 text-sm text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:outline-none transition-colors duration-[var(--studio-transition)]",
            error
              ? "border-[var(--studio-error)]/60 focus:border-[var(--studio-error)]"
              : "border-[var(--studio-border)] focus:border-[var(--studio-accent)]/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[11px] text-[var(--studio-error)]">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-[var(--studio-text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--studio-text-secondary)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-[var(--studio-radius-md)] border bg-[var(--studio-surface-2)] px-3 py-2.5 text-sm leading-relaxed text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:outline-none resize-none transition-colors duration-[var(--studio-transition)]",
            error
              ? "border-[var(--studio-error)]/60 focus:border-[var(--studio-error)]"
              : "border-[var(--studio-border)] focus:border-[var(--studio-accent)]/50",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[11px] text-[var(--studio-error)]">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-[11px] text-[var(--studio-text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

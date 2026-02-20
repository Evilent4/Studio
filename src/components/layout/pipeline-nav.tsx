"use client";

import { Check, Loader2, Circle } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { cn } from "@/lib/utils";

export function PipelineNav() {
  const { steps, currentStep, setCurrentStep } = usePipelineStore();

  if (steps.length === 0) {
    return (
      <div className="p-4">
        <p className="text-xs text-[var(--studio-text-muted)]">No pipeline loaded</p>
      </div>
    );
  }

  return (
    <div className="px-3 py-3">
      <ul className="relative flex flex-col gap-0.5">
        {/* Vertical connector line */}
        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-[var(--studio-border)]" />

        {steps.map((step, index) => {
          const isActive = step.step_number === currentStep;
          const isCompleted = step.status === "completed";
          const isProcessing = step.status === "active";

          return (
            <li key={step.step_number}>
              <button
                onClick={() => setCurrentStep(step.step_number)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-[var(--studio-radius-md)] px-3 py-2.5 text-[13px]",
                  isActive
                    ? "bg-[var(--studio-surface-2)] text-[var(--studio-text)]"
                    : "text-[var(--studio-text-secondary)] hover:bg-[var(--studio-surface-hover)] hover:text-[var(--studio-text)]"
                )}
              >
                <span className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">
                  {isCompleted && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--studio-success-muted)]">
                      <Check className="h-3 w-3 text-[var(--studio-success)]" strokeWidth={2.5} />
                    </span>
                  )}
                  {isProcessing && (
                    <Loader2 className="h-4 w-4 animate-spin text-[var(--studio-accent)]" />
                  )}
                  {!isCompleted && !isProcessing && (
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        isActive
                          ? "border-[var(--studio-accent)] bg-[var(--studio-accent-muted)]"
                          : "border-[var(--studio-border-hover)] bg-[var(--studio-surface)]"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          isActive
                            ? "text-[var(--studio-accent)]"
                            : "text-[var(--studio-text-muted)]"
                        )}
                      >
                        {index + 1}
                      </span>
                    </span>
                  )}
                </span>
                <span className={cn("truncate", isActive && "font-medium")}>
                  {step.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

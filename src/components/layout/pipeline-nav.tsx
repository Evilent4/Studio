"use client";

import { Check, Loader2, Circle } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { cn } from "@/lib/utils";

export function PipelineNav() {
  const { steps, currentStep, setCurrentStep } = usePipelineStore();

  if (steps.length === 0) {
    return (
      <aside className="w-48 shrink-0 border-r border-[var(--studio-border)] p-4">
        <p className="text-sm text-[var(--studio-text-muted)]">No pipeline loaded</p>
      </aside>
    );
  }

  return (
    <aside className="w-48 shrink-0 border-r border-[var(--studio-border)] p-2">
      <ul className="flex flex-col gap-1">
        {steps.map((step) => (
          <li key={step.step_number}>
            <button
              onClick={() => setCurrentStep(step.step_number)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                step.step_number === currentStep
                  ? "bg-[var(--studio-surface-2)] text-[var(--studio-text)]"
                  : "text-[var(--studio-text-secondary)] hover:bg-[var(--studio-surface-2)] hover:text-[var(--studio-text)]"
              )}
            >
              {step.status === "completed" && (
                <Check className="h-4 w-4 shrink-0 text-[var(--studio-success)]" />
              )}
              {step.status === "active" && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--studio-accent)]" />
              )}
              {(step.status === "pending" || step.status === "skipped") && (
                <Circle className="h-4 w-4 shrink-0 text-[var(--studio-text-muted)]" />
              )}
              <span className="truncate">{step.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

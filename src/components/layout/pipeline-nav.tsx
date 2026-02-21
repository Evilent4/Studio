"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { cn } from "@/lib/utils";

/** Short descriptions for each pipeline step by name */
const STEP_DESCRIPTIONS: Record<string, string> = {
  brief: "Describe the creative direction and upload references",
  format: "Choose canvas dimensions for your output",
  grid: "Pick a layout grid to divide the canvas into zones",
  "zone assignment": "Assign a role (image, text, etc.) to each zone",
  "zone compose": "Fill each zone with content",
  compose: "Fill each zone with content",
  compile: "Render all zones into a single composition",
  export: "Download the final output",
};

function getStepDescription(name: string): string | undefined {
  const key = name.toLowerCase();
  return STEP_DESCRIPTIONS[key];
}

export function PipelineNav() {
  const { steps, currentStep, setCurrentStep } = usePipelineStore();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

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
          const isHovered = hoveredStep === step.step_number;
          const description = getStepDescription(step.name);

          return (
            <li key={step.step_number}>
              <button
                onClick={() => setCurrentStep(step.step_number)}
                onMouseEnter={() => setHoveredStep(step.step_number)}
                onMouseLeave={() => setHoveredStep(null)}
                className={cn(
                  "relative flex w-full items-start gap-3 rounded-[var(--studio-radius-md)] px-3 py-2.5 text-[13px] active:scale-[0.98] transition-all duration-[var(--studio-transition)]",
                  isActive
                    ? "bg-[var(--studio-surface-2)] text-[var(--studio-text)]"
                    : "text-[var(--studio-text-secondary)] hover:bg-[var(--studio-surface-hover)] hover:text-[var(--studio-text)]"
                )}
              >
                <span className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center mt-px">
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
                        "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
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
                <div className="flex flex-col items-start min-w-0">
                  <span className={cn("truncate", isActive && "font-medium")}>
                    {step.name}
                  </span>
                  {description && (isActive || isHovered) && (
                    <span className="mt-0.5 text-[10px] leading-snug text-[var(--studio-text-muted)] line-clamp-2">
                      {description}
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

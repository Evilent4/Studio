"use client";

import { usePipelineStore } from "@/store/pipeline";
import { BriefStep } from "@/components/pipeline/steps/brief-step";
import { FormatStep } from "@/components/pipeline/steps/format-step";
import { GridStep } from "@/components/pipeline/steps/grid-step";

export function StaticPipeline() {
  const currentStep = usePipelineStore((s) => s.currentStep);

  switch (currentStep) {
    case 0:
      return <BriefStep />;
    case 1:
      return <FormatStep />;
    case 2:
      return <GridStep />;
    default:
      return (
        <div className="flex flex-col gap-2 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
            Step {currentStep}
          </h2>
          <p className="text-xs text-[var(--studio-text-muted)]">Coming soon</p>
        </div>
      );
  }
}

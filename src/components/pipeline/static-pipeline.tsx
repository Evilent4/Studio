"use client";

import { usePipelineStore } from "@/store/pipeline";
import { BriefStep } from "@/components/pipeline/steps/brief-step";
import { FormatStep } from "@/components/pipeline/steps/format-step";
import { GridStep } from "@/components/pipeline/steps/grid-step";
import { ZoneAssignmentStep } from "@/components/pipeline/steps/zone-assignment-step";
import { ZoneComposeStep } from "@/components/pipeline/steps/zone-compose-step";
import { CompileStep } from "@/components/pipeline/steps/compile-step";
import { ExportStep } from "@/components/pipeline/steps/export-step";

export function StaticPipeline() {
  const currentStep = usePipelineStore((s) => s.currentStep);

  switch (currentStep) {
    case 0:
      return <BriefStep />;
    case 1:
      return <FormatStep />;
    case 2:
      return <GridStep />;
    case 3:
      return <ZoneAssignmentStep />;
    case 4:
      return <ZoneComposeStep />;
    case 5:
      return <ZoneComposeStep />;
    case 6:
      return <CompileStep />;
    case 7:
      return <ExportStep />;
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

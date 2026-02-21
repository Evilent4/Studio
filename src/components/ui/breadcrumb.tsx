"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";

export function Breadcrumb() {
  const projectName = usePipelineStore((s) => s.projectName);
  const currentStep = usePipelineStore((s) => s.currentStep);
  const steps = usePipelineStore((s) => s.steps);

  const currentStepName = steps[currentStep]?.name ?? null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 px-4 py-2 text-[12px] border-b border-[var(--studio-border)] bg-[var(--studio-surface)]"
    >
      <Link
        href="/dashboard"
        className="text-[var(--studio-text-muted)] hover:text-[var(--studio-text-secondary)] transition-colors"
      >
        Dashboard
      </Link>

      {projectName && (
        <>
          <ChevronRight className="h-3 w-3 text-[var(--studio-border-hover)]" strokeWidth={1.5} />
          <span className="text-[var(--studio-text-secondary)] font-medium truncate max-w-[180px]">
            {projectName}
          </span>
        </>
      )}

      {currentStepName && (
        <>
          <ChevronRight className="h-3 w-3 text-[var(--studio-border-hover)]" strokeWidth={1.5} />
          <span className="text-[var(--studio-text)] font-medium">
            {currentStepName}
          </span>
        </>
      )}
    </nav>
  );
}

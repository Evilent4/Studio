"use client";

import { PipelineNav } from "@/components/layout/pipeline-nav";
import { CanvasArea } from "@/components/layout/canvas-area";
import { DirectionBar } from "@/components/layout/direction-bar";
import { StaticPipeline } from "@/components/pipeline/static-pipeline";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export function Workspace() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Breadcrumb />
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: pipeline nav + step UI */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-[var(--studio-border)] bg-[var(--studio-surface)]">
          <PipelineNav />
          <div className="flex-1 overflow-auto border-t border-[var(--studio-border)]">
            <StaticPipeline />
          </div>
        </aside>

        {/* Center: canvas */}
        <CanvasArea />
      </div>
      <DirectionBar />
    </div>
  );
}

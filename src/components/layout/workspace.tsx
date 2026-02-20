"use client";

import { PipelineNav } from "@/components/layout/pipeline-nav";
import { CanvasArea } from "@/components/layout/canvas-area";
import { DirectionBar } from "@/components/layout/direction-bar";
import { StaticPipeline } from "@/components/pipeline/static-pipeline";

export function Workspace() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: pipeline nav + step UI */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-[var(--studio-border)]">
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

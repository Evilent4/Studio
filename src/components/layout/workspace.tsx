"use client";

import { PipelineNav } from "@/components/layout/pipeline-nav";
import { CanvasArea } from "@/components/layout/canvas-area";
import { DirectionBar } from "@/components/layout/direction-bar";

export function Workspace() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <PipelineNav />
        <CanvasArea />
      </div>
      <DirectionBar />
    </div>
  );
}

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { usePipelineStore } from "@/store/pipeline";

const GridEditor = dynamic(
  () => import("@/components/canvas/grid-editor").then((mod) => mod.GridEditor),
  { ssr: false }
);

export function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const steps = usePipelineStore((s) => s.steps);
  const format = steps[1]?.output?.format as
    | { width: number; height: number; label: string }
    | undefined;

  const measure = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
    }
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(() => measure());
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [measure]);

  return (
    <div
      ref={containerRef}
      className="flex flex-1 items-center justify-center bg-[var(--studio-canvas-bg)] overflow-hidden"
    >
      {format && size.width > 0 && size.height > 0 ? (
        <GridEditor
          width={size.width}
          height={size.height}
          canvasWidth={format.width}
          canvasHeight={format.height}
        />
      ) : (
        <span className="text-[13px] text-[var(--studio-text-muted)]">
          Select a format to view the canvas
        </span>
      )}
    </div>
  );
}

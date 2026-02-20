"use client";

import { useState } from "react";
import { Loader2, Play, ArrowRight } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api";

export function CompileStep() {
  const { zones, steps, updateStepOutput, updateStepStatus, setCurrentStep } =
    usePipelineStore();

  const step1Output = steps[1]?.output;
  const format = step1Output?.format as
    | { width: number; height: number; label: string }
    | undefined;

  const existingRenderId = (steps[6]?.output?.render_id as string) || null;

  const [renderId, setRenderId] = useState<string | null>(existingRenderId);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRender = async () => {
    if (!format) return;
    setRendering(true);
    setError(null);

    try {
      const payload = {
        project_id: "preview",
        canvas_width: format.width,
        canvas_height: format.height,
        zones: zones.map((z) => ({
          bounds: z.bounds,
          content: z.content,
          zone_order: z.zone_order,
        })),
      };

      const res = await fetch(`${API_BASE}/compose/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Render failed: ${res.status}`);
      }

      const data = await res.json();
      setRenderId(data.render_id);
      updateStepOutput(6, { render_id: data.render_id });
      updateStepStatus(6, "completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Render failed");
    } finally {
      setRendering(false);
    }
  };

  const handleNext = () => {
    if (!renderId) return;
    setCurrentStep(7);
  };

  if (!format) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
          Compile
        </h2>
        <p className="text-xs text-[var(--studio-text-muted)]">
          Please complete the Format step first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
        Compile
      </h2>

      <p className="text-xs text-[var(--studio-text-muted)]">
        Render all zones into a final composition ({format.width} x{" "}
        {format.height})
      </p>

      <button
        onClick={handleRender}
        disabled={rendering || zones.length === 0}
        className={cn(
          "flex items-center justify-center gap-2 w-full rounded-md px-4 py-2 text-sm font-medium transition-colors",
          rendering
            ? "bg-[var(--studio-surface-2)] text-[var(--studio-text-muted)] cursor-wait"
            : "bg-[var(--studio-accent)] text-white hover:bg-[var(--studio-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {rendering ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Rendering...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Render Preview
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {renderId && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-md border border-[var(--studio-border)]">
            <img
              src={`${API_BASE}/compose/render/${renderId}`}
              alt="Rendered composition"
              className="w-full h-auto"
            />
          </div>

          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2 w-full rounded-md bg-[var(--studio-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--studio-accent-hover)] transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Export
          </button>
        </div>
      )}
    </div>
  );
}

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
      <div className="flex flex-col gap-5 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
          Compile
        </h2>
        <p className="text-xs leading-relaxed text-[var(--studio-text-muted)]">
          Please complete the Format step first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
        Compile
      </h2>

      <p className="text-xs leading-relaxed text-[var(--studio-text-secondary)]">
        Render all zones into a final composition ({format.width} x{" "}
        {format.height})
      </p>

      <button
        onClick={handleRender}
        disabled={rendering || zones.length === 0}
        className={cn(
          "flex items-center justify-center gap-2 w-full rounded-[var(--studio-radius-md)] px-5 py-2.5 text-[13px] font-medium",
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
            <Play className="h-4 w-4" strokeWidth={1.5} />
            Render Preview
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 rounded-[var(--studio-radius-md)] border border-[var(--studio-error)]/30 bg-[var(--studio-error)]/8 px-3 py-2.5">
          <span className="text-xs text-[var(--studio-error)]">{error}</span>
        </div>
      )}

      {renderId && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[var(--studio-radius-lg)] border border-[var(--studio-border)] shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            <img
              src={`${API_BASE}/compose/render/${renderId}`}
              alt="Rendered composition"
              className="w-full h-auto"
            />
          </div>

          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2 w-full rounded-[var(--studio-radius-md)] bg-[var(--studio-accent)] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[var(--studio-accent-hover)]"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            Export
          </button>
        </div>
      )}
    </div>
  );
}

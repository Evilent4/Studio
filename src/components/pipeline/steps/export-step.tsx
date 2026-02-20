"use client";

import { Download, CheckCircle2 } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function ExportStep() {
  const { steps, updateStepStatus } = usePipelineStore();

  const renderId = (steps[6]?.output?.render_id as string) || null;
  const isCompleted = steps[7]?.status === "completed";

  const handleDownload = () => {
    if (!renderId) return;

    const link = document.createElement("a");
    link.href = `${API_BASE}/compose/render/${renderId}`;
    link.download = `studio-render-${renderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    updateStepStatus(7, "completed");
  };

  if (!renderId) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
          Export
        </h2>
        <p className="text-xs text-[var(--studio-text-muted)]">
          Please compile the composition first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
        Export
      </h2>

      {isCompleted && (
        <div className="flex items-center gap-2 rounded-md border border-green-800 bg-green-950/30 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span className="text-xs text-green-400">
            Export complete
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-[var(--studio-border)]">
        <img
          src={`${API_BASE}/compose/render/${renderId}`}
          alt="Final render"
          className="w-full h-auto"
        />
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center justify-center gap-2 w-full rounded-md bg-[var(--studio-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--studio-accent-hover)] transition-colors"
      >
        <Download className="h-4 w-4" />
        Download PNG
      </button>
    </div>
  );
}

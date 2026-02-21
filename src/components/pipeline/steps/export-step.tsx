"use client";

import { Download, CheckCircle2 } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { useToastStore } from "@/store/toast";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";

export function ExportStep() {
  const { steps, updateStepStatus } = usePipelineStore();
  const addToast = useToastStore((s) => s.addToast);

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
    addToast("success", "Download started");
  };

  if (!renderId) {
    return (
      <div className="flex flex-col gap-5 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
          Export
        </h2>
        <p className="text-xs leading-relaxed text-[var(--studio-text-muted)]">
          Please compile the composition first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
        Export
      </h2>

      {isCompleted && (
        <div className="flex items-center gap-2 rounded-[var(--studio-radius-md)] border border-[var(--studio-success)]/30 bg-[var(--studio-success-muted)] px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-[var(--studio-success)]" />
          <span className="text-xs font-medium text-[var(--studio-success)]">
            Export complete
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-[var(--studio-radius-lg)] border border-[var(--studio-border)] shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        <img
          src={`${API_BASE}/compose/render/${renderId}`}
          alt="Final render"
          className="w-full h-auto"
        />
      </div>

      <Button
        onClick={handleDownload}
        icon={<Download strokeWidth={1.5} />}
        size="lg"
        className="w-full"
      >
        Download PNG
      </Button>
    </div>
  );
}

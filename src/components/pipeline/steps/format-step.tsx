"use client";

import { useState } from "react";
import { FORMAT_PRESETS } from "@/types";
import { usePipelineStore } from "@/store/pipeline";
import { cn } from "@/lib/utils";

type FormatKey = keyof typeof FORMAT_PRESETS;

export function FormatStep() {
  const { updateStepOutput, updateStepStatus, setCurrentStep, steps } = usePipelineStore();
  const step = steps[1];
  const existingFormat = step?.output?.format as
    | { width: number; height: number; label: string }
    | undefined;

  const [selected, setSelected] = useState<FormatKey | "custom" | null>(() => {
    if (!existingFormat) return null;
    const match = (Object.entries(FORMAT_PRESETS) as [FormatKey, (typeof FORMAT_PRESETS)[FormatKey]][]).find(
      ([, preset]) =>
        preset.width === existingFormat.width && preset.height === existingFormat.height
    );
    return match ? match[0] : "custom";
  });

  const [customWidth, setCustomWidth] = useState(existingFormat?.width ?? 1080);
  const [customHeight, setCustomHeight] = useState(existingFormat?.height ?? 1080);

  const getFormat = () => {
    if (!selected) return null;
    if (selected === "custom") {
      return { width: customWidth, height: customHeight, label: `Custom ${customWidth}x${customHeight}` };
    }
    return FORMAT_PRESETS[selected];
  };

  const handleNext = () => {
    const format = getFormat();
    if (!format) return;
    updateStepOutput(1, { format });
    updateStepStatus(1, "completed");
    setCurrentStep(2);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
        Format
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(FORMAT_PRESETS) as [FormatKey, (typeof FORMAT_PRESETS)[FormatKey]][]).map(
          ([key, preset]) => (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border p-3 text-center transition-colors",
                selected === key
                  ? "border-[var(--studio-accent)] bg-[var(--studio-surface)]"
                  : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)]"
              )}
            >
              <span className="text-xs font-medium text-[var(--studio-text)]">
                {preset.label}
              </span>
              <span className="text-[10px] text-[var(--studio-text-muted)]">
                {preset.width} x {preset.height}
              </span>
            </button>
          )
        )}
      </div>

      {/* Custom option */}
      <button
        onClick={() => setSelected("custom")}
        className={cn(
          "flex items-center justify-center rounded-md border p-3 text-center transition-colors",
          selected === "custom"
            ? "border-[var(--studio-accent)] bg-[var(--studio-surface)]"
            : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)]"
        )}
      >
        <span className="text-xs font-medium text-[var(--studio-text)]">Custom Size</span>
      </button>

      {selected === "custom" && (
        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-medium text-[var(--studio-text-muted)]">Width</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              min={100}
              max={10000}
              className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2 py-1.5 text-xs text-[var(--studio-text)] focus:border-[var(--studio-border-hover)] focus:outline-none"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-medium text-[var(--studio-text-muted)]">Height</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              min={100}
              max={10000}
              className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2 py-1.5 text-xs text-[var(--studio-text)] focus:border-[var(--studio-border-hover)] focus:outline-none"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!selected}
        className="mt-2 w-full rounded-md bg-[var(--studio-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--studio-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

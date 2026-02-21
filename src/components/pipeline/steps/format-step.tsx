"use client";

import { useState } from "react";
import { Check, Ruler } from "lucide-react";
import { FORMAT_PRESETS } from "@/types";
import { usePipelineStore } from "@/store/pipeline";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-5 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
        Format
      </h2>

      <div className="grid grid-cols-2 gap-2.5">
        {(Object.entries(FORMAT_PRESETS) as [FormatKey, (typeof FORMAT_PRESETS)[FormatKey]][]).map(
          ([key, preset]) => {
            const isSelected = selected === key;
            /* Compute a tiny aspect-ratio thumbnail */
            const aspect = preset.width / preset.height;
            const thumbH = 32;
            const thumbW = Math.round(thumbH * Math.min(aspect, 1.6));
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={cn(
                  "group relative flex flex-col items-center gap-2.5 rounded-[var(--studio-radius-lg)] border p-4 text-center transition-all active:scale-[0.97]",
                  isSelected
                    ? "border-[var(--studio-accent)]/60 bg-[var(--studio-accent-muted)] shadow-[0_0_0_1px_var(--studio-accent)]/20"
                    : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-hover)]"
                )}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--studio-accent)]">
                    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                  </span>
                )}

                {/* Mini aspect ratio preview */}
                <div className="relative">
                  <div
                    className={cn(
                      "rounded-[3px] border transition-colors",
                      isSelected
                        ? "border-[var(--studio-accent)]/40 bg-[var(--studio-accent)]/15"
                        : "border-[var(--studio-border-hover)] bg-[var(--studio-surface)] group-hover:border-[var(--studio-border-active)]"
                    )}
                    style={{ width: thumbW, height: thumbH }}
                  />
                </div>

                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-[var(--studio-text)]">
                    {preset.label}
                  </span>
                  <span className="block text-[10px] tabular-nums text-[var(--studio-text-muted)]">
                    {preset.width} x {preset.height}
                  </span>
                </div>
              </button>
            );
          }
        )}
      </div>

      {/* Custom option */}
      <button
        onClick={() => setSelected("custom")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-[var(--studio-radius-lg)] border p-3.5 text-center transition-all active:scale-[0.97]",
          selected === "custom"
            ? "border-[var(--studio-accent)]/60 bg-[var(--studio-accent-muted)]"
            : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-hover)]"
        )}
      >
        <Ruler
          className={cn(
            "h-3.5 w-3.5",
            selected === "custom"
              ? "text-[var(--studio-accent)]"
              : "text-[var(--studio-text-muted)]"
          )}
          strokeWidth={1.5}
        />
        <span className="text-xs font-medium text-[var(--studio-text)]">Custom Size</span>
      </button>

      {selected === "custom" && (
        <div className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-[var(--studio-text-muted)]">
              Width
            </label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              min={100}
              max={10000}
              className="w-full rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2.5 py-2 text-xs tabular-nums text-[var(--studio-text)] focus:border-[var(--studio-accent)]/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-end pb-2 text-[var(--studio-text-muted)]">
            <span className="text-[10px]">x</span>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-wider text-[var(--studio-text-muted)]">
              Height
            </label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              min={100}
              max={10000}
              className="w-full rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2.5 py-2 text-xs tabular-nums text-[var(--studio-text)] focus:border-[var(--studio-accent)]/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}

      <Button onClick={handleNext} disabled={!selected} className="mt-1 w-full">
        Next
      </Button>
    </div>
  );
}

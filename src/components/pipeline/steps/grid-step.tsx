"use client";

import { useState } from "react";
import { GRID_PRESETS } from "@/types";
import { usePipelineStore } from "@/store/pipeline";
import { generateGrid } from "@/components/canvas/grid-editor";
import { cn } from "@/lib/utils";

type GridPresetKey = keyof typeof GRID_PRESETS;

export function GridStep() {
  const { steps, updateStepOutput, updateStepStatus, setCurrentStep, setZones } =
    usePipelineStore();

  const step1Output = steps[1]?.output;
  const format = step1Output?.format as
    | { width: number; height: number; label: string }
    | undefined;

  const existingPreset = (steps[2]?.output?.grid_preset as GridPresetKey) || null;
  const [selected, setSelected] = useState<GridPresetKey | null>(existingPreset);

  const handleSelect = (key: GridPresetKey) => {
    setSelected(key);
    if (format) {
      const zones = generateGrid(key, format.width, format.height);
      setZones(zones);
    }
  };

  const handleNext = () => {
    if (!selected) return;
    updateStepOutput(2, { grid_preset: selected });
    updateStepStatus(2, "completed");
    setCurrentStep(3);
  };

  if (!format) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
          Grid
        </h2>
        <p className="text-xs text-[var(--studio-text-muted)]">
          Please complete the Format step first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
        Grid Layout
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(GRID_PRESETS) as [GridPresetKey, (typeof GRID_PRESETS)[GridPresetKey]][]).map(
          ([key, preset]) => {
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                className={cn(
                  "flex flex-col items-center gap-2.5 rounded-[var(--studio-radius-lg)] border p-3.5 text-center",
                  isSelected
                    ? "border-[var(--studio-accent)]/60 bg-[var(--studio-accent-muted)] shadow-[0_0_0_1px_var(--studio-accent)]/20"
                    : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-hover)]"
                )}
              >
                <GridPreview presetKey={key} isSelected={isSelected} />
                <span className="text-xs font-medium text-[var(--studio-text)]">
                  {preset.label}
                </span>
              </button>
            );
          }
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={!selected}
        className="mt-1 w-full rounded-[var(--studio-radius-md)] bg-[var(--studio-accent)] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[var(--studio-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

/** Small visual preview of a grid preset */
function GridPreview({ presetKey, isSelected }: { presetKey: GridPresetKey; isSelected: boolean }) {
  const blockClass = cn(
    "rounded-[2px]",
    isSelected
      ? "bg-[var(--studio-accent)]/30"
      : "bg-[var(--studio-border-hover)]"
  );

  const previewMap: Record<GridPresetKey, React.ReactNode> = {
    "2h": (
      <div className="flex h-10 w-14 flex-col gap-0.5">
        <div className={cn("flex-1", blockClass)} />
        <div className={cn("flex-1", blockClass)} />
      </div>
    ),
    "2v": (
      <div className="flex h-10 w-14 flex-row gap-0.5">
        <div className={cn("flex-1", blockClass)} />
        <div className={cn("flex-1", blockClass)} />
      </div>
    ),
    "3r": (
      <div className="flex h-10 w-14 flex-col gap-0.5">
        <div className={cn("flex-1", blockClass)} />
        <div className={cn("flex-1", blockClass)} />
        <div className={cn("flex-1", blockClass)} />
      </div>
    ),
    "4q": (
      <div className="grid h-10 w-14 grid-cols-2 grid-rows-2 gap-0.5">
        <div className={blockClass} />
        <div className={blockClass} />
        <div className={blockClass} />
        <div className={blockClass} />
      </div>
    ),
    "asym-lr": (
      <div className="flex h-10 w-14 flex-row gap-0.5">
        <div className={cn("basis-3/5", blockClass)} />
        <div className={cn("basis-2/5", blockClass)} />
      </div>
    ),
    "asym-tb": (
      <div className="flex h-10 w-14 flex-col gap-0.5">
        <div className={cn("basis-[70%]", blockClass)} />
        <div className={cn("basis-[30%]", blockClass)} />
      </div>
    ),
  };

  return previewMap[presetKey] ?? null;
}

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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
          Grid
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
        Grid Layout
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(GRID_PRESETS) as [GridPresetKey, (typeof GRID_PRESETS)[GridPresetKey]][]).map(
          ([key, preset]) => (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border p-3 text-center transition-colors",
                selected === key
                  ? "border-[var(--studio-accent)] bg-[var(--studio-surface)]"
                  : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)]"
              )}
            >
              <GridPreview presetKey={key} />
              <span className="text-xs font-medium text-[var(--studio-text)]">
                {preset.label}
              </span>
            </button>
          )
        )}
      </div>

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

/** Small visual preview of a grid preset */
function GridPreview({ presetKey }: { presetKey: GridPresetKey }) {
  const previewMap: Record<GridPresetKey, React.ReactNode> = {
    "2h": (
      <div className="flex h-8 w-12 flex-col gap-0.5">
        <div className="flex-1 rounded-sm bg-[var(--studio-text-muted)]" />
        <div className="flex-1 rounded-sm bg-[var(--studio-text-muted)]" />
      </div>
    ),
    "2v": (
      <div className="flex h-8 w-12 flex-row gap-0.5">
        <div className="flex-1 rounded-sm bg-[var(--studio-text-muted)]" />
        <div className="flex-1 rounded-sm bg-[var(--studio-text-muted)]" />
      </div>
    ),
    "3r": (
      <div className="flex h-8 w-12 flex-col gap-0.5">
        <div className="flex-1 rounded-sm bg-[var(--studio-text-muted)]" />
        <div className="flex-1 rounded-sm bg-[var(--studio-text-muted)]" />
        <div className="flex-1 rounded-sm bg-[var(--studio-text-muted)]" />
      </div>
    ),
    "4q": (
      <div className="grid h-8 w-12 grid-cols-2 grid-rows-2 gap-0.5">
        <div className="rounded-sm bg-[var(--studio-text-muted)]" />
        <div className="rounded-sm bg-[var(--studio-text-muted)]" />
        <div className="rounded-sm bg-[var(--studio-text-muted)]" />
        <div className="rounded-sm bg-[var(--studio-text-muted)]" />
      </div>
    ),
    "asym-lr": (
      <div className="flex h-8 w-12 flex-row gap-0.5">
        <div className="basis-3/5 rounded-sm bg-[var(--studio-text-muted)]" />
        <div className="basis-2/5 rounded-sm bg-[var(--studio-text-muted)]" />
      </div>
    ),
    "asym-tb": (
      <div className="flex h-8 w-12 flex-col gap-0.5">
        <div className="basis-[70%] rounded-sm bg-[var(--studio-text-muted)]" />
        <div className="basis-[30%] rounded-sm bg-[var(--studio-text-muted)]" />
      </div>
    ),
  };

  return previewMap[presetKey] ?? null;
}

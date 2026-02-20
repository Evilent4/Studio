"use client";

import { ImageIcon, Type, Layers, Grid3X3, Square, X } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { cn } from "@/lib/utils";
import type { ZoneRole, ZoneContent } from "@/types";

const ROLE_OPTIONS: { role: ZoneRole; label: string; icon: React.ElementType }[] = [
  { role: "image", label: "Image", icon: ImageIcon },
  { role: "text", label: "Text", icon: Type },
  { role: "texture", label: "Texture", icon: Layers },
  { role: "pattern", label: "Pattern", icon: Grid3X3 },
  { role: "solid", label: "Solid", icon: Square },
  { role: "empty", label: "Empty", icon: X },
];

function defaultContentForRole(role: ZoneRole): ZoneContent {
  switch (role) {
    case "solid":
      return { type: "solid", colour: "#1a1a1a" };
    case "text":
      return {
        type: "text",
        text: "",
        font: "Inter",
        size: 24,
        colour: "#e8e8e8",
        weight: 400,
        alignment: "center",
      };
    case "image":
      return {
        type: "image",
        asset_id: "",
        crop_rect: { x: 0, y: 0, w: 1, h: 1 },
        filters: {},
      };
    case "texture":
      return { type: "texture", processor_id: "", params: {} };
    case "pattern":
      return { type: "pattern", processor_id: "", params: {} };
    case "empty":
    default:
      return { type: "empty" };
  }
}

export function ZoneAssignmentStep() {
  const {
    zones,
    selectedZoneId,
    updateZone,
    selectZone,
    updateStepStatus,
    setCurrentStep,
  } = usePipelineStore();

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  const allAssigned = zones.length > 0 && zones.every((z) => z.role !== "empty");

  const handleRoleSelect = (role: ZoneRole) => {
    if (!selectedZoneId) return;
    updateZone(selectedZoneId, {
      role,
      content: defaultContentForRole(role),
    });
  };

  const handleNext = () => {
    if (!allAssigned) return;
    updateStepStatus(3, "completed");
    updateStepStatus(4, "active");
    setCurrentStep(4);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
        Zone Assignment
      </h2>

      <p className="text-xs text-[var(--studio-text-muted)]">
        Click a zone on the canvas, then choose its role
      </p>

      {/* Selected zone role picker */}
      {selectedZone && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-[var(--studio-text-secondary)]">
            Zone {selectedZone.zone_order + 1} — currently:{" "}
            <span className="text-[var(--studio-text)]">{selectedZone.role}</span>
          </span>

          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map(({ role, label, icon: Icon }) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border p-2.5 text-center transition-colors",
                  selectedZone.role === role
                    ? "border-[var(--studio-accent)] bg-[var(--studio-surface)]"
                    : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)]"
                )}
              >
                <Icon className="h-4 w-4 text-[var(--studio-text-secondary)]" />
                <span className="text-[10px] font-medium text-[var(--studio-text)]">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone list */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--studio-text-secondary)]">
          All Zones
        </label>
        <div className="flex flex-col gap-1">
          {zones.map((zone) => {
            const roleOption = ROLE_OPTIONS.find((r) => r.role === zone.role);
            const Icon = roleOption?.icon ?? X;
            return (
              <button
                key={zone.id}
                onClick={() => selectZone(zone.id)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors",
                  zone.id === selectedZoneId
                    ? "border-[var(--studio-accent)] bg-[var(--studio-surface)]"
                    : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)]"
                )}
              >
                <Icon className="h-3.5 w-3.5 text-[var(--studio-text-muted)]" />
                <span className="text-xs font-medium text-[var(--studio-text)]">
                  Zone {zone.zone_order + 1}
                </span>
                <span className="ml-auto text-[10px] text-[var(--studio-text-muted)]">
                  {zone.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={!allAssigned}
        className="mt-2 w-full rounded-md bg-[var(--studio-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--studio-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

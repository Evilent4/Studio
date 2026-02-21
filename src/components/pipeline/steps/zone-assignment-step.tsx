"use client";

import { ImageIcon, Type, Layers, Grid3X3, Square, X } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ZoneRole, ZoneContent } from "@/types";

const ROLE_OPTIONS: { role: ZoneRole; label: string; icon: React.ElementType; description: string }[] = [
  { role: "image", label: "Image", icon: ImageIcon, description: "Photo or graphic" },
  { role: "text", label: "Text", icon: Type, description: "Typography" },
  { role: "texture", label: "Texture", icon: Layers, description: "Generated texture" },
  { role: "pattern", label: "Pattern", icon: Grid3X3, description: "Repeating pattern" },
  { role: "solid", label: "Solid", icon: Square, description: "Flat colour fill" },
  { role: "empty", label: "Empty", icon: X, description: "No content" },
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
    <div className="flex flex-col gap-5 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
        Zone Assignment
      </h2>

      <p className="text-xs leading-relaxed text-[var(--studio-text-muted)]">
        Click a zone on the canvas, then choose its role
      </p>

      {/* Selected zone role picker */}
      {selectedZone && (
        <div className="space-y-2.5">
          <span className="text-xs font-medium text-[var(--studio-text-secondary)]">
            Zone {selectedZone.zone_order + 1} — currently:{" "}
            <span className="text-[var(--studio-text)]">{selectedZone.role}</span>
          </span>

          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map(({ role, label, icon: Icon, description }) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[var(--studio-radius-lg)] border p-3 text-center transition-all active:scale-[0.95]",
                  selectedZone.role === role
                    ? "border-[var(--studio-accent)]/60 bg-[var(--studio-accent-muted)] shadow-[0_0_0_1px_var(--studio-accent)]/20"
                    : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-hover)]"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    selectedZone.role === role
                      ? "text-[var(--studio-accent)]"
                      : "text-[var(--studio-text-secondary)]"
                  )}
                  strokeWidth={1.5}
                />
                <span className="text-[10px] font-medium text-[var(--studio-text)]">
                  {label}
                </span>
                <span className="text-[8px] leading-tight text-[var(--studio-text-muted)]">
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone list */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
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
                  "flex items-center gap-2.5 rounded-[var(--studio-radius-lg)] border px-3 py-2.5 text-left transition-all active:scale-[0.97]",
                  zone.id === selectedZoneId
                    ? "border-[var(--studio-accent)]/60 bg-[var(--studio-accent-muted)]"
                    : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-hover)]"
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    zone.id === selectedZoneId
                      ? "text-[var(--studio-accent)]"
                      : "text-[var(--studio-text-muted)]"
                  )}
                  strokeWidth={1.5}
                />
                <span className="text-xs font-medium text-[var(--studio-text)]">
                  Zone {zone.zone_order + 1}
                </span>
                <span
                  className={cn(
                    "ml-auto rounded-full px-1.5 py-0.5 text-[10px]",
                    zone.role === "empty"
                      ? "bg-[var(--studio-surface)] text-[var(--studio-text-muted)]"
                      : "bg-[var(--studio-success-muted)] text-[var(--studio-success)]"
                  )}
                >
                  {zone.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={handleNext} disabled={!allAssigned} className="mt-1 w-full">
        Next
      </Button>
    </div>
  );
}

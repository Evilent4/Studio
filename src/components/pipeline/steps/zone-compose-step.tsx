"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  ImageIcon,
  Replace,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Type,
} from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { uploadAsset, assetFileUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Zone, ZoneContent } from "@/types";

/* ------------------------------------------------------------------ */
/*  Per-role editors                                                    */
/* ------------------------------------------------------------------ */

function ImageEditor({ zone }: { zone: Zone }) {
  const updateZone = usePipelineStore((s) => s.updateZone);
  const [uploading, setUploading] = useState(false);

  const content = zone.content as Extract<ZoneContent, { type: "image" }>;
  const hasAsset = content.asset_id !== "";

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      try {
        const asset = await uploadAsset(acceptedFiles[0]);
        updateZone(zone.id, {
          content: { ...content, asset_id: asset.id },
        });
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    [zone.id, content, updateZone]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: false,
  });

  if (hasAsset) {
    return (
      <div className="space-y-2.5">
        <img
          src={assetFileUrl(content.asset_id)}
          alt="Zone asset"
          className="w-full rounded-[var(--studio-radius-lg)] border border-[var(--studio-border)] object-cover"
          style={{ maxHeight: 160 }}
        />
        <button
          {...getRootProps()}
          className="flex w-full items-center justify-center gap-1.5 rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2 text-xs font-medium text-[var(--studio-text-secondary)] hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-hover)] active:scale-[0.97] transition-all"
        >
          <input {...getInputProps()} />
          <Replace className="h-3.5 w-3.5" strokeWidth={1.5} />
          Replace
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center gap-2.5 rounded-[var(--studio-radius-lg)] border border-dashed bg-[var(--studio-surface-2)] p-7 cursor-pointer transition-colors",
        isDragActive
          ? "border-[var(--studio-accent)] bg-[var(--studio-accent-muted)]"
          : "border-[var(--studio-border)] hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-hover)]"
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <span className="text-xs text-[var(--studio-text-muted)]">Uploading...</span>
      ) : (
        <>
          <Upload className="h-5 w-5 text-[var(--studio-text-muted)]" strokeWidth={1.5} />
          <span className="text-xs text-[var(--studio-text-muted)]">
            Drop an image or click to browse
          </span>
        </>
      )}
    </div>
  );
}

const FONT_WEIGHT_OPTIONS = [
  { value: 300, label: "Light" },
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "Semi" },
  { value: 700, label: "Bold" },
  { value: 900, label: "Black" },
];

function TextEditor({ zone }: { zone: Zone }) {
  const updateZone = usePipelineStore((s) => s.updateZone);
  const content = zone.content as Extract<ZoneContent, { type: "text" }>;

  const update = (patch: Partial<typeof content>) => {
    updateZone(zone.id, { content: { ...content, ...patch } });
  };

  return (
    <div className="space-y-3">
      {/* Text input area */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-medium uppercase tracking-wider text-[var(--studio-text-muted)]">
          Text
        </label>
        <textarea
          value={content.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder="Enter text content..."
          rows={4}
          className="w-full rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2.5 text-sm leading-relaxed text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:border-[var(--studio-accent)]/50 focus:outline-none resize-none transition-colors"
        />
      </div>

      {/* Formatting toolbar */}
      <div className="rounded-[var(--studio-radius-lg)] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-2.5 space-y-2.5">
        {/* Row 1: Alignment and Weight */}
        <div className="flex items-center gap-2">
          {/* Alignment toggle group */}
          <div className="flex rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] overflow-hidden">
            {(
              [
                { value: "left", icon: AlignLeft },
                { value: "center", icon: AlignCenter },
                { value: "right", icon: AlignRight },
              ] as const
            ).map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ alignment: value })}
                className={cn(
                  "flex h-7 w-8 items-center justify-center transition-colors",
                  content.alignment === value
                    ? "bg-[var(--studio-accent-muted)] text-[var(--studio-accent)]"
                    : "bg-[var(--studio-surface-2)] text-[var(--studio-text-muted)] hover:text-[var(--studio-text-secondary)]"
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            ))}
          </div>

          {/* Weight select */}
          <select
            value={content.weight}
            onChange={(e) => update({ weight: Number(e.target.value) })}
            className="flex-1 rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2 py-1.5 text-[11px] text-[var(--studio-text)] focus:border-[var(--studio-accent)]/50 focus:outline-none"
          >
            {FONT_WEIGHT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.value})
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: Size, Font, Colour */}
        <div className="flex gap-2">
          {/* Font size */}
          <div className="w-16 space-y-1">
            <label className="text-[9px] font-medium uppercase tracking-wider text-[var(--studio-text-muted)]">
              Size
            </label>
            <input
              type="number"
              value={content.size}
              onChange={(e) => update({ size: Number(e.target.value) })}
              min={8}
              max={200}
              className="w-full rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2 py-1.5 text-[11px] text-[var(--studio-text)] focus:border-[var(--studio-accent)]/50 focus:outline-none"
            />
          </div>

          {/* Font family */}
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-medium uppercase tracking-wider text-[var(--studio-text-muted)]">
              Font
            </label>
            <input
              type="text"
              value={content.font}
              onChange={(e) => update({ font: e.target.value })}
              placeholder="Inter"
              className="w-full rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2 py-1.5 text-[11px] text-[var(--studio-text)] focus:border-[var(--studio-accent)]/50 focus:outline-none"
            />
          </div>

          {/* Colour */}
          <div className="space-y-1">
            <label className="text-[9px] font-medium uppercase tracking-wider text-[var(--studio-text-muted)]">
              Colour
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={content.colour}
                onChange={(e) => update({ colour: e.target.value })}
                className="h-[26px] w-8 cursor-pointer rounded-[var(--studio-radius-sm)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-0.5"
              />
              <span className="text-[9px] font-mono text-[var(--studio-text-muted)]">
                {content.colour}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live preview hint */}
      <div className="rounded-[var(--studio-radius-md)] bg-[var(--studio-surface-2)] px-3 py-2 border border-[var(--studio-border)]">
        <p
          className="text-center truncate"
          style={{
            fontFamily: content.font || "Inter",
            fontWeight: content.weight,
            fontSize: Math.min(content.size, 28),
            color: content.colour,
            textAlign: content.alignment,
          }}
        >
          {content.text || "Preview"}
        </p>
      </div>
    </div>
  );
}

function SolidEditor({ zone }: { zone: Zone }) {
  const updateZone = usePipelineStore((s) => s.updateZone);
  const content = zone.content as Extract<ZoneContent, { type: "solid" }>;

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-medium uppercase tracking-wider text-[var(--studio-text-muted)]">
        Fill Colour
      </label>
      <div className="flex items-center gap-2.5 rounded-[var(--studio-radius-lg)] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-2.5">
        <input
          type="color"
          value={content.colour}
          onChange={(e) =>
            updateZone(zone.id, {
              content: { ...content, colour: e.target.value },
            })
          }
          className="h-8 w-10 cursor-pointer rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-0.5"
        />
        <span className="text-xs font-mono text-[var(--studio-text-muted)]">
          {content.colour}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main compose step                                                   */
/* ------------------------------------------------------------------ */

export function ZoneComposeStep() {
  const {
    zones,
    selectedZoneId,
    selectZone,
    updateStepStatus,
    setCurrentStep,
    currentStep,
  } = usePipelineStore();

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  const handleNext = () => {
    updateStepStatus(currentStep, "completed");
    const nextStep = currentStep + 1;
    updateStepStatus(nextStep, "active");
    setCurrentStep(nextStep);
  };

  const renderEditor = () => {
    if (!selectedZone) {
      return (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--studio-surface-2)] ring-1 ring-[var(--studio-border)]">
            <ImageIcon className="h-4 w-4 text-[var(--studio-text-muted)]" strokeWidth={1.5} />
          </div>
          <p className="text-xs leading-relaxed text-[var(--studio-text-muted)]">
            Select a zone on the canvas or from the list below to edit its content.
          </p>
        </div>
      );
    }

    switch (selectedZone.content.type) {
      case "image":
        return <ImageEditor zone={selectedZone} />;
      case "text":
        return <TextEditor zone={selectedZone} />;
      case "solid":
        return <SolidEditor zone={selectedZone} />;
      case "texture":
      case "pattern":
        return (
          <p className="text-xs leading-relaxed text-[var(--studio-text-muted)]">
            {selectedZone.content.type} controls coming soon.
          </p>
        );
      case "empty":
        return (
          <p className="text-xs leading-relaxed text-[var(--studio-text-muted)]">
            This zone has no role assigned. Go back to Zone Assignment to set one.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
        Zone Composition
      </h2>

      {/* Zone selector list */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--studio-text-secondary)]">
          Zones
        </label>
        <div className="flex flex-col gap-1">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => selectZone(zone.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--studio-radius-lg)] border px-3 py-2.5 text-left active:scale-[0.97] transition-all",
                zone.id === selectedZoneId
                  ? "border-[var(--studio-accent)]/60 bg-[var(--studio-accent-muted)]"
                  : "border-[var(--studio-border)] bg-[var(--studio-surface-2)] hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-hover)]"
              )}
            >
              {zone.content.type === "image" && (
                <ImageIcon
                  className={cn(
                    "h-3.5 w-3.5",
                    zone.id === selectedZoneId
                      ? "text-[var(--studio-accent)]"
                      : "text-[var(--studio-text-muted)]"
                  )}
                  strokeWidth={1.5}
                />
              )}
              {zone.content.type === "text" && (
                <Type
                  className={cn(
                    "h-3.5 w-3.5",
                    zone.id === selectedZoneId
                      ? "text-[var(--studio-accent)]"
                      : "text-[var(--studio-text-muted)]"
                  )}
                  strokeWidth={1.5}
                />
              )}
              {zone.content.type !== "image" && zone.content.type !== "text" && (
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-[2px] border",
                    zone.id === selectedZoneId
                      ? "border-[var(--studio-accent)]/50 bg-[var(--studio-accent)]/20"
                      : "border-[var(--studio-border-hover)] bg-[var(--studio-surface)]"
                  )}
                />
              )}
              <span className="text-xs font-medium text-[var(--studio-text)]">
                Zone {zone.zone_order + 1}
              </span>
              <span className="ml-auto text-[10px] text-[var(--studio-text-muted)]">
                {zone.role}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Per-role editor */}
      <div className="space-y-2.5">
        {selectedZone && (
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
            Zone {selectedZone.zone_order + 1} — {selectedZone.role}
          </label>
        )}
        {renderEditor()}
      </div>

      <Button onClick={handleNext} className="mt-1 w-full">
        Next
      </Button>
    </div>
  );
}

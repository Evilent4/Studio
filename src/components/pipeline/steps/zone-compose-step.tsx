"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon, Replace } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { uploadAsset, assetFileUrl } from "@/lib/api";
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
      <div className="space-y-2">
        <img
          src={assetFileUrl(content.asset_id)}
          alt="Zone asset"
          className="w-full rounded-md border border-[var(--studio-border)] object-cover"
          style={{ maxHeight: 160 }}
        />
        <button
          {...getRootProps()}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2 text-xs font-medium text-[var(--studio-text-secondary)] hover:border-[var(--studio-border-hover)] transition-colors"
        >
          <input {...getInputProps()} />
          <Replace className="h-3.5 w-3.5" />
          Replace
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-6 cursor-pointer transition-colors",
        isDragActive && "border-[var(--studio-accent)] bg-[var(--studio-surface)]"
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <span className="text-xs text-[var(--studio-text-muted)]">Uploading...</span>
      ) : (
        <>
          <Upload className="h-5 w-5 text-[var(--studio-text-muted)]" />
          <span className="text-xs text-[var(--studio-text-muted)]">
            Drop an image or click to browse
          </span>
        </>
      )}
    </div>
  );
}

function TextEditor({ zone }: { zone: Zone }) {
  const updateZone = usePipelineStore((s) => s.updateZone);
  const content = zone.content as Extract<ZoneContent, { type: "text" }>;

  const update = (patch: Partial<typeof content>) => {
    updateZone(zone.id, { content: { ...content, ...patch } });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-[var(--studio-text-muted)]">Text</label>
        <textarea
          value={content.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder="Enter text content..."
          rows={4}
          className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2 text-sm text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:border-[var(--studio-border-hover)] focus:outline-none resize-none"
        />
      </div>

      <div className="flex gap-2">
        {/* Font size */}
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-medium text-[var(--studio-text-muted)]">Size</label>
          <input
            type="number"
            value={content.size}
            onChange={(e) => update({ size: Number(e.target.value) })}
            min={8}
            max={200}
            className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2 py-1.5 text-xs text-[var(--studio-text)] focus:border-[var(--studio-border-hover)] focus:outline-none"
          />
        </div>

        {/* Colour */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-[var(--studio-text-muted)]">Colour</label>
          <input
            type="color"
            value={content.colour}
            onChange={(e) => update({ colour: e.target.value })}
            className="h-[30px] w-10 cursor-pointer rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-0.5"
          />
        </div>

        {/* Alignment */}
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-medium text-[var(--studio-text-muted)]">Align</label>
          <select
            value={content.alignment}
            onChange={(e) =>
              update({ alignment: e.target.value as "left" | "center" | "right" })
            }
            className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-2 py-1.5 text-xs text-[var(--studio-text)] focus:border-[var(--studio-border-hover)] focus:outline-none"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function SolidEditor({ zone }: { zone: Zone }) {
  const updateZone = usePipelineStore((s) => s.updateZone);
  const content = zone.content as Extract<ZoneContent, { type: "solid" }>;

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-[var(--studio-text-muted)]">Fill Colour</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={content.colour}
          onChange={(e) =>
            updateZone(zone.id, {
              content: { ...content, colour: e.target.value },
            })
          }
          className="h-8 w-10 cursor-pointer rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] p-0.5"
        />
        <span className="text-xs text-[var(--studio-text-muted)] font-mono">
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
  } = usePipelineStore();

  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  const handleNext = () => {
    updateStepStatus(4, "completed");
    updateStepStatus(5, "active");
    setCurrentStep(5);
  };

  const renderEditor = () => {
    if (!selectedZone) {
      return (
        <p className="text-xs text-[var(--studio-text-muted)]">
          Select a zone to edit its content.
        </p>
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
          <p className="text-xs text-[var(--studio-text-muted)]">
            {selectedZone.content.type} controls coming soon.
          </p>
        );
      case "empty":
        return (
          <p className="text-xs text-[var(--studio-text-muted)]">
            This zone has no role assigned. Go back to Zone Assignment to set one.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
        Zone Composition
      </h2>

      {/* Zone selector list */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--studio-text-secondary)]">
          Zones
        </label>
        <div className="flex flex-col gap-1">
          {zones.map((zone) => (
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
              {zone.content.type === "image" && (
                <ImageIcon className="h-3.5 w-3.5 text-[var(--studio-text-muted)]" />
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
      <div className="space-y-2">
        {selectedZone && (
          <span className="text-xs font-medium text-[var(--studio-text-secondary)]">
            Zone {selectedZone.zone_order + 1} — {selectedZone.role}
          </span>
        )}
        {renderEditor()}
      </div>

      <button
        onClick={handleNext}
        className="mt-2 w-full rounded-md bg-[var(--studio-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--studio-accent-hover)] transition-colors"
      >
        Next
      </button>
    </div>
  );
}

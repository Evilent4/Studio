"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon } from "lucide-react";
import { usePipelineStore } from "@/store/pipeline";
import { uploadAsset } from "@/lib/api";
import { cn } from "@/lib/utils";

export function BriefStep() {
  const { updateStepOutput, updateStepStatus, setCurrentStep, steps } = usePipelineStore();
  const step = steps[0];
  const existingBrief = (step?.output?.brief as string) || "";
  const existingRefs = (step?.output?.reference_ids as string[]) || [];

  const [brief, setBrief] = useState(existingBrief);
  const [referenceIds, setReferenceIds] = useState<string[]>(existingRefs);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      try {
        const ids: string[] = [];
        for (const file of acceptedFiles) {
          const asset = await uploadAsset(file);
          ids.push(asset.id);
        }
        setReferenceIds((prev) => [...prev, ...ids]);
      } catch (err) {
        console.error("Upload failed:", err);
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: true,
  });

  const handleNext = () => {
    updateStepOutput(0, { brief, reference_ids: referenceIds });
    updateStepStatus(0, "completed");
    setCurrentStep(1);
  };

  return (
    <div className="flex flex-col gap-5 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--studio-text-muted)]">
        Brief
      </h2>

      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--studio-text-secondary)]">
          Description
        </label>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe the creative direction, mood, and purpose..."
          rows={5}
          className="w-full rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2.5 text-sm leading-relaxed text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:border-[var(--studio-accent)]/40 focus:outline-none resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--studio-text-secondary)]">
          Reference Images
        </label>
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center gap-2.5 rounded-[var(--studio-radius-lg)] border border-dashed bg-[var(--studio-surface-2)] p-7 cursor-pointer",
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
                Drop images here or click to browse
              </span>
            </>
          )}
        </div>
        {referenceIds.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--studio-text-secondary)]">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{referenceIds.length} reference{referenceIds.length !== 1 ? "s" : ""} uploaded</span>
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        className="mt-1 w-full rounded-[var(--studio-radius-md)] bg-[var(--studio-accent)] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[var(--studio-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

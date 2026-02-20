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
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--studio-text-secondary)]">
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
          className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2 text-sm text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:border-[var(--studio-border-hover)] focus:outline-none resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--studio-text-secondary)]">
          Reference Images
        </label>
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
        className="mt-2 w-full rounded-md bg-[var(--studio-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--studio-accent-hover)] transition-colors"
      >
        Next
      </button>
    </div>
  );
}

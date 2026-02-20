"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Palette, Type, Loader2, Check, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { apiGet, apiPost, uploadAsset, assetFileUrl } from "@/lib/api";
import type { StyleProfile } from "@/types";

interface ProfileListItem extends StyleProfile {
  updated_at: string;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfiles = useCallback(async () => {
    try {
      const data = await apiGet<ProfileListItem[]>("/profiles/");
      setProfiles(data);
    } catch (err) {
      console.error("Failed to load profiles:", err);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const onDrop = useCallback((accepted: File[]) => {
    const imageFiles = accepted.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imageFiles]);
    const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] },
    multiple: true,
  });

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || files.length === 0) return;

    setCreating(true);
    setError(null);

    try {
      // Upload all images as assets first
      const uploadResults = await Promise.all(files.map((f) => uploadAsset(f)));
      const imagePaths = uploadResults.map(
        (r: { metadata?: { path?: string }; id: string }) =>
          r.metadata?.path || assetFileUrl(r.id)
      );

      // Create the profile
      const profile = await apiPost<{ id: string }>("/profiles/", {
        name: name.trim(),
        source_image_paths: imagePaths,
      });

      setCreating(false);
      setAnalyzing(true);

      // Run analysis
      await apiPost(`/profiles/${profile.id}/analyze`, {});

      // Reset form
      previews.forEach((p) => URL.revokeObjectURL(p));
      setName("");
      setFiles([]);
      setPreviews([]);
      setAnalyzing(false);
      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setCreating(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* New Profile Form */}
          <section>
            <h1 className="text-2xl font-semibold tracking-tight">Style Profiles</h1>
            <p className="mt-1 text-sm text-[var(--studio-text-secondary)]">
              Upload reference images to extract your visual style.
            </p>

            <form onSubmit={handleCreateAndAnalyze} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="profile-name" className="text-sm font-medium">
                  Profile Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Brutalist Dark, Warm Editorial..."
                  required
                  className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2 text-sm text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:border-[var(--studio-border-hover)] focus:outline-none"
                />
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${
                  isDragActive
                    ? "border-[var(--studio-accent)] bg-[var(--studio-accent)]/5"
                    : "border-[var(--studio-border)] hover:border-[var(--studio-border-hover)]"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 text-[var(--studio-text-muted)]" />
                <p className="text-sm text-[var(--studio-text-secondary)]">
                  {isDragActive
                    ? "Drop images here..."
                    : "Drag reference images here, or click to browse"}
                </p>
                <p className="text-xs text-[var(--studio-text-muted)]">
                  JPG, PNG, WebP, GIF
                </p>
              </div>

              {/* Preview thumbnails */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {previews.map((src, i) => (
                    <div key={i} className="group relative">
                      <img
                        src={src}
                        alt={`Reference ${i + 1}`}
                        className="h-20 w-20 rounded-md border border-[var(--studio-border)] object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-[var(--studio-error)] p-0.5 text-white group-hover:block"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <p className="text-sm text-[var(--studio-error)]">{error}</p>
              )}

              <button
                type="submit"
                disabled={creating || analyzing || !name.trim() || files.length === 0}
                className="flex items-center gap-2 rounded-md bg-[var(--studio-accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--studio-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing style...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4" />
                    Create &amp; Analyze
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Existing Profiles */}
          {profiles.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">
                Existing Profiles
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function ProfileCard({ profile }: { profile: ProfileListItem }) {
  const hasColours =
    profile.colours &&
    (profile.colours.primary?.length > 0 ||
      profile.colours.accent?.length > 0 ||
      profile.colours.background?.length > 0);

  const hasTypography =
    profile.typography && profile.typography.headline?.family;

  return (
    <div className="rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface)] p-4 transition-colors hover:border-[var(--studio-border-hover)]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{profile.name}</h3>
          <p className="mt-0.5 text-xs text-[var(--studio-text-muted)]">
            {profile.source_images?.length || 0} source image
            {(profile.source_images?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {hasColours && (
          <Check className="h-4 w-4 text-[var(--studio-success)]" />
        )}
      </div>

      {/* Colour swatches */}
      {hasColours && (
        <div className="mt-3 space-y-2">
          <ColourRow label="Primary" colours={profile.colours.primary} />
          <ColourRow label="Accent" colours={profile.colours.accent} />
          <ColourRow label="Background" colours={profile.colours.background} />
          <ColourRow label="Text" colours={profile.colours.text} />
        </div>
      )}

      {/* Typography preview */}
      {hasTypography && (
        <div className="mt-3 flex items-center gap-3 text-xs text-[var(--studio-text-secondary)]">
          <Type className="h-3.5 w-3.5" />
          <span>
            {profile.typography.headline.family} /{" "}
            {profile.typography.body.family}
          </span>
        </div>
      )}

      {/* Mood indicators */}
      {profile.mood && profile.mood.warmth !== undefined && (
        <div className="mt-3 grid grid-cols-4 gap-1">
          <MoodBar label="Warm" value={profile.mood.warmth} />
          <MoodBar label="Dense" value={profile.mood.density} />
          <MoodBar label="Bright" value={profile.mood.brightness} />
          <MoodBar label="Formal" value={profile.mood.formality} />
        </div>
      )}
    </div>
  );
}

function ColourRow({ label, colours }: { label: string; colours?: string[] }) {
  if (!colours || colours.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-xs text-[var(--studio-text-muted)]">
        {label}
      </span>
      <div className="flex gap-1">
        {colours.map((hex, i) => (
          <div
            key={i}
            className="h-5 w-5 rounded-sm border border-[var(--studio-border)]"
            style={{ backgroundColor: hex }}
            title={hex}
          />
        ))}
      </div>
    </div>
  );
}

function MoodBar({ label, value }: { label: string; value: number }) {
  // value ranges from -1 to 1, normalize to 0-100%
  const pct = Math.round(((value + 1) / 2) * 100);
  return (
    <div className="space-y-0.5">
      <span className="text-[10px] text-[var(--studio-text-muted)]">
        {label}
      </span>
      <div className="h-1 rounded-full bg-[var(--studio-surface-2)]">
        <div
          className="h-1 rounded-full bg-[var(--studio-accent)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

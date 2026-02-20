"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { apiPost } from "@/lib/api";
import type { PipelineType, Project } from "@/types";

function NewProjectForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pipelineType = (searchParams.get("type") || "static") as PipelineType;
  const [name, setName] = useState("");
  const [brief, setBrief] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const project = await apiPost<Project>("/projects/", {
        name: name.trim(),
        brief: brief.trim(),
        pipeline_type: pipelineType,
      });
      router.push(`/project/${project.id}`);
    } catch (err) {
      console.error("Failed to create project:", err);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="text-2xl font-semibold tracking-tight">New Project</h1>
      <p className="text-sm text-[var(--studio-text-secondary)]">
        Type: {pipelineType.replace("_", " ")}
      </p>
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Project Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My project"
          required
          className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2 text-sm text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:border-[var(--studio-border-hover)] focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="brief" className="text-sm font-medium">
          Brief
        </label>
        <textarea
          id="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe the creative direction..."
          rows={4}
          className="w-full rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2 text-sm text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:border-[var(--studio-border-hover)] focus:outline-none resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="rounded-md bg-[var(--studio-accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--studio-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}

export default function NewProjectPage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center">
            <span className="text-sm text-[var(--studio-text-muted)]">Loading...</span>
          </div>
        }
      >
        <NewProjectForm />
      </Suspense>
    </div>
  );
}

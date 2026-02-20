"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Workspace } from "@/components/layout/workspace";
import { usePipelineStore } from "@/store/pipeline";
import { apiGet } from "@/lib/api";
import type { Project, PipelineState } from "@/types";

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const setProject = usePipelineStore((s) => s.setProject);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const project = await apiGet<Project>(`/projects/${params.id}`);
        let steps: PipelineState["steps"] = [];
        try {
          const pipeline = await apiGet<PipelineState>(
            `/projects/${params.id}/pipeline`
          );
          steps = pipeline.steps;
        } catch {
          // Pipeline may not exist yet
        }
        setProject(project.id, steps);
      } catch (err) {
        console.error("Failed to load project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, setProject]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-[var(--studio-text-muted)]">Loading project...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-[var(--studio-error)]">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <Workspace />
    </div>
  );
}

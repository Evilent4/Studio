"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Workspace } from "@/components/layout/workspace";
import { usePipelineStore } from "@/store/pipeline";
import { apiGet } from "@/lib/api";
import type { PipelineStep } from "@/types";

interface ProjectResponse {
  id: string;
  name: string;
  pipeline_type: string;
  pipeline?: {
    id: string;
    project_id: string;
    current_step: number;
    steps: string | PipelineStep[];
  } | null;
}

function parseSteps(raw: unknown): PipelineStep[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as PipelineStep[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const setProject = usePipelineStore((s) => s.setProject);
  const setCurrentStep = usePipelineStore((s) => s.setCurrentStep);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const project = await apiGet<ProjectResponse>(`/projects/${params.id}`);
        const steps = parseSteps(project.pipeline?.steps);
        setProject(project.id, steps);
        if (project.pipeline?.current_step != null) {
          setCurrentStep(project.pipeline.current_step);
        }
      } catch (err) {
        console.error("Failed to load project:", err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, setProject, setCurrentStep]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col bg-[var(--studio-bg)]">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--studio-border-hover)] border-t-[var(--studio-accent)]" />
          <span className="text-[13px] text-[var(--studio-text-muted)]">Loading project...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col bg-[var(--studio-bg)]">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="rounded-[var(--studio-radius-md)] border border-[var(--studio-error)]/30 bg-[var(--studio-error)]/8 px-4 py-3">
            <span className="text-[13px] text-[var(--studio-error)]">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--studio-bg)]">
      <Header />
      <Workspace />
    </div>
  );
}

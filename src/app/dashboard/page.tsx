"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Image, Camera, Film, FolderOpen, Plus, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import type { Project } from "@/types";

const PIPELINE_TYPES = [
  { type: "static", label: "Static Graphic", icon: Image, description: "Design a single visual composition" },
  { type: "photo_direction", label: "Photo Direction", icon: Camera, description: "Generate photo shoot direction" },
  { type: "video_reel", label: "Video Reel", icon: Film, description: "Create a short-form video reel" },
] as const;

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet<Project[]>("/projects/");
        setProjects(data);
      } catch {
        // API might not be running; show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-auto px-10 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="mt-1.5 text-sm text-[var(--studio-text-secondary)]">
              Start a new creative pipeline
            </p>
          </div>
        </div>

        {/* New pipeline type cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PIPELINE_TYPES.map(({ type, label, icon: Icon, description }) => (
            <Link
              key={type}
              href={`/project/new?type=${type}`}
            >
              <Card variant="interactive" className="flex flex-col items-center gap-3 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--studio-radius-lg)] bg-[var(--studio-accent-muted)]">
                  <Icon className="h-6 w-6 text-[var(--studio-accent)]" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium tracking-tight">{label}</span>
                <span className="text-[11px] text-[var(--studio-text-muted)] text-center leading-relaxed">
                  {description}
                </span>
              </Card>
            </Link>
          ))}
        </div>

        {/* Existing projects section */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight">Recent Projects</h2>

          {loading ? (
            <div className="mt-6 flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--studio-text-muted)]" />
            </div>
          ) : projects.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={<FolderOpen />}
                title="No projects yet"
                description="Create your first project by choosing a pipeline type above. Your recent work will appear here."
                action={
                  <Link href="/project/new?type=static">
                    <Button variant="primary" size="sm" icon={<Plus />}>
                      New Project
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <Card variant="interactive" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium tracking-tight text-[var(--studio-text)]">
                        {project.name}
                      </h3>
                      <span className="rounded-full bg-[var(--studio-surface-2)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--studio-text-muted)]">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--studio-text-muted)] line-clamp-2">
                      {project.brief || "No description"}
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-[10px] text-[var(--studio-text-muted)]">
                      <span>{project.pipeline_type.replace("_", " ")}</span>
                      <span className="text-[var(--studio-border)]">|</span>
                      <span>{project.format.label}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

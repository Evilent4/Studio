"use client";

import Link from "next/link";
import { Image, Camera, Film } from "lucide-react";
import { Header } from "@/components/layout/header";

const PIPELINE_TYPES = [
  { type: "static", label: "Static Graphic", icon: Image },
  { type: "photo_direction", label: "Photo Direction", icon: Camera },
  { type: "video_reel", label: "Video Reel", icon: Film },
] as const;

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 overflow-auto px-10 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1.5 text-sm text-[var(--studio-text-secondary)]">
          Start a new creative pipeline
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PIPELINE_TYPES.map(({ type, label, icon: Icon }) => (
            <Link
              key={type}
              href={`/project/new?type=${type}`}
              className="group flex flex-col items-center gap-4 rounded-[var(--studio-radius-lg)] border border-[var(--studio-border)] bg-[var(--studio-surface)] p-10 hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-2)] hover:shadow-[0_0_0_1px_var(--studio-border-hover),0_4px_24px_rgba(0,0,0,0.3)] hover:-translate-y-0.5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-[var(--studio-radius-lg)] bg-[var(--studio-accent-muted)] group-hover:bg-[var(--studio-accent)]/15">
                <Icon className="h-7 w-7 text-[var(--studio-accent)]" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium tracking-tight">{label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

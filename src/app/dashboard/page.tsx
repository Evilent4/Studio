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
      <main className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PIPELINE_TYPES.map(({ type, label, icon: Icon }) => (
            <Link
              key={type}
              href={`/project/new?type=${type}`}
              className="flex flex-col items-center gap-3 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface)] p-8 transition-colors hover:border-[var(--studio-border-hover)] hover:bg-[var(--studio-surface-2)]"
            >
              <Icon className="h-10 w-10 text-[var(--studio-accent)]" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

import { create } from "zustand";
import type { StyleProfile, Project } from "@/types";

interface AppStore {
  projects: Project[];
  activeProfile: StyleProfile | null;
  profiles: StyleProfile[];

  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  setActiveProfile: (profile: StyleProfile | null) => void;
  setProfiles: (profiles: StyleProfile[]) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  projects: [],
  activeProfile: null,
  profiles: [],

  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((s) => ({ projects: [project, ...s.projects] })),
  setActiveProfile: (profile) => set({ activeProfile: profile }),
  setProfiles: (profiles) => set({ profiles }),
}));

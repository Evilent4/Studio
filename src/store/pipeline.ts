import { create } from "zustand";
import type { PipelineStep, Zone, StepStatus } from "@/types";

interface PipelineStore {
  projectId: string | null;
  currentStep: number;
  steps: PipelineStep[];
  zones: Zone[];
  selectedZoneId: string | null;
  history: Array<{ steps: PipelineStep[]; zones: Zone[] }>;
  historyIndex: number;

  setProject: (projectId: string, steps: PipelineStep[]) => void;
  setCurrentStep: (step: number) => void;
  updateStepStatus: (stepNumber: number, status: StepStatus) => void;
  updateStepOutput: (stepNumber: number, output: Record<string, unknown>) => void;
  setZones: (zones: Zone[]) => void;
  updateZone: (zoneId: string, updates: Partial<Zone>) => void;
  selectZone: (zoneId: string | null) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

export const usePipelineStore = create<PipelineStore>((set, get) => ({
  projectId: null,
  currentStep: 0,
  steps: [],
  zones: [],
  selectedZoneId: null,
  history: [],
  historyIndex: -1,

  setProject: (projectId, steps) =>
    set({ projectId, steps, currentStep: 0, zones: [], selectedZoneId: null, history: [], historyIndex: -1 }),

  setCurrentStep: (step) => set({ currentStep: step }),

  updateStepStatus: (stepNumber, status) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.step_number === stepNumber ? { ...s, status } : s
      ),
    })),

  updateStepOutput: (stepNumber, output) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.step_number === stepNumber ? { ...s, output: { ...s.output, ...output } } : s
      ),
    })),

  setZones: (zones) => set({ zones }),

  updateZone: (zoneId, updates) => {
    get().pushHistory();
    set((state) => ({
      zones: state.zones.map((z) =>
        z.id === zoneId ? { ...z, ...updates } : z
      ),
    }));
  },

  selectZone: (zoneId) => set({ selectedZoneId: zoneId }),

  pushHistory: () =>
    set((state) => {
      const snapshot = { steps: structuredClone(state.steps), zones: structuredClone(state.zones) };
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > 50) newHistory.shift();
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex < 0) return state;
      const snapshot = state.history[state.historyIndex];
      return {
        steps: structuredClone(snapshot.steps),
        zones: structuredClone(snapshot.zones),
        historyIndex: state.historyIndex - 1,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const snapshot = state.history[state.historyIndex + 1];
      return {
        steps: structuredClone(snapshot.steps),
        zones: structuredClone(snapshot.zones),
        historyIndex: state.historyIndex + 1,
      };
    }),

  reset: () =>
    set({ projectId: null, currentStep: 0, steps: [], zones: [], selectedZoneId: null, history: [], historyIndex: -1 }),
}));

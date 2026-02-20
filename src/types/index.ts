export type PipelineType = "static" | "photo_direction" | "video_reel";
export type ProjectStatus = "draft" | "in_progress" | "completed";
export type ZoneRole = "image" | "text" | "texture" | "pattern" | "solid" | "empty";
export type StepStatus = "pending" | "active" | "completed" | "skipped";
export type StepType = "input" | "auto" | "propose" | "tweak" | "review" | "export";

export interface StyleProfile {
  id: string;
  name: string;
  colours: {
    primary: string[];
    accent: string[];
    background: string[];
    text: string[];
  };
  typography: {
    headline: FontSpec;
    body: FontSpec;
    accent: FontSpec;
    caption: FontSpec;
  };
  composition: {
    text_image_ratio: number;
    alignment: string[];
    whitespace: number;
    density: number;
  };
  textures: {
    grain_intensity: number;
    contrast: number;
    halftone: boolean;
    pattern_density: number;
  };
  mood: {
    warmth: number;
    density: number;
    brightness: number;
    formality: number;
  };
  source_images: string[];
  version: number;
  created_at: string;
}

export interface FontSpec {
  family: string;
  weight: number;
  size_ratio: number;
}

export interface Project {
  id: string;
  name: string;
  style_profile_id: string | null;
  pipeline_type: PipelineType;
  status: ProjectStatus;
  brief: string;
  reference_images: string[];
  format: { width: number; height: number; label: string };
  created_at: string;
}

export interface PipelineStep {
  step_number: number;
  name: string;
  type: StepType;
  status: StepStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  user_overrides: Record<string, unknown>;
}

export interface PipelineState {
  id: string;
  project_id: string;
  current_step: number;
  steps: PipelineStep[];
}

export interface Zone {
  id: string;
  project_id: string;
  grid_position: { row: number; col: number; rowSpan: number; colSpan: number };
  bounds: { x: number; y: number; width: number; height: number };
  role: ZoneRole;
  content: ZoneContent;
  effects: ProcessorEffect[];
  zone_order: number;
}

export type ZoneContent =
  | { type: "image"; asset_id: string; crop_rect: { x: number; y: number; w: number; h: number }; filters: Record<string, number> }
  | { type: "text"; text: string; font: string; size: number; colour: string; weight: number; alignment: "left" | "center" | "right" }
  | { type: "texture"; processor_id: string; params: Record<string, unknown> }
  | { type: "pattern"; processor_id: string; params: Record<string, unknown> }
  | { type: "solid"; colour: string }
  | { type: "empty" };

export interface ProcessorEffect {
  processor_id: string;
  params: Record<string, unknown>;
}

export interface Asset {
  id: string;
  type: "image" | "video" | "audio" | "font" | "texture";
  path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  metadata: Record<string, unknown>;
  uploaded_at: string;
}

export const FORMAT_PRESETS = {
  "ig-post": { width: 1080, height: 1080, label: "Instagram Post" },
  "ig-story": { width: 1080, height: 1920, label: "Instagram Story" },
  "flyer-a5": { width: 1748, height: 2480, label: "Flyer A5" },
  "flyer-a4": { width: 2480, height: 3508, label: "Flyer A4" },
} as const;

export const GRID_PRESETS = {
  "2h": { rows: 2, cols: 1, label: "2 Rows" },
  "2v": { rows: 1, cols: 2, label: "2 Columns" },
  "3r": { rows: 3, cols: 1, label: "3 Rows" },
  "4q": { rows: 2, cols: 2, label: "4 Quarters" },
  "asym-lr": { rows: 1, cols: 2, label: "Asymmetric L/R", ratios: [0.6, 0.4] },
  "asym-tb": { rows: 2, cols: 1, label: "Asymmetric T/B", ratios: [0.7, 0.3] },
} as const;

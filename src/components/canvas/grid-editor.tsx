"use client";

import { useRef, useMemo } from "react";
import { Stage, Layer, Rect, Group } from "react-konva";
import Konva from "konva";
import { v4 as uuid } from "uuid";
import { usePipelineStore } from "@/store/pipeline";
import type { Zone } from "@/types";
import { GRID_PRESETS } from "@/types";

type GridPresetKey = keyof typeof GRID_PRESETS;

interface GridEditorProps {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
}

const PADDING = 40;

/* --- Resolve CSS custom properties at runtime for Konva (canvas) --- */
function getCssVar(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

function getColors() {
  return {
    zoneDefault: getCssVar("--studio-surface-2", "#1a1a1a"),
    zoneSelected: getCssVar("--studio-accent-muted", "#2d2518").replace(
      /rgba?\([^)]+\)/,
      // accent-muted is rgba, fall back to a solid approximation
      "#2a2010"
    ),
    borderDefault: getCssVar("--studio-border", "#232323"),
    borderSelected: getCssVar("--studio-accent", "#c9953c"),
    canvasBg: getCssVar("--studio-surface-2", "#1a1a1a"),
  };
}

export function generateGrid(
  preset: GridPresetKey,
  canvasWidth: number,
  canvasHeight: number,
  gap: number = 4
): Zone[] {
  const presets: Record<string, { rows: number; cols: number; ratios?: readonly number[] }> = {
    "2h": { rows: 2, cols: 1 },
    "2v": { rows: 1, cols: 2 },
    "3r": { rows: 3, cols: 1 },
    "4q": { rows: 2, cols: 2 },
    "asym-lr": { rows: 1, cols: 2, ratios: [0.6, 0.4] },
    "asym-tb": { rows: 2, cols: 1, ratios: [0.7, 0.3] },
  };

  const config = presets[preset];
  if (!config) return [];

  const { rows, cols, ratios } = config;
  const zones: Zone[] = [];

  const totalGapX = gap * (cols - 1);
  const totalGapY = gap * (rows - 1);
  const availableWidth = canvasWidth - totalGapX;
  const availableHeight = canvasHeight - totalGapY;

  // Calculate column widths
  let colWidths: number[];
  if (ratios && cols > 1) {
    colWidths = ratios.map((r) => Math.round(availableWidth * r));
  } else {
    const colW = Math.round(availableWidth / cols);
    colWidths = Array(cols).fill(colW);
  }

  // Calculate row heights
  let rowHeights: number[];
  if (ratios && rows > 1) {
    rowHeights = ratios.map((r) => Math.round(availableHeight * r));
  } else {
    const rowH = Math.round(availableHeight / rows);
    rowHeights = Array(rows).fill(rowH);
  }

  let yOffset = 0;
  let order = 0;

  for (let row = 0; row < rows; row++) {
    let xOffset = 0;
    for (let col = 0; col < cols; col++) {
      zones.push({
        id: uuid(),
        project_id: "",
        grid_position: { row, col, rowSpan: 1, colSpan: 1 },
        bounds: {
          x: xOffset,
          y: yOffset,
          width: colWidths[col],
          height: rowHeights[row],
        },
        role: "empty",
        content: { type: "empty" },
        effects: [],
        zone_order: order++,
      });
      xOffset += colWidths[col] + gap;
    }
    yOffset += rowHeights[row] + gap;
  }

  return zones;
}

export function GridEditor({ width, height, canvasWidth, canvasHeight }: GridEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const { zones, selectedZoneId, selectZone } = usePipelineStore();

  // Resolve CSS variables once per render
  const colors = useMemo(() => getColors(), []);

  // Calculate scale to fit the canvas within the stage area
  const { scale, offsetX, offsetY } = useMemo(() => {
    const availableW = width - PADDING * 2;
    const availableH = height - PADDING * 2;
    const scaleX = availableW / canvasWidth;
    const scaleY = availableH / canvasHeight;
    const s = Math.min(scaleX, scaleY, 1);
    const oX = (width - canvasWidth * s) / 2;
    const oY = (height - canvasHeight * s) / 2;
    return { scale: s, offsetX: oX, offsetY: oY };
  }, [width, height, canvasWidth, canvasHeight]);

  const handleZoneClick = (zoneId: string) => {
    selectZone(selectedZoneId === zoneId ? null : zoneId);
  };

  return (
    <Stage ref={stageRef} width={width} height={height}>
      <Layer>
        {/* Canvas background */}
        <Group x={offsetX} y={offsetY} scaleX={scale} scaleY={scale}>
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill={colors.canvasBg}
            cornerRadius={2}
          />
          {/* Zones */}
          {zones.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            return (
              <Rect
                key={zone.id}
                x={zone.bounds.x}
                y={zone.bounds.y}
                width={zone.bounds.width}
                height={zone.bounds.height}
                fill={isSelected ? colors.zoneSelected : colors.zoneDefault}
                stroke={isSelected ? colors.borderSelected : colors.borderDefault}
                strokeWidth={isSelected ? 2 / scale : 1 / scale}
                cornerRadius={2}
                onClick={() => handleZoneClick(zone.id)}
                onTap={() => handleZoneClick(zone.id)}
              />
            );
          })}
        </Group>
      </Layer>
    </Stage>
  );
}

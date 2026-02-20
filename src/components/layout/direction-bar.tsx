"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function DirectionBar() {
  const [value, setValue] = useState("");

  return (
    <div className="border-t border-[var(--studio-border)] bg-[var(--studio-surface)] px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe what you want..."
          className="flex-1 rounded-md border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2 text-sm text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:border-[var(--studio-border-hover)] focus:outline-none"
        />
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--studio-accent)] text-white hover:bg-[var(--studio-accent-hover)] transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

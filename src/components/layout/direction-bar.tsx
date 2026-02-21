"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export function DirectionBar() {
  const [value, setValue] = useState("");

  // TODO: Wire up to AI direction pipeline once backend endpoint is ready
  const handleSubmit = () => {
    if (!value.trim()) return;
    console.log("[DirectionBar] submit:", value);
    setValue("");
  };

  const isEmpty = !value.trim();

  return (
    <div className="border-t border-[var(--studio-border)] bg-[var(--studio-surface)] px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Direction -- coming soon"
          className="flex-1 rounded-[var(--studio-radius-md)] border border-[var(--studio-border)] bg-[var(--studio-surface-2)] px-3 py-2 text-sm text-[var(--studio-text)] placeholder:text-[var(--studio-text-muted)] focus:border-[var(--studio-accent)]/50 focus:outline-none transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={isEmpty}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--studio-radius-md)] bg-[var(--studio-accent)] text-white enabled:hover:bg-[var(--studio-accent-hover)] enabled:active:scale-[0.93] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

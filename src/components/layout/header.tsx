import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center border-b border-[var(--studio-border)] bg-[var(--studio-bg)] px-5">
      <Link
        href="/dashboard"
        className="text-[13px] font-semibold tracking-tight text-[var(--studio-text)] hover:text-[var(--studio-accent)]"
      >
        Studio
      </Link>
      <div className="mx-4 h-3.5 w-px bg-[var(--studio-border)]" />
      <nav className="flex gap-1 text-[13px]">
        <Link
          href="/dashboard"
          className="rounded-[var(--studio-radius-sm)] px-2.5 py-1 text-[var(--studio-text-secondary)] hover:bg-[var(--studio-surface-2)] hover:text-[var(--studio-text)]"
        >
          Projects
        </Link>
        <Link
          href="/profiles"
          className="rounded-[var(--studio-radius-sm)] px-2.5 py-1 text-[var(--studio-text-secondary)] hover:bg-[var(--studio-surface-2)] hover:text-[var(--studio-text)]"
        >
          System
        </Link>
      </nav>
    </header>
  );
}

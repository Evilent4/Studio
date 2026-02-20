import Link from "next/link";

export function Header() {
  return (
    <header className="flex h-12 items-center border-b border-[var(--studio-border)] px-4">
      <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
        Studio
      </Link>
      <nav className="ml-8 flex gap-4 text-sm">
        <Link
          href="/dashboard"
          className="text-[var(--studio-text-secondary)] hover:text-[var(--studio-text)] transition-colors"
        >
          Projects
        </Link>
        <Link
          href="/profiles"
          className="text-[var(--studio-text-secondary)] hover:text-[var(--studio-text)] transition-colors"
        >
          System
        </Link>
      </nav>
    </header>
  );
}

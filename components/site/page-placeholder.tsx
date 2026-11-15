import Link from "next/link";

type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  note?: string;
};

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  note,
}: PagePlaceholderProps) {
  return (
    <div className="il-ambient min-h-[70vh]">
      <div className="mx-auto w-full max-w-[var(--il-max-width)] px-[var(--il-page-gutter)] py-24 sm:py-32">
        <p className="il-kicker">{eyebrow}</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--il-text-muted)]">
          {description}
        </p>
        {note ? (
          <p className="mt-8 inline-flex rounded-full border border-[var(--il-glass-border)] bg-[var(--il-glass-fill)] px-4 py-2 font-mono text-xs text-[var(--il-text-muted)]">
            {note}
          </p>
        ) : null}
        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-[var(--il-accent)] hover:underline"
          >
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

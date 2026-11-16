type ComponentThumbProps = {
  slug: string;
  className?: string;
};

/*
 * Static, dependency-free specimen for each registry item. These are
 * intentionally separate from the live demos: the library stays cheap to
 * render while every entry remains recognizable.
 */
function Shape({ slug }: { slug: string }) {
  switch (slug) {
    case "rim-light":
      return (
        <span className="absolute inset-5 rounded-xl border border-[var(--site-accent)] shadow-[inset_0_0_26px_color-mix(in_oklab,var(--site-accent)_28%,transparent)]" />
      );
    case "inner-shade":
      return (
        <span className="absolute inset-5 rounded-xl border border-[var(--site-line)] bg-[var(--site-panel)] shadow-[inset_0_14px_28px_rgb(0_0_0/0.45),inset_0_-2px_8px_color-mix(in_oklab,var(--site-text)_16%,transparent)]" />
      );
    case "blur-refraction":
      return (
        <>
          <span className="absolute left-8 top-6 size-12 rounded-full bg-[var(--site-accent)] opacity-50 blur-md" />
          <span className="absolute bottom-5 right-8 size-10 rounded-full bg-[var(--site-accent-3)] opacity-40 blur-md" />
          <span className="absolute inset-x-8 inset-y-6 rounded-xl border border-[var(--site-line-strong)] bg-[color-mix(in_oklab,var(--site-panel)_55%,transparent)] backdrop-blur-md" />
        </>
      );
    case "chromatic-edge":
      return (
        <span
          className="absolute inset-5 rounded-xl"
          style={{
            background:
              "linear-gradient(125deg, var(--site-accent-3), var(--site-text) 46%, var(--site-accent) 88%)",
            padding: 1.5,
          }}
        >
          <span className="block h-full w-full rounded-[10px] bg-[var(--site-panel)]" />
        </span>
      );
    case "ambient-light":
      return (
        <>
          <span
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 64% 38%, color-mix(in oklab, var(--site-accent) 45%, transparent), transparent 58%)",
            }}
          />
          <span className="absolute inset-8 rounded-2xl border border-[var(--site-line)]" />
        </>
      );
    case "optical-navbar":
      return (
        <span className="absolute inset-x-5 top-1/2 flex h-11 -translate-y-1/2 items-center gap-2 rounded-xl border border-[var(--site-line-strong)] bg-[color-mix(in_oklab,var(--site-panel)_55%,transparent)] px-3 backdrop-blur-md">
          <span className="size-2.5 rounded-full bg-[var(--site-accent)] shadow-[0_0_12px_var(--site-accent)]" />
          <span className="h-1.5 w-9 rounded-full bg-[var(--site-text)] opacity-30" />
          <span className="ml-auto h-1.5 w-6 rounded-full bg-[var(--site-text)] opacity-15" />
          <span className="h-1.5 w-6 rounded-full bg-[var(--site-text)] opacity-15" />
        </span>
      );
    case "fluid-glass-dock":
      return (
        <span className="absolute inset-x-7 bottom-6 flex items-center justify-center gap-2 rounded-2xl border border-[var(--site-line-strong)] bg-[color-mix(in_oklab,var(--site-panel)_55%,transparent)] p-2.5 backdrop-blur-md">
          {[0, 1, 2, 3].map((item) => (
            <span
              key={item}
              className="size-6 rounded-lg border border-[var(--site-line-strong)] bg-[var(--site-text)]"
              style={{ opacity: item === 1 ? 0.22 : 0.08 }}
            />
          ))}
        </span>
      );
    case "refractive-card":
      return (
        <>
          <span className="absolute left-1/2 top-1/2 h-20 w-32 -translate-x-1/2 -translate-y-1/2 rotate-[-7deg] rounded-xl border border-[var(--site-line-strong)] bg-[color-mix(in_oklab,var(--site-panel)_45%,transparent)] shadow-[0_22px_38px_rgb(0_0_0/0.3)] backdrop-blur-md" />
          <span className="absolute left-[38%] top-[36%] size-2 rounded-full bg-[var(--site-accent)] shadow-[0_0_16px_var(--site-accent)]" />
        </>
      );
    case "sheen-button":
      return (
        <span className="absolute left-1/2 top-1/2 h-10 w-32 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border border-[var(--site-line-strong)] bg-[linear-gradient(105deg,var(--site-accent),var(--site-accent-2))]">
          <span className="absolute -inset-y-6 left-1/3 w-7 rotate-12 bg-[var(--site-text)] opacity-25 blur-[1px]" />
          <span className="absolute inset-x-5 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--site-panel)] opacity-70" />
        </span>
      );
    case "immersive-modal":
      return (
        <>
          <span className="absolute inset-0 bg-[rgb(3_5_8/0.45)]" />
          <span className="absolute left-1/2 top-1/2 h-20 w-32 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--site-line-strong)] bg-[color-mix(in_oklab,var(--site-panel)_72%,transparent)] shadow-[0_18px_34px_rgb(0_0_0/0.38)] backdrop-blur-sm">
            <span className="absolute inset-x-4 top-4 h-1 rounded-full bg-[var(--site-text)] opacity-25" />
            <span className="absolute inset-x-4 top-8 h-1 w-2/3 rounded-full bg-[var(--site-text)] opacity-15" />
          </span>
        </>
      );
    case "cursor-refraction-card":
      return (
        <>
          <span
            className="absolute inset-4 rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--site-accent) 40%, var(--site-panel)), color-mix(in oklab, var(--site-accent-3) 34%, var(--site-panel)) 72%, var(--site-panel))",
            }}
          />
          <span className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--site-text)] opacity-45 backdrop-blur-[2px]" />
          <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--site-text)] opacity-60" />
        </>
      );
    case "magnetic-sheen-button":
      return (
        <>
          <span className="absolute left-1/2 top-1/2 h-10 w-32 -translate-x-[54%] -translate-y-[58%] rounded-full border border-[var(--site-line)] bg-[var(--site-panel)]" />
          <span className="absolute left-1/2 top-1/2 h-10 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(120deg,var(--site-accent),var(--site-accent-2))] shadow-[0_14px_28px_color-mix(in_oklab,var(--site-accent)_26%,transparent)]">
            <span className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[var(--site-panel)] opacity-70" />
          </span>
        </>
      );
    case "focus-pulse-form":
      return (
        <span className="absolute inset-x-8 top-1/2 grid -translate-y-1/2 gap-2.5">
          <span className="h-4 w-2/3 rounded-md border border-[var(--site-line)] bg-[var(--site-text)] opacity-15" />
          <span className="h-4 rounded-md border border-[var(--site-accent)] bg-[color-mix(in_oklab,var(--site-accent)_10%,transparent)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--site-accent)_18%,transparent)]" />
          <span className="h-4 rounded-md border border-[var(--site-line)] bg-[var(--site-text)] opacity-15" />
        </span>
      );
    case "liquid-light-pool":
      return (
        <>
          <span className="absolute left-6 top-5 size-16 rounded-full bg-[var(--site-accent)] opacity-45 blur-lg" />
          <span className="absolute bottom-4 right-6 size-20 rounded-full bg-[var(--site-accent-3)] opacity-35 blur-xl" />
          <span className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--site-text)] opacity-25 blur-md" />
          <span className="absolute inset-x-7 inset-y-5 rounded-[40%_60%_55%_45%/50%_45%_55%_50%] border border-[var(--site-line-strong)] opacity-60" />
        </>
      );
    case "ripple-pool":
      return (
        <>
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--site-accent)]"
              style={{
                width: `${36 + item * 26}px`,
                height: `${36 + item * 26}px`,
                opacity: 0.55 - item * 0.14,
              }}
            />
          ))}
          <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--site-accent)] shadow-[0_0_14px_var(--site-accent)]" />
        </>
      );
    case "liquid-glass-hero":
      return (
        <>
          <span
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0 17%, color-mix(in oklab, var(--site-accent) 26%, transparent) 17% 22%, transparent 22% 31%, color-mix(in oklab, var(--site-accent-2) 24%, transparent) 31% 34%, transparent 34% 67%, color-mix(in oklab, var(--site-accent-3) 22%, transparent) 67% 72%, transparent 72%), repeating-linear-gradient(90deg, var(--site-line) 0 1px, transparent 1px 28px), repeating-linear-gradient(0deg, var(--site-line) 0 1px, transparent 0 28px)",
              backgroundSize: "cover",
            }}
          />
          <span className="absolute inset-6 rounded-2xl border border-[var(--site-line-strong)] bg-[color-mix(in_oklab,var(--site-panel)_28%,transparent)] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--site-accent)_20%,transparent),0_18px_34px_rgb(0_0_0/0.25)] backdrop-blur-sm" />
          <span className="absolute left-1/2 top-1/2 h-1 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--site-text)] opacity-30" />
        </>
      );
    default:
      return (
        <span className="absolute inset-5 rounded-xl border border-[var(--site-line)] bg-[var(--site-text)] opacity-10" />
      );
  }
}

export function ComponentThumb({ slug, className }: ComponentThumbProps) {
  return (
    <span
      data-thumb={slug}
      aria-hidden="true"
      className={["thumb-shapes block", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Shape slug={slug} />
    </span>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";

type CodeFile = {
  name: string;
  raw: string;
  html: string;
};

type CopyState = "idle" | "copied" | "error";

function legacyCopy(text: string): boolean {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

type CopyButtonProps = {
  text: string;
  idleLabel: string;
  copiedLabel: string;
  errorLabel: string;
  suffix?: string;
  className: string;
  title?: string;
};

function CopyButton({
  text,
  idleLabel,
  copiedLabel,
  errorLabel,
  suffix,
  className,
  title,
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | null>(null);
  const timersRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const scheduleReset = () => {
    if (resetTimer.current !== null) {
      window.clearTimeout(resetTimer.current);
      timersRef.current.delete(resetTimer.current);
    }

    const timer = window.setTimeout(() => {
      setState("idle");
      timersRef.current.delete(timer);
      resetTimer.current = null;
    }, 1800);

    resetTimer.current = timer;
    timersRef.current.add(timer);
  };

  const handleClick = () => {
    const copied = legacyCopy(text);
    setState(copied ? "copied" : "error");
    scheduleReset();

    if (!copied && navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setState("copied");
          scheduleReset();
        })
        .catch(() => setState("error"));
    }
  };

  const label =
    state === "copied"
      ? copiedLabel
      : state === "error"
        ? errorLabel
        : idleLabel;

  return (
    <button
      type="button"
      onClick={handleClick}
      data-copy-state={state}
      title={title}
      className={className}
    >
      <span aria-live="polite">
        {label}
        {suffix ? ` ${suffix}` : ""}
      </span>
    </button>
  );
}

export function CodeBlock({ files }: { files: CodeFile[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const idPrefix = useId();
  const activeFile = files[activeIndex];

  const combined = files
    .map((file) => {
      const header = file.name.endsWith(".css")
        ? `/* ===== ${file.name} ===== */`
        : `// ===== ${file.name} =====`;
      return `${header}\n${file.raw}`;
    })
    .join("\n\n");

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const lastIndex = files.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = index === lastIndex ? 0 : index + 1;
    } else if (event.key === "ArrowLeft") {
      nextIndex = index === 0 ? lastIndex : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = lastIndex;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    setActiveIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="workbench">
      <div className="workbench__tabs flex-wrap justify-between gap-2">
        <div role="tablist" aria-label="代码文件" className="flex flex-wrap items-center gap-1">
          {files.map((file, index) => {
            const selected = index === activeIndex;

            return (
              <button
                key={file.name}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={`${idPrefix}-tab-${index}`}
                type="button"
                role="tab"
                tabIndex={selected ? 0 : -1}
                aria-selected={selected}
                aria-controls={`${idPrefix}-panel-${index}`}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                className="workbench__tab"
              >
                {file.name}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <CopyButton
            text={activeFile.raw}
            idleLabel="复制文件"
            copiedLabel="已复制"
            errorLabel="复制失败"
            className="btn btn--ghost btn--sm"
          />
          <CopyButton
            text={combined}
            idleLabel="复制全部"
            copiedLabel="全部已复制"
            errorLabel="复制失败"
            suffix={`· ${files.length} 文件`}
            title={`复制 ${files.map((file) => file.name).join(" + ")}`}
            className="btn btn--primary btn--sm"
          />
        </div>
      </div>

      <div
        key={activeFile.name}
        id={`${idPrefix}-panel-${activeIndex}`}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-tab-${activeIndex}`}
        className="il-code max-h-[560px] overflow-auto"
        style={{ background: "#070c12" }}
        dangerouslySetInnerHTML={{ __html: activeFile.html }}
      />
    </div>
  );
}

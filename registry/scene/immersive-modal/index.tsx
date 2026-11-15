"use client";

import { useEffect, useId, useRef, useState } from "react";
import "./styles.css";
import { useOpticalTier } from "./use-optical-tier";

export type ImmersiveModalTier = "auto" | "high" | "mid" | "low";

export interface ImmersiveModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  tier?: ImmersiveModalTier;
  className?: string;
  closeLabel?: string;
}

function useAmbientLight(
  ref: React.RefObject<HTMLElement | null>,
  range: number,
) {
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia?.("(pointer: coarse)");
    let listening = false;

    const update = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
      const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
      const distance = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - distance / range);

      element.style.setProperty("--il-light-x", `${clientX - rect.left}px`);
      element.style.setProperty("--il-light-y", `${clientY - rect.top}px`);
      element.style.setProperty(
        "--il-light-proximity",
        proximity.toFixed(3),
      );
    };

    const schedule = (clientX: number, clientY: number) => {
      pointerRef.current = { x: clientX, y: clientY };
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const pointer = pointerRef.current;
        if (pointer) update(pointer.x, pointer.y);
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      schedule(event.clientX, event.clientY);
    };

    const refresh = () => {
      const pointer = pointerRef.current;
      if (pointer) schedule(pointer.x, pointer.y);
    };

    const stop = () => {
      if (!listening) return;

      listening = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
      pointerRef.current = null;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      element.style.setProperty("--il-light-proximity", "0");
      element.style.removeProperty("--il-light-x");
      element.style.removeProperty("--il-light-y");
    };

    const start = () => {
      if (listening || motion?.matches || coarse?.matches) return;

      listening = true;
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("scroll", refresh, {
        passive: true,
        capture: true,
      });
      window.addEventListener("resize", refresh, { passive: true });
    };

    const sync = () => {
      if (motion?.matches || coarse?.matches) stop();
      else start();
    };

    const listen = (query: MediaQueryList | undefined) => {
      if (!query) return;

      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", sync);
      } else {
        query.addListener(sync);
      }
    };

    const unlisten = (query: MediaQueryList | undefined) => {
      if (!query) return;

      if (typeof query.removeEventListener === "function") {
        query.removeEventListener("change", sync);
      } else {
        query.removeListener(sync);
      }
    };

    sync();
    listen(motion);
    listen(coarse);

    return () => {
      stop();
      unlisten(motion);
      unlisten(coarse);
    };
  }, [ref, range]);
}

export function ImmersiveModal({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  children,
  tier = "auto",
  className,
  closeLabel = "关闭弹窗",
}: ImmersiveModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  useAmbientLight(panelRef, 340);

  const updateOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  };

  const close = () => {
    updateOpen(false);
    dialogRef.current?.close();
  };

  const resolvedTier = useOpticalTier(dialogRef, tier);

  return (
    <dialog
      ref={dialogRef}
      data-il-tier={resolvedTier}
      className={["il-immersive-modal", className]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={handleClose}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
    >
      <div
        ref={panelRef}
        className="il-immersive-modal__panel"
        data-il-component="immersive-modal"
        data-il-tier={resolvedTier}
      >
        <span className="il-immersive-modal__glass" aria-hidden="true">
          <span className="il-immersive-modal__ambient" />
          <span className="il-immersive-modal__rim" />
        </span>

        <div className="il-immersive-modal__content">
          <div className="il-immersive-modal__header">
            <div>
              <h2 id={titleId} className="il-immersive-modal__title">
                {title}
              </h2>
              {description ? (
                <p
                  id={descriptionId}
                  className="il-immersive-modal__description"
                >
                  {description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="il-immersive-modal__close"
              aria-label={closeLabel}
              onClick={close}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <div className="il-immersive-modal__body">{children}</div>
        </div>
      </div>
    </dialog>
  );
}

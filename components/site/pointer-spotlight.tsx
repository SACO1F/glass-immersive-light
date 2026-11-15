"use client";

import { useEffect, useRef } from "react";

export function PointerSpotlight() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!finePointer.matches || reducedMotion.matches) return;

    let frame = 0;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 3;
    let targetX = currentX;
    let targetY = currentY;
    let active = false;

    element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

    const render = () => {
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;

      currentX += deltaX * 0.14;
      currentY += deltaY * 0.14;
      element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      if (Math.abs(deltaX) < 0.4 && Math.abs(deltaY) < 0.4) {
        currentX = targetX;
        currentY = targetY;
        element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        frame = 0;
        return;
      }

      frame = window.requestAnimationFrame(render);
    };

    const kick = () => {
      if (frame === 0) frame = window.requestAnimationFrame(render);
    };

    const handlePointer = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!active) {
        active = true;
        element.dataset.active = "true";
      }

      kick();

      const target = event.target;
      const card =
        target instanceof Element
          ? target.closest<HTMLElement>("[data-spotlight]")
          : null;

      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      }
    };

    const handleLeave = () => {
      active = false;
      element.dataset.active = "false";
    };

    window.addEventListener("pointermove", handlePointer, { passive: true });
    document.addEventListener("pointerleave", handleLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointer);
      document.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return <div ref={ref} className="pointer-spotlight" aria-hidden="true" />;
}

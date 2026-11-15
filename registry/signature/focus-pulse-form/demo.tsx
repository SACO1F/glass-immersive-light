"use client";

import { useState } from "react";
import { FocusPulseForm } from "./index";

export function FocusPulseFormDemo() {
  const [sent, setSent] = useState(false);

  return (
    <FocusPulseForm
      className="w-full max-w-sm"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <label>
        邮箱
        <input type="email" required placeholder="you@example.com" />
      </label>
      <label>
        密码
        <input type="password" required placeholder="至少 8 位字符" />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-full bg-[var(--il-text)] px-4 py-2 text-sm font-medium text-[var(--il-bg)] transition-transform hover:-translate-y-0.5"
        >
          提交
        </button>
        {sent ? (
          <span
            role="status"
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--il-accent)]"
          >
            已提交
          </span>
        ) : null}
      </div>
    </FocusPulseForm>
  );
}

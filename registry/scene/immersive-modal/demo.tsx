"use client";

import { useState } from "react";
import { ImmersiveModal } from "./index";

export function ImmersiveModalDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[var(--il-text)] px-5 py-3 text-sm font-medium text-[var(--il-bg)] transition-transform hover:-translate-y-0.5"
      >
        打开光感弹窗
      </button>

      <ImmersiveModal
        open={open}
        onOpenChange={setOpen}
        title="沉浸式光感弹窗"
        description="原生 dialog 负责焦点管理，玻璃面板负责光感。"
      >
        <p>
          指针在面板边缘移动时，环境光会先进入玻璃，再由边缘高光完成轮廓。Esc、遮罩点击和关闭按钮都可以退出。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-[var(--il-text)] px-4 py-2 text-sm font-medium text-[var(--il-bg)]"
          >
            确认
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-[var(--il-glass-border)] bg-[var(--il-glass-fill)] px-4 py-2 text-sm text-[var(--il-text)]"
          >
            取消
          </button>
        </div>
      </ImmersiveModal>
    </>
  );
}

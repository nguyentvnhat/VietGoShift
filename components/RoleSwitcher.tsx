"use client";

import { useTransition } from "react";
import { switchRole } from "@/app/actions";
import type { Role } from "@/lib/session";

export function RoleSwitcher({ role }: { role: Role }) {
  const [pending, startTransition] = useTransition();
  const target: Role = role === "customer" ? "worker" : "customer";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => switchRole(target))}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 py-1 pr-3 pl-1 text-xs font-medium ring-1 ring-white/25 active:bg-white/25 disabled:opacity-50"
      aria-label={`Chuyển sang vai trò ${target === "worker" ? "thợ" : "khách hàng"}`}
    >
      <span className="flex size-7 items-center justify-center rounded-full bg-white text-sm">
        {role === "customer" ? "👤" : "🛠️"}
      </span>
      <span className="flex flex-col items-start leading-none">
        <span>{role === "customer" ? "Khách" : "Thợ"}</span>
        <span className="text-[10px] text-emerald-100">đổi vai ⇄</span>
      </span>
    </button>
  );
}

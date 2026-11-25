"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Role } from "@/lib/session";

type Tab = { href: string; label: string; icon: ReactNode };

const icon = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    className="size-6"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
);

const HOME = icon("M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z");
const PLUS = icon("M12 5v14M5 12h14");
const LIST = icon("M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01");
const BRIEFCASE = icon("M4 7h16v12H4zM9 7V5h6v2M4 12h16");

const TABS: Record<Role, Tab[]> = {
  customer: [
    { href: "/demo", label: "Trang chủ", icon: HOME },
    { href: "/demo/booking", label: "Đặt lịch", icon: PLUS },
    { href: "/demo/orders", label: "Đơn hàng", icon: LIST },
  ],
  worker: [
    { href: "/demo/worker", label: "Việc của tôi", icon: BRIEFCASE },
    { href: "/demo/orders", label: "Lịch sử", icon: LIST },
  ],
};

// Ẩn thanh tab trong các luồng thao tác (đặt lịch, theo dõi, hoàn thành) — giống Grab.
const HIDDEN_PREFIXES = ["/demo/booking", "/demo/tracking", "/demo/complete"];

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md md:max-w-2xl">
        {TABS[role].map((tab) => {
          const active = tab.href === "/demo" ? pathname === "/demo" : pathname.startsWith(tab.href);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  active ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

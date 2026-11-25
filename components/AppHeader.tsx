import Link from "next/link";
import type { Session } from "@/lib/session";
import { RoleSwitcher } from "./RoleSwitcher";

export function AppHeader({ session }: { session: Session }) {
  const isWorker = session.role === "worker";
  return (
    <header className="sticky top-0 z-20 bg-emerald-600 text-white shadow-md">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3 md:max-w-2xl">
        <Link
          href={isWorker ? "/demo/worker" : "/demo"}
          aria-label="VietGoShift"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-lg font-extrabold text-emerald-600"
        >
          V
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-xs text-emerald-100">
            {isWorker ? "Thợ · sẵn sàng nhận việc" : "Xin chào 👋"}
          </p>
          <p className="flex items-center gap-1 truncate text-sm font-semibold">
            <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden>
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
            </svg>
            Quận 1, TP. Hồ Chí Minh
          </p>
        </div>
        <RoleSwitcher role={session.role} />
      </div>
    </header>
  );
}

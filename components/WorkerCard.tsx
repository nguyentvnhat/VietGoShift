"use client";

import { useNow } from "@/hooks/useNow";
import { formatTime } from "@/lib/format";
import { etaMinutesLeft, type Order } from "@/lib/orders";
import { getWorker } from "@/lib/workers";

export function WorkerCard({ order }: { order: Order }) {
  const now = useNow();
  const worker = getWorker(order.workerId);
  if (!worker) return null;

  const minutesLeft = order.status === "on_the_way" ? etaMinutesLeft(order, now) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-2xl">
          {worker.avatar}
        </span>
        <div className="flex-1">
          <p className="font-semibold">{worker.name}</p>
          <p className="text-xs text-slate-500">
            ★ {worker.rating} · {worker.completedJobs} ca đã làm
          </p>
        </div>
        <a
          href={`tel:${worker.phone}`}
          aria-label={`Gọi ${worker.name}`}
          className="flex size-10 items-center justify-center rounded-full bg-emerald-600 text-white"
        >
          📞
        </a>
      </div>
      {minutesLeft !== null && order.etaAt && (
        <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900" data-testid="eta">
          🛵 Dự kiến đến lúc <b>{formatTime(order.etaAt)}</b>
          {minutesLeft > 0 ? ` · còn khoảng ${minutesLeft} phút` : " · sắp tới nơi"}
        </div>
      )}
    </div>
  );
}

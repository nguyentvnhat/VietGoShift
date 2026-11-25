import { ORDER_STATUSES, STATUS_LABEL, type Order } from "@/lib/orders";

export function StatusTimeline({ order }: { order: Order }) {
  const current = ORDER_STATUSES.indexOf(order.status);
  return (
    <ol className="flex flex-col gap-0" aria-label="Tiến trình đơn">
      {ORDER_STATUSES.map((status, i) => {
        const at = order.history.find((h) => h.status === status)?.at;
        const done = i <= current;
        return (
          <li key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                  i === current
                    ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                    : done
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {i < ORDER_STATUSES.length - 1 && (
                <span
                  className={`w-0.5 flex-1 ${i < current ? "bg-emerald-600" : "bg-slate-200"}`}
                />
              )}
            </div>
            <div className="pb-4">
              <p className={done ? "font-medium text-slate-900" : "text-slate-400"}>
                {STATUS_LABEL[status]}
              </p>
              {at && (
                <p className="text-xs text-slate-500">
                  {new Date(at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

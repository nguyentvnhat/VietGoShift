import { formatSlot, formatVnd } from "@/lib/format";
import type { Order } from "@/lib/orders";
import { getService } from "@/lib/services";

export function OrderSummary({ order }: { order: Order }) {
  const service = getService(order.serviceId);
  return (
    <div className="flex items-start gap-3">
      <span className="text-3xl">{service?.icon}</span>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-slate-900">{service?.name}</p>
        <p className="text-slate-600">
          {formatSlot(order.date, order.startTime)} · {order.hours} giờ
        </p>
        <p className="text-slate-600">{order.address}</p>
      </div>
      <span className="text-sm font-semibold text-emerald-700">{formatVnd(order.total)}</span>
    </div>
  );
}

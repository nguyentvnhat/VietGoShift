import { formatDuration } from "@/lib/format";
import { workedMinutes, type Order } from "@/lib/orders";

export function HandoverSummary({ order }: { order: Order }) {
  const minutes = workedMinutes(order);
  if (!order.handover && minutes === null) return null;

  const booked = order.hours * 60;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold">Bàn giao từ thợ</h2>
      {minutes !== null && (
        <p className="text-sm" data-testid="worked-time">
          ⏱️ Làm thực tế <b>{formatDuration(minutes)}</b>
          <span className="text-slate-500"> / đặt {formatDuration(booked)}</span>
          {minutes < booked && (
            <span className="ml-1 rounded bg-amber-100 px-1.5 text-xs text-amber-800">
              ít hơn giờ đặt
            </span>
          )}
        </p>
      )}
      {order.handover && (
        <>
          <p className="rounded-lg bg-slate-50 p-2 text-sm text-slate-700">
            📝 {order.handover.note}
          </p>
          {order.handover.photos.length > 0 && (
            <div className="flex gap-2">
              {order.handover.photos.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- data URL cục bộ
                <img
                  key={i}
                  src={src}
                  alt={`Ảnh bàn giao ${i + 1}`}
                  className="size-20 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

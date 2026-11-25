"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CustomerQr } from "@/components/CustomerQr";
import { HandoverSummary } from "@/components/HandoverSummary";
import { OrderNotFound } from "@/components/OrderNotFound";
import { OrderSummary } from "@/components/OrderSummary";
import { StatusTimeline } from "@/components/StatusTimeline";
import { Button, Card } from "@/components/ui";
import { WorkerCard } from "@/components/WorkerCard";
import { useOrder } from "@/hooks/useOrders";
import { useSession } from "@/hooks/useSession";
import { orderStore } from "@/lib/order-store";
import { SCAN_STEP, STATUS_LABEL, advanceOrder, nextStatus } from "@/lib/orders";
import { DEMO_USERS } from "@/lib/session";

const DEMO_HANDOVER = {
  note: "(Demo) Đã hoàn thành toàn bộ hạng mục, vệ sinh khu vực làm việc.",
  photos: [],
};

export default function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const order = useOrder(id);
  const { role } = useSession();

  if (order === undefined) return null;
  if (order === null) return <OrderNotFound />;

  const next = nextStatus(order.status);
  const scan = SCAN_STEP[order.status];
  // Check-out chỉ mở khi thợ đã gửi bàn giao.
  const showQr = role === "customer" && scan && (scan === "check_in" || order.handover);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-slate-500">Đơn #{order.id}</p>
        <h1 className="text-xl font-bold" data-testid="order-status">
          {STATUS_LABEL[order.status]}
        </h1>
      </div>

      {order.workerId && (
        <Card>
          <WorkerCard order={order} />
        </Card>
      )}

      {order.status === "in_progress" && order.handover && (
        <Card>
          <HandoverSummary order={order} />
        </Card>
      )}

      {showQr && (
        <Card>
          <CustomerQr key={`${order.id}-${scan}`} orderId={order.id} action={scan} />
        </Card>
      )}

      <Card>
        <OrderSummary order={order} />
      </Card>

      <Card>
        <StatusTimeline order={order} />
      </Card>

      {order.status === "completed" ? (
        <Link
          href={`/demo/complete/${order.id}`}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-center font-semibold text-white"
        >
          Đánh giá & bảo hành
        </Link>
      ) : (
        next && (
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-3">
            <p className="mb-2 text-xs font-medium text-amber-800">
              DEMO · giả lập thợ cập nhật{scan && " (bỏ qua bước quét QR)"}
            </p>
            <Button
              variant="ghost"
              onClick={() =>
                orderStore.update(order.id, (o) =>
                  advanceOrder(
                    o,
                    DEMO_USERS.worker,
                    new Date(),
                    o.status === "in_progress" && !o.handover ? { handover: DEMO_HANDOVER } : {},
                  ),
                )
              }
            >
              Giả lập → {STATUS_LABEL[next]}
            </Button>
          </div>
        )
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { HandoverSummary } from "@/components/HandoverSummary";
import { OrderNotFound } from "@/components/OrderNotFound";
import { OrderSummary } from "@/components/OrderSummary";
import { RatingForm } from "@/components/RatingForm";
import { Card } from "@/components/ui";
import { WarrantyForm } from "@/components/WarrantyForm";
import { useOrder } from "@/hooks/useOrders";
import { useSession } from "@/hooks/useSession";
import { orderStore } from "@/lib/order-store";

export default function CompletePage() {
  const { id } = useParams<{ id: string }>();
  const order = useOrder(id);
  const { role } = useSession();

  if (order === undefined) return null;
  if (order === null) return <OrderNotFound />;

  if (order.status !== "completed") {
    return (
      <div className="py-16 text-center">
        <p className="font-semibold">Đơn chưa hoàn thành</p>
        <Link href={`/tracking/${order.id}`} className="font-semibold text-emerald-700">
          Theo dõi đơn
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-5xl">🎉</p>
        <h1 className="text-xl font-bold">Hoàn thành ca làm</h1>
        <p className="text-sm text-slate-500">Đơn #{order.id}</p>
      </div>

      <Card>
        <OrderSummary order={order} />
      </Card>

      <Card>
        <HandoverSummary order={order} />
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-semibold">Đánh giá 2 chiều</h2>
        <RatingForm
          title="Khách hàng đánh giá thợ"
          review={order.customerReview}
          editable={role === "customer"}
          onSubmit={(review) =>
            orderStore.update(order.id, (o) => ({ ...o, customerReview: review }))
          }
        />
        <hr className="border-slate-100" />
        <RatingForm
          title="Thợ đánh giá khách hàng"
          review={order.workerReview}
          editable={role === "worker"}
          onSubmit={(review) =>
            orderStore.update(order.id, (o) => ({ ...o, workerReview: review }))
          }
        />
      </Card>

      <WarrantyForm
        warranty={order.warranty}
        canRequest={role === "customer"}
        onSubmit={(description) =>
          orderStore.update(order.id, (o) => ({
            ...o,
            warranty: { description, status: "processing", createdAt: new Date().toISOString() },
          }))
        }
      />

      <Link
        href={role === "worker" ? "/worker" : "/"}
        className="text-center text-sm font-semibold text-emerald-700"
      >
        Về trang chủ
      </Link>
    </div>
  );
}

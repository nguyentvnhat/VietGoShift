"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { useSession } from "@/hooks/useSession";
import { STATUS_LABEL } from "@/lib/orders";
import { getService } from "@/lib/services";

export function RecentOrders({ showEmpty = false }: { showEmpty?: boolean }) {
  const { userId, role } = useSession();
  const orders = useOrders().filter((o) =>
    role === "worker" ? o.workerId === userId : o.customerId === userId,
  );
  if (orders.length === 0) {
    return showEmpty ? (
      <p className="py-10 text-center text-sm text-slate-500">Chưa có đơn nào.</p>
    ) : null;
  }

  return (
    <section>
      <h2 className="mb-2 font-semibold">Đơn của bạn</h2>
      <ul className="flex flex-col gap-2">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              href={o.status === "completed" ? `/demo/complete/${o.id}` : `/demo/tracking/${o.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-3 text-sm ring-1 ring-slate-100"
            >
              <span>
                {getService(o.serviceId)?.icon} {getService(o.serviceId)?.name}
                <span className="ml-1 text-slate-400">#{o.id}</span>
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {STATUS_LABEL[o.status]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

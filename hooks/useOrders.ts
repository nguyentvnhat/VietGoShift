"use client";

import { useSyncExternalStore } from "react";
import { orderStore } from "@/lib/order-store";
import type { Order } from "@/lib/orders";

export function useOrders(): Order[] {
  return useSyncExternalStore(
    orderStore.subscribe,
    orderStore.getSnapshot,
    orderStore.getServerSnapshot,
  );
}

/** undefined = chưa hydrate xong (server), null = không tìm thấy. */
export function useOrder(id: string): Order | null | undefined {
  const orders = useOrders();
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return undefined;
  return orders.find((o) => o.id === id) ?? null;
}

const noopSubscribe = () => () => {};

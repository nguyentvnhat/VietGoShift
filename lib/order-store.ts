"use client";

import type { BookingInput } from "@/schemas/booking";
import { getService } from "./services";
import type { Order } from "./orders";

// In-memory cache + localStorage. Sự kiện "storage" đồng bộ giữa các tab
// (vd: tab thợ bấm check-in → tab khách cập nhật ngay).
const KEY = "vgs:orders";
const EMPTY: Order[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedOrders: Order[] = EMPTY;

function read(): Order[] {
  const raw = localStorage.getItem(KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedOrders = raw ? (JSON.parse(raw) as Order[]) : EMPTY;
  }
  return cachedOrders;
}

function write(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
  listeners.forEach((l) => l());
}

export const orderStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key === KEY && listener();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot: read,
  getServerSnapshot: () => EMPTY,

  create(input: BookingInput, customerId: string): Order {
    const now = new Date().toISOString();
    const order: Order = {
      ...input,
      id: crypto.randomUUID().slice(0, 8),
      customerId,
      status: "booked",
      total: (getService(input.serviceId)?.pricePerHour ?? 0) * input.hours,
      createdAt: now,
      history: [{ status: "booked", at: now }],
    };
    write([order, ...read()]);
    return order;
  },

  update(id: string, fn: (order: Order) => Order) {
    write(read().map((o) => (o.id === id ? fn(o) : o)));
  },
};

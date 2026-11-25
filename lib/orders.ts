import type { BookingInput } from "@/schemas/booking";
import type { Handover } from "@/schemas/handover";
import type { Review } from "@/schemas/review";
import type { ScanAction } from "./scan-token";

export const ORDER_STATUSES = [
  "booked",
  "accepted",
  "on_the_way",
  "checked_in",
  "in_progress",
  "completed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  booked: "Đã đặt",
  accepted: "Thợ đã nhận",
  on_the_way: "Đang đến",
  checked_in: "Đã check-in",
  in_progress: "Đang làm",
  completed: "Hoàn thành",
};

// Nút bấm thường của thợ. Check-in (on_the_way) và check-out (in_progress) phải quét QR của khách.
export const WORKER_ACTION: Partial<Record<OrderStatus, string>> = {
  booked: "Nhận đơn",
  accepted: "Bắt đầu di chuyển",
  checked_in: "Bắt đầu làm",
};

// Trạng thái hiện tại → hành động QR để sang bước kế tiếp.
export const SCAN_STEP: Partial<Record<OrderStatus, ScanAction>> = {
  on_the_way: "check_in",
  in_progress: "check_out",
};

/** Thời gian di chuyển giả lập khi thợ bắt đầu đi. */
export const ETA_MINUTES = 15;

export type Warranty = { description: string; status: "processing"; createdAt: string };

export type Order = BookingInput & {
  id: string;
  customerId: string;
  workerId?: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  history: { status: OrderStatus; at: string }[];
  etaAt?: string;
  handover?: Handover;
  customerReview?: Review;
  workerReview?: Review;
  warranty?: Warranty;
};

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const i = ORDER_STATUSES.indexOf(status);
  return ORDER_STATUSES[i + 1] ?? null;
}

export function advanceOrder(
  order: Order,
  workerId: string,
  now = new Date(),
  patch: Partial<Pick<Order, "handover">> = {},
): Order {
  const next = nextStatus(order.status);
  if (!next) return order;
  return {
    ...order,
    ...patch,
    status: next,
    workerId: order.workerId ?? workerId,
    ...(next === "on_the_way" && {
      etaAt: new Date(now.getTime() + ETA_MINUTES * 60_000).toISOString(),
    }),
    history: [...order.history, { status: next, at: now.toISOString() }],
  };
}

export function statusTime(order: Order, status: OrderStatus): Date | undefined {
  const at = order.history.find((h) => h.status === status)?.at;
  return at ? new Date(at) : undefined;
}

/** Số phút làm thực tế: từ check-in đến check-out (quét QR hoàn thành). */
export function workedMinutes(order: Order): number | null {
  const start = statusTime(order, "checked_in");
  const end = statusTime(order, "completed");
  if (!start || !end) return null;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

/** Số phút còn lại tới giờ đến dự kiến (không âm). */
export function etaMinutesLeft(order: Order, now = new Date()): number | null {
  if (!order.etaAt) return null;
  return Math.max(0, Math.round((new Date(order.etaAt).getTime() - now.getTime()) / 60_000));
}

/** Kiểm tra mã QR đã xác thực có áp dụng được cho đơn này không. Trả về lỗi hoặc null. */
export function scanError(
  order: Order | undefined,
  action: ScanAction,
  workerId: string,
): string | null {
  if (!order) return "Không tìm thấy đơn của mã này";
  if (order.workerId !== workerId) return "Đơn này không được giao cho bạn";
  if (SCAN_STEP[order.status] !== action) {
    return action === "check_in" ? "Đơn không ở bước check-in" : "Đơn không ở bước check-out";
  }
  if (action === "check_out" && !order.handover) return "Cần gửi bàn giao trước khi check-out";
  return null;
}

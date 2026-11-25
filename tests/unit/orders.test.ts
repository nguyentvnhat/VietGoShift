import { describe, expect, it } from "vitest";
import { advanceOrder, etaMinutesLeft, nextStatus, workedMinutes, type Order } from "@/lib/orders";
import { createSessionToken, verifySessionToken } from "@/lib/session";

const order: Order = {
  id: "abc12345",
  customerId: "cus-001",
  serviceId: "cleaning",
  date: "2099-01-15",
  startTime: "08:00",
  hours: 4,
  address: "12 Nguyễn Huệ, Quận 1",
  phone: "0901234567",
  status: "booked",
  total: 320_000,
  createdAt: "2099-01-01T00:00:00.000Z",
  history: [{ status: "booked", at: "2099-01-01T00:00:00.000Z" }],
};

describe("order status flow", () => {
  it("walks through all statuses in order", () => {
    const seen = [];
    let o = order;
    while (nextStatus(o.status)) {
      o = advanceOrder(o, "wrk-001");
      seen.push(o.status);
    }
    expect(seen).toEqual(["accepted", "on_the_way", "checked_in", "in_progress", "completed"]);
    expect(o.workerId).toBe("wrk-001");
    expect(o.history).toHaveLength(6);
  });

  it("does not advance past completed", () => {
    const done = { ...order, status: "completed" as const };
    expect(advanceOrder(done, "wrk-001")).toBe(done);
  });
});

describe("check-out, ETA và thời gian làm", () => {
  const at = (hhmm: string) => new Date(`2099-01-15T${hhmm}:00`);

  it("sets ETA 15 minutes after starting to travel", () => {
    const accepted = advanceOrder(order, "wrk-001", at("07:30"));
    const onTheWay = advanceOrder(accepted, "wrk-001", at("07:40"));
    expect(new Date(onTheWay.etaAt!).getTime()).toBe(at("07:55").getTime());
    expect(etaMinutesLeft(onTheWay, at("07:50"))).toBe(5);
    expect(etaMinutesLeft(onTheWay, at("08:10"))).toBe(0);
  });

  it("stores handover on check-out and computes worked minutes", () => {
    let o: Order = { ...order, status: "on_the_way" };
    o = advanceOrder(o, "wrk-001", at("08:00")); // checked_in
    o = advanceOrder(o, "wrk-001", at("08:05")); // in_progress
    expect(workedMinutes(o)).toBeNull();
    o = advanceOrder(o, "wrk-001", at("11:20"), { handover: { note: "Đã xong", photos: [] } });
    expect(o.status).toBe("completed");
    expect(o.handover?.note).toBe("Đã xong");
    expect(workedMinutes(o)).toBe(200);
  });
});

describe("session JWT", () => {
  it("round-trips userId and role", async () => {
    const token = await createSessionToken({ userId: "wrk-001", role: "worker" });
    expect(await verifySessionToken(token)).toEqual({ userId: "wrk-001", role: "worker" });
  });

  it("rejects tampered or missing tokens", async () => {
    const token = await createSessionToken({ userId: "cus-001", role: "customer" });
    expect(await verifySessionToken(token.slice(0, -2) + "xx")).toBeNull();
    expect(await verifySessionToken(undefined)).toBeNull();
  });
});

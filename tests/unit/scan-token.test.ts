import { describe, expect, it } from "vitest";
import { scanError, type Order } from "@/lib/orders";
import { SCAN_TOKEN_TTL_SECONDS, createScanToken, verifyScanToken } from "@/lib/scan-token";
import { createSessionToken } from "@/lib/session";

const claims = { orderId: "abc12345", action: "check_in" as const, customerId: "cus-001" };

describe("scan token (QR)", () => {
  it("round-trips order, action and customer", async () => {
    const token = await createScanToken(claims);
    expect(await verifyScanToken(token)).toEqual(claims);
  });

  it("expires after the TTL", async () => {
    const issued = new Date("2099-01-15T08:00:00Z");
    const token = await createScanToken(claims, issued);
    const later = new Date(issued.getTime() + (SCAN_TOKEN_TTL_SECONDS + 1) * 1000);
    expect(await verifyScanToken(token, issued)).toEqual(claims);
    expect(await verifyScanToken(token, later)).toBeNull();
  });

  it("rejects tampered tokens and session tokens", async () => {
    const token = await createScanToken(claims);
    expect(await verifyScanToken(token.slice(0, -2) + "xx")).toBeNull();
    // Cùng secret nhưng khác audience → không dùng session JWT làm mã QR được.
    const session = await createSessionToken({ userId: "cus-001", role: "customer" });
    expect(await verifyScanToken(session)).toBeNull();
  });
});

describe("scanError", () => {
  const base: Order = {
    id: "abc12345",
    customerId: "cus-001",
    workerId: "wrk-001",
    serviceId: "electric",
    date: "2099-01-15",
    startTime: "08:00",
    hours: 4,
    address: "12 Nguyễn Huệ, Quận 1",
    phone: "0901234567",
    status: "on_the_way",
    total: 320_000,
    createdAt: "2099-01-01T00:00:00.000Z",
    history: [],
  };

  it("allows check-in only while on the way, for the assigned worker", () => {
    expect(scanError(base, "check_in", "wrk-001")).toBeNull();
    expect(scanError(base, "check_in", "wrk-999")).toMatch(/không được giao/);
    expect(scanError(base, "check_out", "wrk-001")).toMatch(/check-out/);
    // Quét lại mã check-in sau khi đã check-in → bị chặn.
    expect(scanError({ ...base, status: "checked_in" }, "check_in", "wrk-001")).toMatch(/check-in/);
  });

  it("requires handover before check-out", () => {
    const working = { ...base, status: "in_progress" as const };
    expect(scanError(working, "check_out", "wrk-001")).toMatch(/bàn giao/);
    expect(
      scanError({ ...working, handover: { note: "Đã xong", photos: [] } }, "check_out", "wrk-001"),
    ).toBeNull();
  });
});

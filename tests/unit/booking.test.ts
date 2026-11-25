import { describe, expect, it } from "vitest";
import { bookingSchema, bookingStepSchemas, isValidSlot, toFieldErrors } from "@/schemas/booking";

const valid = {
  serviceId: "cleaning",
  date: "2099-01-15",
  startTime: "08:00",
  hours: "4",
  address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
  phone: "0901234567",
  note: "",
};

describe("bookingSchema", () => {
  it("accepts a valid booking and coerces hours to number", () => {
    const result = bookingSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.hours).toBe(4);
  });

  it.each([
    ["serviceId", { serviceId: "massage" }],
    ["hours", { hours: "1" }],
    ["hours", { hours: "9" }],
    ["address", { address: "Q1" }],
    ["phone", { phone: "12345" }],
    ["phone", { phone: "0201234567" }],
    ["startTime", { startTime: "25:00" }],
  ])("rejects invalid %s", (field, patch) => {
    const result = bookingSchema.safeParse({ ...valid, ...patch });
    expect(result.success).toBe(false);
    expect(toFieldErrors(result.error!)).toHaveProperty(field);
  });

  it("accepts +84 phone format", () => {
    expect(bookingSchema.safeParse({ ...valid, phone: "+84912345678" }).success).toBe(true);
  });

  it("rejects a slot in the past", () => {
    const result = bookingSchema.safeParse({ ...valid, date: "2000-01-01" });
    expect(result.success).toBe(false);
    expect(toFieldErrors(result.error!).startTime).toMatch(/ít nhất 60 phút/);
  });
});

describe("isValidSlot", () => {
  const now = new Date("2026-11-25T08:00:00");
  it("requires at least 60 minutes lead time", () => {
    expect(isValidSlot("2026-11-25", "08:59", now)).toBe(false);
    expect(isValidSlot("2026-11-25", "09:00", now)).toBe(true);
  });
});

describe("bookingStepSchemas", () => {
  it("validates only the fields of the current step", () => {
    expect(bookingStepSchemas[0].safeParse({ serviceId: "kitchen" }).success).toBe(true);
    expect(bookingStepSchemas[2].safeParse({ address: "", phone: "" }).success).toBe(false);
  });
});

describe("handoverSchema", () => {
  it("requires a note and at most 3 photos", async () => {
    const { handoverSchema } = await import("@/schemas/handover");
    const photo = "data:image/jpeg;base64,AAA";
    expect(handoverSchema.safeParse({ note: "Đã dọn xong", photos: [photo] }).success).toBe(true);
    expect(handoverSchema.safeParse({ note: "ok", photos: [] }).success).toBe(false);
    expect(
      handoverSchema.safeParse({ note: "Đã dọn xong", photos: Array(4).fill(photo) }).success,
    ).toBe(false);
    expect(handoverSchema.safeParse({ note: "Đã dọn xong", photos: ["http://x"] }).success).toBe(
      false,
    );
  });
});

import { z } from "zod";
import { SERVICE_IDS } from "@/lib/services";

export const MIN_LEAD_MINUTES = 60;

export const bookingFieldsSchema = z.object({
  serviceId: z.enum(SERVICE_IDS, { error: "Vui lòng chọn dịch vụ" }),
  date: z.iso.date({ error: "Vui lòng chọn ngày" }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Vui lòng chọn giờ bắt đầu" }),
  hours: z.coerce
    .number({ error: "Số giờ không hợp lệ" })
    .int({ error: "Số giờ phải là số nguyên" })
    .min(2, { error: "Tối thiểu 2 giờ/ca" })
    .max(8, { error: "Tối đa 8 giờ/ca" }),
  address: z
    .string()
    .trim()
    .min(10, { error: "Địa chỉ quá ngắn (tối thiểu 10 ký tự)" })
    .max(200, { error: "Địa chỉ quá dài" }),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)(3|5|7|8|9)\d{8}$/, { error: "Số điện thoại Việt Nam không hợp lệ" }),
  note: z.string().trim().max(200, { error: "Ghi chú tối đa 200 ký tự" }).optional(),
});

/** Ca làm phải bắt đầu sau thời điểm `now` ít nhất MIN_LEAD_MINUTES phút. */
export function isValidSlot(date: string, startTime: string, now = new Date()): boolean {
  const start = new Date(`${date}T${startTime}:00`);
  return start.getTime() - now.getTime() >= MIN_LEAD_MINUTES * 60_000;
}

const slotRefinement = {
  error: `Ca làm phải bắt đầu sau ít nhất ${MIN_LEAD_MINUTES} phút kể từ bây giờ`,
  path: ["startTime"],
};

export const bookingSchema = bookingFieldsSchema.refine(
  (v) => isValidSlot(v.date, v.startTime),
  slotRefinement,
);

export type BookingInput = z.infer<typeof bookingSchema>;

// Schema cho từng bước của luồng đặt lịch.
export const bookingStepSchemas = [
  bookingFieldsSchema.pick({ serviceId: true }),
  bookingFieldsSchema
    .pick({ date: true, startTime: true, hours: true })
    .refine((v) => isValidSlot(v.date, v.startTime), slotRefinement),
  bookingFieldsSchema.pick({ address: true, phone: true, note: true }),
  bookingSchema,
] as const;

/** Chuyển ZodError thành map { field: message } (lấy lỗi đầu tiên mỗi field). */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

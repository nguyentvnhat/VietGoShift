import { z } from "zod";

export const MAX_HANDOVER_PHOTOS = 3;

export const handoverSchema = z.object({
  note: z
    .string()
    .trim()
    .min(5, { error: "Vui lòng ghi chú công việc đã làm (tối thiểu 5 ký tự)" })
    .max(300, { error: "Ghi chú tối đa 300 ký tự" }),
  photos: z
    .array(z.string().startsWith("data:image/"))
    .max(MAX_HANDOVER_PHOTOS, { error: `Tối đa ${MAX_HANDOVER_PHOTOS} ảnh` }),
});
export type Handover = z.infer<typeof handoverSchema>;

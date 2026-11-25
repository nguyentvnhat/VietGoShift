import { z } from "zod";

export const reviewSchema = z.object({
  stars: z.number().int().min(1, { error: "Vui lòng chọn số sao" }).max(5),
  comment: z.string().trim().max(200, { error: "Nhận xét tối đa 200 ký tự" }),
});
export type Review = z.infer<typeof reviewSchema>;

export const warrantySchema = z.object({
  description: z
    .string()
    .trim()
    .min(10, { error: "Vui lòng mô tả vấn đề (tối thiểu 10 ký tự)" })
    .max(500, { error: "Mô tả tối đa 500 ký tự" }),
});

"use client";

import { useState } from "react";
import { resizeImage } from "@/lib/image";
import { toFieldErrors } from "@/schemas/booking";
import { MAX_HANDOVER_PHOTOS, handoverSchema, type Handover } from "@/schemas/handover";
import { Button, Field, inputClass } from "./ui";

export function HandoverForm({ onSubmit }: { onSubmit: (handover: Handover) => void }) {
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string>();

  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_HANDOVER_PHOTOS - photos.length;
    const resized = await Promise.all([...files].slice(0, room).map((f) => resizeImage(f)));
    setPhotos((p) => [...p, ...resized]);
  }

  function submit() {
    const result = handoverSchema.safeParse({ note, photos });
    if (!result.success) return setError(Object.values(toFieldErrors(result.error))[0]);
    onSubmit(result.data);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-3">
      <p className="text-sm font-semibold">Bàn giao cho khách trước khi check-out</p>
      <Field label="Ghi chú công việc đã làm" error={error}>
        <textarea
          rows={2}
          className={inputClass}
          placeholder="Đã lau sàn, dọn bếp, đổ rác..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <div key={i} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL cục bộ */}
            <img
              src={src}
              alt={`Ảnh bàn giao ${i + 1}`}
              className="size-16 rounded-lg object-cover"
            />
            <button
              type="button"
              aria-label="Xoá ảnh"
              onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-slate-800 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < MAX_HANDOVER_PHOTOS && (
          <label className="flex size-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
            📷
            <span>Thêm ảnh</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="sr-only"
              onChange={(e) => addPhotos(e.target.files)}
            />
          </label>
        )}
      </div>
      <Button onClick={submit}>Gửi bàn giao</Button>
    </div>
  );
}

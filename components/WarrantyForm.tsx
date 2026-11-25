"use client";

import { useState } from "react";
import type { Warranty } from "@/lib/orders";
import { warrantySchema } from "@/schemas/review";
import { Button, inputClass } from "./ui";

type Props = {
  warranty?: Warranty;
  canRequest: boolean;
  onSubmit: (description: string) => void;
};

export function WarrantyForm({ warranty, canRequest, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string>();

  if (warranty) {
    return (
      <div className="rounded-xl bg-amber-50 p-3 text-sm ring-1 ring-amber-200">
        <p className="font-semibold text-amber-900">Yêu cầu bảo hành: Đang xử lý</p>
        <p className="text-amber-800">{warranty.description}</p>
      </div>
    );
  }

  if (!canRequest) return null;

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Yêu cầu bảo hành
      </Button>
    );
  }

  function submit() {
    const result = warrantySchema.safeParse({ description });
    if (!result.success) return setError(result.error.issues[0]?.message);
    onSubmit(result.data.description);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700" htmlFor="warranty">
        Mô tả vấn đề
      </label>
      <textarea
        id="warranty"
        rows={3}
        className={inputClass}
        placeholder="Ví dụ: Khu vực bếp chưa được lau sạch..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" className="w-1/3" onClick={() => setOpen(false)}>
          Huỷ
        </Button>
        <Button onClick={submit}>Gửi yêu cầu</Button>
      </div>
    </div>
  );
}

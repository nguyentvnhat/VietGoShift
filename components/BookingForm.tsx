"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { orderStore } from "@/lib/order-store";
import { formatSlot, formatVnd } from "@/lib/format";
import { SERVICES, getService } from "@/lib/services";
import { useSession } from "@/hooks/useSession";
import { bookingSchema, bookingStepSchemas, toFieldErrors } from "@/schemas/booking";
import { Button, Card, Field, inputClass } from "./ui";

const STEPS = ["Dịch vụ", "Thời gian", "Địa chỉ", "Xác nhận"];

type Draft = {
  serviceId: string;
  date: string;
  startTime: string;
  hours: string;
  address: string;
  phone: string;
  note: string;
};

export function BookingForm({ initialServiceId }: { initialServiceId?: string }) {
  const router = useRouter();
  const { userId } = useSession();
  const [step, setStep] = useState(initialServiceId && getService(initialServiceId) ? 1 : 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Draft>({
    serviceId: initialServiceId ?? "",
    date: "",
    startTime: "08:00",
    hours: "4",
    address: "",
    phone: "",
    note: "",
  });

  const set = (key: keyof Draft) => (e: { target: { value: string } }) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  function next() {
    const result = bookingStepSchemas[step].safeParse(draft);
    if (!result.success) return setErrors(toFieldErrors(result.error));
    setErrors({});
    setStep((s) => s + 1);
  }

  function submit() {
    const result = bookingSchema.safeParse(draft);
    if (!result.success) return setErrors(toFieldErrors(result.error));
    const order = orderStore.create(result.data, userId);
    router.push(`/tracking/${order.id}`);
  }

  const service = getService(draft.serviceId);

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex gap-1" aria-label="Các bước đặt lịch">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div className={`h-1 rounded ${i <= step ? "bg-emerald-600" : "bg-slate-200"}`} />
            <span
              className={`text-[11px] ${i === step ? "font-semibold text-emerald-700" : "text-slate-500"}`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-semibold">Chọn dịch vụ</legend>
          {SERVICES.map((s) => (
            <label
              key={s.id}
              className={`flex items-center gap-3 rounded-xl p-3 ring-1 ${
                draft.serviceId === s.id
                  ? "bg-emerald-50 ring-emerald-500"
                  : "bg-white ring-slate-200"
              }`}
            >
              <input
                type="radio"
                name="serviceId"
                value={s.id}
                checked={draft.serviceId === s.id}
                onChange={set("serviceId")}
                className="accent-emerald-600"
              />
              <span className="text-xl">{s.icon}</span>
              <span className="flex-1 font-medium">{s.name}</span>
              <span className="text-sm text-slate-500">{formatVnd(s.pricePerHour)}/h</span>
            </label>
          ))}
          {errors.serviceId && (
            <p role="alert" className="text-xs text-red-600">
              {errors.serviceId}
            </p>
          )}
        </fieldset>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-3">
          <Field label="Ngày làm" error={errors.date}>
            <input type="date" className={inputClass} value={draft.date} onChange={set("date")} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Giờ bắt đầu" error={errors.startTime}>
              <input
                type="time"
                className={inputClass}
                value={draft.startTime}
                onChange={set("startTime")}
              />
            </Field>
            <Field label="Số giờ (2–8)" error={errors.hours}>
              <input
                type="number"
                min={2}
                max={8}
                inputMode="numeric"
                className={inputClass}
                value={draft.hours}
                onChange={set("hours")}
              />
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-3">
          <Field label="Địa chỉ làm việc" error={errors.address}>
            <input
              className={inputClass}
              placeholder="Số nhà, đường, phường, quận..."
              value={draft.address}
              onChange={set("address")}
            />
          </Field>
          <Field label="Số điện thoại" error={errors.phone}>
            <input
              type="tel"
              inputMode="tel"
              className={inputClass}
              placeholder="0901234567"
              value={draft.phone}
              onChange={set("phone")}
            />
          </Field>
          <Field label="Ghi chú cho thợ (tuỳ chọn)" error={errors.note}>
            <textarea rows={2} className={inputClass} value={draft.note} onChange={set("note")} />
          </Field>
        </div>
      )}

      {step === 3 && service && (
        <Card>
          <h2 className="mb-3 font-semibold">Xác nhận đơn</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-slate-500">Dịch vụ</dt>
            <dd>
              {service.icon} {service.name}
            </dd>
            <dt className="text-slate-500">Thời gian</dt>
            <dd>
              {formatSlot(draft.date, draft.startTime)} · {draft.hours} giờ
            </dd>
            <dt className="text-slate-500">Địa chỉ</dt>
            <dd>{draft.address}</dd>
            <dt className="text-slate-500">SĐT</dt>
            <dd>{draft.phone}</dd>
            {draft.note && (
              <>
                <dt className="text-slate-500">Ghi chú</dt>
                <dd>{draft.note}</dd>
              </>
            )}
          </dl>
          <div className="mt-4 flex justify-between border-t border-slate-100 pt-3 font-semibold">
            <span>Tạm tính</span>
            <span className="text-emerald-700">
              {formatVnd(service.pricePerHour * Number(draft.hours))}
            </span>
          </div>
          {Object.values(errors)[0] && (
            <p role="alert" className="mt-2 text-xs text-red-600">
              {Object.values(errors)[0]}
            </p>
          )}
        </Card>
      )}

      <div className="sticky bottom-0 -mx-4 flex gap-2 bg-slate-50/95 px-4 py-3 backdrop-blur">
        {step > 0 && (
          <Button
            variant="secondary"
            className="w-1/3"
            onClick={() => {
              setErrors({});
              setStep((s) => s - 1);
            }}
          >
            Quay lại
          </Button>
        )}
        {step < 3 ? (
          <Button onClick={next}>Tiếp tục</Button>
        ) : (
          <Button onClick={submit}>Xác nhận đặt</Button>
        )}
      </div>
    </div>
  );
}

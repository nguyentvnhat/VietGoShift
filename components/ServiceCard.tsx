import Link from "next/link";
import { formatVnd } from "@/lib/format";
import type { Service } from "@/lib/services";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-3xl">
        {service.icon}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <h2 className="font-semibold text-slate-900">{service.name}</h2>
        <p className="text-sm text-slate-600">{service.description}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold whitespace-nowrap text-emerald-700">
            từ {formatVnd(service.pricePerHour)}/giờ
          </span>
          <Link
            href={`/demo/booking?service=${service.id}`}
            className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white active:bg-emerald-700"
          >
            Đặt ngay
          </Link>
        </div>
      </div>
    </article>
  );
}

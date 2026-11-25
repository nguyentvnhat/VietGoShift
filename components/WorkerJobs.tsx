"use client";

import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { orderStore } from "@/lib/order-store";
import { SCAN_STEP, STATUS_LABEL, WORKER_ACTION, advanceOrder, type Order } from "@/lib/orders";
import { HandoverForm } from "./HandoverForm";
import { HandoverSummary } from "./HandoverSummary";
import { OrderSummary } from "./OrderSummary";
import { ScanButton } from "./ScanButton";
import { Button, Card } from "./ui";

export function WorkerJobs({ workerId }: { workerId: string }) {
  // Đơn mới chưa ai nhận + đơn đã gán cho thợ này.
  const jobs = useOrders().filter((o) => o.status === "booked" || o.workerId === workerId);

  if (jobs.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        Chưa có đơn nào. Hãy đặt một đơn ở vai Khách.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {jobs.map((job) => (
        <li key={job.id}>
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">#{job.id}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                {STATUS_LABEL[job.status]}
              </span>
            </div>
            <OrderSummary order={job} />
            {job.note && (
              <p className="rounded-lg bg-slate-50 p-2 text-sm text-slate-600">📝 {job.note}</p>
            )}
            <JobAction job={job} workerId={workerId} />
          </Card>
        </li>
      ))}
    </ul>
  );
}

function JobAction({ job, workerId }: { job: Order; workerId: string }) {
  const scan = SCAN_STEP[job.status];
  const action = WORKER_ACTION[job.status];

  if (job.status === "in_progress" && !job.handover) {
    return (
      <HandoverForm
        onSubmit={(handover) => orderStore.update(job.id, (o) => ({ ...o, handover }))}
      />
    );
  }
  if (scan) {
    return (
      <>
        {job.handover && <HandoverSummary order={job} />}
        <p className="text-center text-xs text-slate-500">
          {scan === "check_in"
            ? "Tới nơi, nhờ khách mở mã check-in để quét"
            : "Nhờ khách kiểm tra bàn giao rồi mở mã check-out để quét"}
        </p>
        <ScanButton order={job} action={scan} workerId={workerId} />
      </>
    );
  }
  if (action) {
    return (
      <Button onClick={() => orderStore.update(job.id, (o) => advanceOrder(o, workerId))}>
        {action}
      </Button>
    );
  }
  return (
    <Link
      href={`/demo/complete/${job.id}`}
      className="text-center text-sm font-semibold text-emerald-700"
    >
      Đánh giá khách hàng
    </Link>
  );
}

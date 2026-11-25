import { WorkerJobs } from "@/components/WorkerJobs";
import { getSession } from "@/lib/session-server";

export default async function WorkerPage() {
  const session = await getSession();

  if (session?.role !== "worker") {
    return (
      <div className="py-16 text-center text-sm text-slate-600">
        Trang dành cho thợ. Bấm <b>“đổi vai”</b> ở góc phải để chuyển sang vai trò Thợ.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">Việc của tôi</h1>
      <WorkerJobs workerId={session.userId} />
    </div>
  );
}

export type WorkerProfile = {
  id: string;
  name: string;
  phone: string;
  rating: number;
  completedJobs: number;
  avatar: string;
};

// Hồ sơ thợ demo — sau này lấy từ backend.
const WORKERS: WorkerProfile[] = [
  {
    id: "wrk-001",
    name: "Nguyễn Văn An",
    phone: "0912345678",
    rating: 4.8,
    completedJobs: 126,
    avatar: "👷",
  },
];

export function getWorker(id: string | undefined): WorkerProfile | undefined {
  return WORKERS.find((w) => w.id === id);
}

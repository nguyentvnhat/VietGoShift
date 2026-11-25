const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function formatVnd(amount: number): string {
  return vnd.format(amount);
}

export function formatSlot(date: string, startTime: string): string {
  const [y, m, d] = date.split("-");
  return `${startTime} · ${d}/${m}/${y}`;
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
}

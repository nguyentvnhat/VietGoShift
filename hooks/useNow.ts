"use client";

import { useEffect, useState } from "react";

/** Thời điểm hiện tại, tự cập nhật mỗi `intervalMs`. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

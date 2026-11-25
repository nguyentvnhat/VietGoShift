"use client";

import { useState } from "react";
import { redeemScanToken } from "@/app/actions";
import { orderStore } from "@/lib/order-store";
import { advanceOrder, scanError, type Order } from "@/lib/orders";
import type { ScanAction } from "@/lib/scan-token";
import { QrScanner } from "./QrScanner";
import { Button } from "./ui";

const LABEL: Record<ScanAction, string> = {
  check_in: "Quét QR check-in",
  check_out: "Quét QR check-out",
};

export function ScanButton({
  order,
  action,
  workerId,
}: {
  order: Order;
  action: ScanAction;
  workerId: string;
}) {
  const [open, setOpen] = useState(false);

  async function handleScan(text: string): Promise<string | null> {
    const result = await redeemScanToken(text);
    if (!result.ok) return result.error;
    const { orderId, action: scanned } = result.claims;
    if (orderId !== order.id) return "Mã này thuộc đơn khác";
    if (scanned !== action)
      return action === "check_in" ? "Đây là mã check-out" : "Đây là mã check-in";
    const target = orderStore.getSnapshot().find((o) => o.id === orderId);
    const err = scanError(target, scanned, workerId);
    if (err) return err;
    orderStore.update(orderId, (o) => advanceOrder(o, workerId));
    setOpen(false);
    return null;
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>📷 {LABEL[action]}</Button>
      {open && (
        <QrScanner title={LABEL[action]} onScan={handleScan} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
